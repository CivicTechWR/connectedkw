import { NodeHtmlMarkdown } from 'node-html-markdown'
import { DateTime } from 'luxon'
import * as cheerio from "cheerio"
import {decode} from 'html-entities';
import { createEvent } from 'integrations/directus'

const markdown = new NodeHtmlMarkdown()
// const EVENTS_ENDPOINT = "https://explorewaterloo.ca/wp-json/tribe/events/v1/events"
const EVENTS_ENDPOINT = "https://explorewaterloo.ca/wp-admin/admin-ajax.php?action=tribe_events_views_v2_fallback"
// const tag_lookup = {
//   "cycling": 21, 
//   "arts-culture-heritage-live-performance": [1,6,9],
//   "festivals": 10,
//   "food-drink": 11,
//   "outdoor-recreation": 21,
//   "shopping": 20,
//   "sports": 21,
// }

const defaultLinkText = 'Explore Waterloo event page'
const data_source_id = 5

export const importExploreWaterlooEvents = async (endpoint=EVENTS_ENDPOINT) => {
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

    const results = await saveToDatabase(json)
    return results

  } catch (error) {
    console.log(error)
    return null
  }
}

const saveToDatabase = async(events) => {

  const created = []
  const failed = []

  const promises = events.map(async(event) => {
    try {
      const title = event.name?.replace(/&#(\d+);/g, (m, d) => String.fromCharCode(d))
      const originalDescription = event.description
      const decoded = decode(originalDescription)
      const cleaned = decoded.replace(/&#(\d+);/g, (m, d) => String.fromCharCode(d))
      const uriDecoded = decodeURIComponent(cleaned)
      const trimmed = uriDecoded.replace(/\\n|\\/g, "")
      const description = markdown.translate(trimmed)
      const location_source_text = event.location?.name ? [event.location.name,event.location.address?.streetAddress].join(", ").replace(/&#(\d+);/g, (m, d) => String.fromCharCode(d)) : null
    
      const eventData = {
        title: title,
        description: description,
        starts_at: event.startDate,
        ends_at: event.endDate,
        external_link: event.url,
        link_text: defaultLinkText,
        data_source: data_source_id,
        location_source_text: location_source_text,
        image_url: event.image,
      }

      const result = await createEvent(eventData)

      if (result) {
        created.push(result)
      } else {
        failed.push({ ...eventData, error: "Unable to create event"})
      }

    } catch (error) {
      console.log(error)
      failed.push({ ...event, error})
      return error
    }

  })

  const results = await Promise.all(promises)
  console.log(`Processed ${results.length} events`)

  return { created, failed, source: "Explore Waterloo" }
}



