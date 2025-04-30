import { NodeHtmlMarkdown } from 'node-html-markdown'
import { DateTime } from 'luxon'
import { 
    waterlooRegionMuseumExtractor,
    cityOfKitchenerExtractor,
    cityOfWaterlooExtractor,
    cityOfCambridgeExtractor,
    eventbriteExtractor
} from 'utils/event-extractors';
import { ApifyClient } from 'apify-client'
import { createEvent } from 'integrations/directus'
import { DATA_SOURCE_LOOKUP } from 'utils/constants'

const apify = new ApifyClient({
    token: process.env.APIFY_TOKEN
});

const markdown = new NodeHtmlMarkdown()

export const defaultActorInput = {
    "startUrls": [],
    "keepUrlFragments": false,
    "respectRobotsTxtFile": true,
    "globs": [],
    "pseudoUrls": [],
    "excludes": [
      {
        "glob": "/**/*.{png,jpg,jpeg,pdf}"
      }
    ],
    "linkSelector": "a[href]",
    "pageFunction": "",
    "proxyConfiguration": {
      "useApifyProxy": true
    },
    "proxyRotation": "RECOMMENDED",
    "initialCookies": [],
    "additionalMimeTypes": [],
    "forceResponseEncoding": false,
    "ignoreSslErrors": false,
    "preNavigationHooks": "",
    "postNavigationHooks": "",
    "maxRequestRetries": 3,
    "maxPagesPerCrawl": 150,
    "maxResultsPerCrawl": 0,
    "maxCrawlingDepth": 0,
    "maxConcurrency": 50,
    "pageLoadTimeoutSecs": 60,
    "pageFunctionTimeoutSecs": 60,
    "debugLog": false,
    "customData": {}
  }
  
  export async function pageFunctionEventbrite(context) {
      const $ = context.jQuery;
      const pageTitle = $('title').first().text();
      const title = $('h1.event-title').first().text();
  
      if (!title) {
          return null
      }
  
      const description = document.querySelector('.event-details__main-inner .eds-text--left')?.innerHTML.replace(/\t|\n/g, '')
      const startDateTime = document.querySelector('meta[property="event:start_time"]')?.content
      const endDateTime = document.querySelector('meta[property="event:end_time"]')?.content
      const locationTitle = document.querySelector('.location-info__address-text')?.textContent
      const locationAddress = document.querySelector('meta[name="twitter:data1"]')?.getAttribute('value')
      const location = [locationTitle, locationAddress].join(", ")
      let price = document.querySelector('.ticket-card-compact-size__price')?.textContent
      if (!price) {
          price = document.querySelector('.conversion-bar__panel-info')?.textContent
      }
      const imageUrl = document.querySelector('meta[property="og:image"]')?.content
  
      // Print some information to actor log
      context.log.info(`URL: ${context.request.url}, TITLE: ${pageTitle}`);
  
      return {
          url: context.request.url,
          title,
          description,
          location,
          startDateTime,
          endDateTime,
          price,
          linkText: "Eventbrite",
          sourceDatabaseId: 9, // id in supabase
          imageUrl
      };
  }

  
  export const generateActorInput = (source) => {
    if (source === "City of Kitchener") {
      const today = DateTime.now().setZone("America/Toronto")
      const queryStartDate = `${today.month}/${today.day}/${today.year}`
      const oneMonthFromToday = DateTime.now().setZone("America/Toronto").plus({ months: 1 })
      const queryEndDate = `${oneMonthFromToday.month}/${oneMonthFromToday.day}/${oneMonthFromToday.year}`
      
      return {
        ...defaultActorInput,
        "linkSelector": ".calendar-list-container .calendar-list-list .calendar-list-info a",
        "startUrls": [
            {
                "url": `https://calendar.kitchener.ca/default/_List?StartDate=${queryStartDate}&EndDate=${queryEndDate}&Public%20Events=City-Run%20Events&Public%20Events=Arts,%20Culture,%20Film%20and%20Music&Public%20Events=Free%20Community%20Events&Public%20Events=Children%20and%20Youth%20Friendly%20Events&Public%20Events=Downtown%20Events&Public%20Events=The%20Market&Public%20Events=Tech%20Events&limit=150`
            }
        ],
        "pageFunction": cityOfKitchenerExtractor
      }
    } else if (source === "City of Waterloo") {
      const today = DateTime.now().setZone("America/Toronto")
      const queryStartDate = `${today.month}/${today.day}/${today.year}`
      const oneMonthFromToday = DateTime.now().setZone("America/Toronto").plus({ months: 1 })
      const queryEndDate = `${oneMonthFromToday.month}/${oneMonthFromToday.day}/${oneMonthFromToday.year}`
      
      return {
        ...defaultActorInput,
        "linkSelector": ".calendar-list-container .calendar-list-list .calendar-list-info a",
        "startUrls": [
            {
                "url": `https://events.waterloo.ca/default/_List?limit=100&StartDate=${queryStartDate}&EndDate=${queryEndDate}`
            }
        ],
        "pageFunction": cityOfWaterlooExtractor
      }
    } else if (source === "City of Cambridge") {
      const today = DateTime.now().setZone("America/Toronto")
      const queryStartDate = `${today.month}/${today.day}/${today.year}`
      const oneMonthFromToday = DateTime.now().setZone("America/Toronto").plus({ months: 1 })
      const queryEndDate = `${oneMonthFromToday.month}/${oneMonthFromToday.day}/${oneMonthFromToday.year}`
      
      return {
        ...defaultActorInput,
        "linkSelector": ".calendar-list-container .calendar-list-list .calendar-list-info a",
        "startUrls": [
            {
                "url": `https://calendar.cambridge.ca/default/_List?StartDate=${queryStartDate}&EndDate=${queryEndDate}&limit=100&Events%20Calendar=Centre+for+the+Arts+Events%7cCambridge+Farmers+Market%7cCommunity+Submitted+Events%7cFestivals+and+Events`
            }
        ],
        "pageFunction": cityOfCambridgeExtractor
      }
    } else if (source === "Region of Waterloo Museums") {
      const today = DateTime.now().setZone("America/Toronto")
      const queryStartDate = `${today.month}/${today.day}/${today.year}`
      const oneMonthFromToday = DateTime.now().setZone("America/Toronto").plus({ months: 1 })
      const queryEndDate = `${oneMonthFromToday.month}/${oneMonthFromToday.day}/${oneMonthFromToday.year}`
      
      return {
        ...defaultActorInput,
        "linkSelector": ".calendar-list-container .calendar-list-list .calendar-list-info a",
        "startUrls": [
            {
                "url": `https://calendar.waterlooregionmuseum.ca/Default/_List?limit=100&StartDate=${queryStartDate}&EndDate=${queryEndDate}`
            }
        ],
        "pageFunction": waterlooRegionMuseumExtractor
      }
    } else if (source === "Eventbrite") {
      return {
        ...defaultActorInput,
        "linkSelector": ".discover-search-desktop-card a.event-card-link",
        "globs": [
            {
                "glob": "https://www.eventbrite.com/e/*"
            },
            {
                "glob": "https://www.eventbrite.ca/e/*"
            }
        ],
        "startUrls": [
            {
                "url": "https://www.eventbrite.ca/d/canada--waterloo--10327/kids/"
            },
            {
                "url": "https://www.eventbrite.ca/d/canada--waterloo--10327/family/"
            },
            {
                "url": "https://www.eventbrite.ca/d/canada--waterloo--10327/community/"
            },
            {
                "url": "https://www.eventbrite.ca/d/canada--waterloo--10327/kids/?page=2"
            },
            {
                "url": "https://www.eventbrite.ca/d/canada--waterloo--10327/kids/?page=3"
            },
            {
                "url": "https://www.eventbrite.ca/d/canada--waterloo--10327/kids/?page=4"
            },
            {
                "url": "https://www.eventbrite.ca/d/canada--waterloo--10327/family/?page=2"
            },
            {
                "url": "https://www.eventbrite.ca/d/canada--waterloo--10327/family/?page=3"
            },
            {
                "url": "https://www.eventbrite.ca/d/canada--waterloo--10327/family/?page=4"
            }
        ],
        "pageFunction": eventbriteExtractor
      }
    }
  }
  
  export const triggerApifyScraper = async (source) => {
    const actorInput = generateActorInput(source)
    const run = await apify.actor("apify/cheerio-scraper").start(actorInput);
    console.log({run})
    return run
  }

  export const saveEventsToDatabase = async(datasetItems) => {
    const created = []
    const failed = []
  
    const events = datasetItems.filter(item => (!!item.url || !!item.external_link) && !!item.title && !!item.starts_at)
  
    const promises = events.map(async(event) => {
      try {
        const description = event.description ? markdown.translate(event.description) : ""
  
        const eventData = {
          title: event.title?.trim(),
          description: description?.trim(),
          starts_at: event.starts_at,
          ends_at: event.ends_at,
          location_source_text: event.location_source_text?.trim(),
          external_link: event.external_link || event.url,
          link_text: event.link_text,
          price: event.price?.trim(),
          data_source: event.data_source,
          image_url: event.image_url
        }
  
        const result = await createEvent(eventData)
        created.push(result)
        return result
  
      } catch (error) {
        console.log(error.errors)
        failed.push({ ...event, ...error})
        return error
      }
  
    })
  
    const results = await Promise.all(promises)
    console.log(`Processed ${results.length} events`)
    
    let sourceId = null
    sourceId = created.length > 0 ? created[0]?.data_source : null
    if (!sourceId) {
        sourceId = failed.length > 0 ? failed[0]?.data_source : null
    }
    const source = sourceId ? DATA_SOURCE_LOOKUP.find(s => s.id === sourceId) : null
    const sourceName = source?.name || "Apify"
  
    return { created: created.length, failed: failed.length, source: sourceName }
  }

  