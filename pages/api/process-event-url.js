import OpenAI from 'openai';
import { 
    createDirectus, 
    staticToken, 
    rest,
    createItem,
} from '@directus/sdk';
import { 
  genericExtractor,
  eventbriteExtractor,
  facebookExtractor,
  meetupExtractor
} from 'utils/event-extractors';

const directus = createDirectus('https://cms.connectedkw.com').with(rest()).with(staticToken(process.env.DIRECTUS_TOKEN));

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (url.includes('facebook.com/events')) {
        return res.status(400).json({ error: 'Facebook events are not supported' });
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
        input: `Extract event information from this content. Return a JSON object with the following fields:
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

      eventData = JSON.parse(completion.output[0]?.content[0]?.text);
    }

    if (!eventData) {
      return res.status(400).json({ error: 'No event information found' });
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
    console.log({event})

    // const event = await directus.request(
    //     createItem('events', preppedEventData)
    // )

    return res.status(200).json({ 
      message: 'Event processed successfully',
      event 
    });

  } catch (error) {
    console.error('Error processing event:', error);
    return res.status(500).json({ 
      error: 'Failed to process event',
      details: error.message 
    });
  }
} 