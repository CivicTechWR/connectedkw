import {decode} from 'html-entities';
import { NodeHtmlMarkdown } from 'node-html-markdown'

const markdown = new NodeHtmlMarkdown() 

const getStructuredEventData = ($) => {
    try {
      const structuredData = $('script[type="application/ld+json"]').filter((i, el) => {
          try {
              const data = JSON.parse($(el).html());
              if (data['@graph']) {
                // If there's a @graph array, look for Event type within it
                return data['@graph'].some(item => item['@type'] === 'Event');
              }
              return data['@type'] === 'Event';
          } catch (e) {
              return false;
          }
      }).first().html();
      const parsedData = JSON.parse(structuredData);
      
      // If there's a @graph array, extract the Event data from it
      if (parsedData['@graph']) {
        const eventData = parsedData['@graph'].find(item => item['@type'] === 'Event');
        return eventData;
      }
      
      return parsedData;
    } catch (error) {
      console.log('Failed to extract structured event data:', error);
      return null;
    }
}
  

// Base extractor for unknown sites
export const genericExtractor = ($) => {
  // Remove unnecessary elements
  $('script').remove();
  $('style').remove();
  $('nav').remove();
  $('footer').remove();
  $('header').remove();
  $('iframe').remove();
  $('noscript').remove();

  const mainContent = $('main, [role="main"], #main, .main, article, .post, .event-details').first();
  
  if (mainContent.length) {
    return mainContent.text().trim();
  }
  
  return $('body').text()
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 6000);
}

// Eventbrite extractor
export const eventbriteExtractor = ($) => {
    const eventData = getStructuredEventData($)
    if (!eventData) return null
    // Get image from structured data or fallback to meta image
    const image = Array.isArray(eventData.image) ? eventData.image[eventData.image.length - 1] : eventData.image || $('meta[property="og:image"]').attr('content');

    return {
        title: eventData.name,
        description: eventData.description,
        starts_at: eventData.startDate,
        ends_at: eventData.endDate,
        external_link: eventData.url,
        link_text: "Eventbrite page",
        data_source: 9,
        location_source_text: eventData.location?.address?.streetAddress,
        price: $('.eds-text-bs--fixed').first().text() || 'Free',
        image_url: image
    }
}

// Facebook Events extractor
export const facebookExtractor = (html) => {
  const $ = cheerio.load(html);
  
  try {
    const title = $('[data-testid="event-title"]').text();
    const description = $('[data-testid="event-description"]').text();
    const dateTime = $('time').attr('datetime');
    const location = $('[data-testid="event-location"]').text();
    const image = $('meta[property="og:image"]').attr('content');
    
    if (!title) return null;

    return {
      title,
      description,
      starts_at: dateTime,
      location_source_text: location,
      price: 'Free',
      image_url: image,
      data_source: 6, // Other
      link_text: "Facebook Event"
    };
  } catch (error) {
    console.log('Failed to extract Facebook event data:', error);
    return null;
  }
}

// Meetup extractor
export const meetupExtractor = ($) => {
  try {
    const structuredData = $('script[type="application/ld+json"]').filter((i, el) => {
      try {
        const data = JSON.parse($(el).html());
        return data['@type'] === 'Event';
      } catch (e) {
        return false;
      }
    }).first().html();
    const eventData = JSON.parse(structuredData);
    const image = Array.isArray(eventData.image) ? eventData.image[eventData.image.length - 1] : eventData.image || $('meta[property="og:image"]').attr('content');

    return {
      title: eventData.name,
      description: eventData.description,
      starts_at: eventData.startDate,
      ends_at: eventData.endDate || null,
      external_link: eventData.url,
      link_text: "Meetup page",
      data_source: 11,
      location_source_text: eventData.location?.name && eventData.location?.address ? `${eventData.location.name}, ${eventData.location.address.streetAddress}` : eventData.location?.name || eventData.location?.address?.streetAddress,
      price: eventData.offers?.price || 'Free',
      image_url: image
    };
  } catch (error) {
    console.log('Failed to extract Meetup structured data:', error);
    return null;
  }
} 

// exploreWaterloo extractor
export const exploreWaterlooExtractor = ($) => {
  const eventData = getStructuredEventData($)
  if (!eventData) return null

  try {
    const title = eventData.name?.replace(/&#(\d+);/g, (m, d) => String.fromCharCode(d))
    const originalDescription = eventData.description
    const decoded = decode(originalDescription)
    const cleaned = decoded.replace(/&#(\d+);/g, (m, d) => String.fromCharCode(d))
    const uriDecoded = decodeURIComponent(cleaned)
    const trimmedDecription = uriDecoded.replace(/\\n|\\/g, "")
    const location_source_text = eventData.location?.name ? [eventData.location.name,eventData.location.address?.streetAddress].join(", ").replace(/&#(\d+);/g, (m, d) => String.fromCharCode(d)) : null

    return {
        title: title,
        description: trimmedDecription,
        starts_at: eventData.startDate,
        ends_at: eventData.endDate,
        external_link: eventData.url,
        link_text: "Explore Waterloo event page",
        data_source: 5,
        location_source_text: location_source_text
    }
  } catch (error) {
    console.log('Failed to extract Explore Waterloo event data:', error);
    return null;
  }
}

export const waterlooRegionMuseumExtractor = ($) => {
    var months = ["January","February","March","April","May","June","July",
    "August","September","October","November","December"];

    const dateText = $('.dateTime p').first().text().replace(/\t|\n/g, '')
    const dateParts = dateText.split(' ')
    const monthName = dateParts[1]
    const monthIndex = months.indexOf(monthName)
    const zeroPaddedMonth = `0${monthIndex + 1}`.slice(-2)
    const day = dateParts[2].replace(',', '')
    const zeroPaddedDay = `0${day}`.slice(-2)
    const year = dateParts[3]
    const startTime = dateParts[4]
    const [startHour, startMinute] = startTime.split(':')
    const startHourInt = parseInt(startHour)
    const startHour24 = (dateParts[5] === "pm" &&  startHourInt < 12) ? (startHourInt + 12) : startHourInt
    const endTime = dateParts[7]
    const [endHour, endMinute] = endTime.split(':')
    const endHourInt = parseInt(endHour)
    const endHour24 = dateParts[8] === "pm" && endHourInt < 12? (endHourInt + 12) : endHourInt
    const zeroPaddedStartHour24 = `0${startHour24 + 1}`.slice(-2)
    const zeroPaddedEndHour24 = `0${endHour24 + 1}`.slice(-2)


    const date = `${year}-${zeroPaddedMonth}-${zeroPaddedDay}`
    const startDateTime = `${date}T${zeroPaddedStartHour24}:${startMinute}`
    const endDateTime = `${date}T${zeroPaddedEndHour24}:${endMinute}`

    const title = $('#pageHeading h1').first().text().replace(/\t|\n/g, '')
    $('h3:contains(Details:)').parent().attr('id', 'description-section');
    $('#description-section').find('h3.sectionHeader').remove()
    const descriptionHtml = $('#description-section').html().replace(/\t|\n/g, '')
    const description = markdown.translate(descriptionHtml)
    const locationWithMaps = $('h3:contains(Address:)').siblings().text().replace(/\t|\n/g, '')
    const location = locationWithMaps.split('View on Google Maps')[0].replace(/\t|\n/g, '')

    const imagePath = $(".contentRight img").first().attr("src")
    const imageUrl = imagePath ? `https://calendar.waterlooregionmuseum.ca${imagePath}` : null;

    return {
        title,
        description,
        location_source_text: location,
        starts_at: startDateTime,
        ends_at: endDateTime,
        link_text: "Region of Waterloo Museums",
        data_source: 10, // id in supabase
        image_url: imageUrl
    };
}

export const cityOfKitchenerExtractor = ($) => {
    var months = ["January","February","March","April","May","June","July",
        "August","September","October","November","December"];

    const dateText = $('.dateTime p.headerDate').first().text().replace(/\t|\n/g, '')
    const dateParts = dateText.split(' ')
    const monthName = dateParts[1]
    const monthIndex = months.indexOf(monthName)
    const zeroPaddedMonth = `0${monthIndex + 1}`.slice(-2)
    const day = dateParts[2].replace(',', '')
    const zeroPaddedDay = `0${day}`.slice(-2)
    const year = dateParts[3]
    const startTime = dateParts[4]
    const [startHour, startMinute] = startTime.split(':')
    const startHourInt = parseInt(startHour)
    const startHour24 = (dateParts[5] === "pm" &&  startHourInt < 12) ? (startHourInt + 12) : startHourInt
    const endTime = dateParts[7]
    const [endHour, endMinute] = endTime.split(':')
    const endHourInt = parseInt(endHour)
    const endHour24 = dateParts[8] === "pm" && endHourInt < 12? (endHourInt + 12) : endHourInt
    const zeroPaddedStartHour24 = `0${startHour24 + 1}`.slice(-2)
    const zeroPaddedEndHour24 = `0${endHour24 + 1}`.slice(-2)

    const date = `${year}-${zeroPaddedMonth}-${zeroPaddedDay}`
    const startDateTime = `${date}T${zeroPaddedStartHour24}:${startMinute}`
    const endDateTime = `${date}T${zeroPaddedEndHour24}:${endMinute}`

    const title = $('title').text().replace(/\t|\n/g, '')
    $('h2:contains(Event Details:)').parent().attr('id', 'description-section');
    $('#description-section').find('h2.sectionHeader').remove()
    const descriptionHtml = $('#description-section').html().replace(/\t|\n/g, '')
    const description = markdown.translate(descriptionHtml)
    const locationWithMaps = $('h2:contains(Address:)').siblings().text().replace(/\t|\n/g, '')
    const location = locationWithMaps.split('View on Google Maps')[0].replace(/\t|\n/g, '')
    const price = $('.calendar-details-header:contains(Fee)').next().text().replace(/\t|\n/g, '')

    return {
        title,
        description,
        location_source_text: location,
        price,
        starts_at: startDateTime,
        ends_at: endDateTime,
        link_text: "City of Kitchener event page",
        data_source: 2 // id in supabase
    };
}