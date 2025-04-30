import { NodeHtmlMarkdown } from 'node-html-markdown'
import * as cheerio from "cheerio"
import {decode} from 'html-entities';
import { createEvent } from 'integrations/directus'
import { DATA_SOURCE_LOOKUP } from 'utils/constants'

const markdown = new NodeHtmlMarkdown()

export const importExploreWaterlooEvents = async (source) => {
  const endpoint = "https://explorewaterloo.ca/wp-admin/admin-ajax.php?action=tribe_events_views_v2_fallback"
  try {
    const today = new Date()
    const thisMonth = today.getMonth() + 1
    const thisYear = today.getFullYear()
    const response = await fetch(endpoint, {
      method: "POST",
      body: `url=${encodeURIComponent('https://explorewaterloo.ca/events/month/')}&view_data%5Btribe-bar-date%5D=${thisYear}-${thisMonth}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
    })

    console.log(`API response: ${response.status} ${response.statusText}`)

    if (response.status !== 200) {
      throw Error(`API call failed: ${response.status} ${response.statusText}`)
    } 

    const body = await response.text()
    const $ = cheerio.load(body);
    const data = $('script[type=application/ld+json]').text()
    const json = JSON.parse(data)
    const dataSourceId = DATA_SOURCE_LOOKUP.find(s => s.name == source)?.id || 6 // Other
    const linkText = `${source} event page`

    const events = json.map(event => {
      const title = event.name?.replace(/&#(\d+);/g, (m, d) => String.fromCharCode(d))
      const originalDescription = event.description
      const decoded = decode(originalDescription)
      const cleaned = decoded.replace(/&#(\d+);/g, (m, d) => String.fromCharCode(d))
      const uriDecoded = decodeURIComponent(cleaned)
      const trimmed = uriDecoded.replace(/\\n|\\/g, "")
      const description = markdown.translate(trimmed)
      const location_source_text = event.location?.name ? [event.location.name,event.location.address?.streetAddress].join(", ").replace(/&#(\d+);/g, (m, d) => String.fromCharCode(d)) : null
    
      return {
        title: title,
        description: description,
        starts_at: event.startDate,
        ends_at: event.endDate,
        external_link: event.url,
        link_text: linkText,
        data_source: dataSourceId,
        location_source_text: location_source_text,
        image_url: event.image,
      }
    })

    const results = await saveToDatabase(events, source)
    return results

  } catch (error) {
    console.log(error)
    return null
  }
}

export const importWaterlooPublicLibraryEvents = async (source) => {
  const today = new Date()
  const dateString = `${today.getFullYear()}-${(today.getMonth() + 1)}-${today.getDate()}`
  const dataSourceId = DATA_SOURCE_LOOKUP.find(s => s.name === source).id

  const endpoint = `https://calendar.wpl.ca/eeventcaldata?event_type=0&req=%7B%22private%22%3Afalse%2C%22date%22%3A%22${dateString}%22%2C%22days%22%3A31%2C%22locations%22%3A%5B%5D%2C%22ages%22%3A%5B%5D%2C%22types%22%3A%5B%22Author%2520Events%22%2C%22Community%2520Events%22%2C%22Special%2520Events%22%5D%7D`
  const response = await fetch(endpoint)

  if (response.status !== 200) {
    throw Error(`API call failed: ${response.status} ${response.statusText}`)
  } 

  const data = await response.json()
  const upcomingEvents = data.filter(item => {
    const registrationCloses = new Date(item.close_registration)
    return registrationCloses > today
  })

  const events = upcomingEvents.map(event => {
    const locationName = `WPL ${event.location}`
    const description = markdown.translate(event.long_description)
    const startDate = new Date(event.event_start)
    const endDate = new Date(event.event_end)
    const price = (event.registration_cost === "0") ? "Free" : event.registration_cost
    const url = `https://wpl.libnet.info/event/${event.id}`
    const image_url = `https://static.libnet.info/images/events/wpl/${event.event_image}`
    const linkText = `${source} event page`
    
    return {
      title: event.title,
      description: description,
      starts_at: startDate.toISOString(),
      ends_at: endDate.toISOString(),
      location_source_text: locationName,
      external_link: url,
      link_text: linkText,
      price: price,
      image_url: image_url,
      data_source: dataSourceId,
    }
  })
  const results = await saveToDatabase(events, source)
  return results
}

const saveToDatabase = async(events, source) => {

  const created = []
  const failed = []

  const promises = events.map(async(event) => {
    try {
      const result = await createEvent(event)

      if (result) {
        created.push(result)
      } else {
        failed.push({ ...event, error: "Unable to create event"})
      }

    } catch (error) {
      console.log(error)
      failed.push({ ...event, error})
      return error
    }

  })

  const results = await Promise.all(promises)
  console.log(`Processed ${results.length} events`)

  return { created, failed, source }
}



