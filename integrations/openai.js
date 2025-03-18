"use server"

import OpenAI from 'openai';
import { 
  genericExtractor,
  eventbriteExtractor,
  facebookExtractor,
  meetupExtractor
} from 'utils/event-extractors';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

function getExtractor(url) {
  if (url.includes('eventbrite.com')) {
    return eventbriteExtractor;
  }
  if (url.includes('meetup.com')) {
    return meetupExtractor;
  }
  return null;
}

export const importEventFromUrl = async (url) => {
  try {
    if (!url) {
      return { error: 'URL is required' };
    }

    if (url.includes('facebook.com/events')) {
    return { error: 'Facebook events are not supported' };
    }

    // Fetch the webpage content
    const response = await fetch(url);
    const html = await response.text();
    
    // Try platform-specific extractor first
    const extractor = getExtractor(url);
    let eventData = null;
    
    if (extractor) {
      eventData = extractor(html);
    }
    
    // Fall back to GPT if platform-specific extraction fails
    if (!eventData) {
      const cleanedContent = genericExtractor(html);
      
      const completion = await openai.responses.create({
        model: "gpt-3.5-turbo",
        instructions: "You are a helpful assistant that extracts event information from webpage content. Return only valid JSON. All dates should be in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ). If you cannot extract any event inforamtion, return null.",
        input: `Extract event information from this content. Return a parseable JSON object. Do not include any other text in your response and do not wrap it with JSON md markers. The JSON object should have the following fields:
            - title: the event title
            - description: full event description
            - starts_at: datetime in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)
            - ends_at: datetime in ISO format (if available)
            - location_source_text: physical location of the event
            - price: price/cost of the event (if free, specify "Free")
            - external_link: URL for registration (if none found, use "${url}")
            - image_url: URL of the event image (if found in content)

            Content:
            ${cleanedContent}`,
        temperature: 0.2,
      });


      if (!completion?.output_text) {
        return { error: 'No event information found' };
      }

      eventData = JSON.parse(completion.output_text);
    }

    const event = {
      title: eventData.title,
      description: eventData.description,
      starts_at: eventData.starts_at,
      ends_at: eventData.ends_at,
      location_source_text: eventData.location_source_text,
      price: eventData.price,
      external_link: eventData.external_link || url,
      link_text: eventData.link_text || "Event page",
      data_source: eventData.data_source || null,
      image_url: eventData.image_url,
      source_url: url,
      status: 'draft'
    };

    return { 
      message: 'Event processed successfully',
      event 
    };

  } catch (error) {
    console.error('Error processing event:', error);
    return { 
      error: 'Failed to process event',
      details: error.message 
    };
  }
} 