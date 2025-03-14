import * as cheerio from 'cheerio';

// Base extractor for unknown sites
export const genericExtractor = (html) => {
  const $ = cheerio.load(html);
  
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
export const eventbriteExtractor = (html) => {
  const $ = cheerio.load(html);
  
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
  } catch (error) {
    console.log('Failed to extract Eventbrite structured data:', error);
    return null;
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
export const meetupExtractor = (html) => {
  const $ = cheerio.load(html);
  
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