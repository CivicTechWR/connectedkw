import { getEvents } from 'integrations/directus';
import { NextResponse } from 'next/server';
import { 
  createDirectus, 
  staticToken, 
  rest,
  createItem,
  uploadFiles,
  readItems,
} from '@directus/sdk';

const directus = createDirectus('https://cms.connectedkw.com').with(rest()).with(staticToken(process.env.DIRECTUS_TOKEN));

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://www.connectedkw.com',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    const events = await getEvents();
    return NextResponse.json(events, { 
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { msg: 'Something went wrong', error: err },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request) {
  try {
    const eventData = await request.json();
    
    const locationText = [eventData.location_name, eventData.location_address].filter(Boolean).join(', ');
    const locations = await directus.request(
      readItems('locations', {
        fields: ['id'],
        search: locationText,
        limit: 1
      })
    );

    console.log(locations);

    if (locations && locations[0]) {
      eventData.location = locations[0].id;
    } else {
      if (!eventData.location_source_text) {
        eventData.location_source_text = locationText;
      }
    }

    delete eventData.location_name;
    delete eventData.location_address;

    const event = await directus.request(
      createItem('events', eventData)
    );
    
    return NextResponse.json(event, { 
      status: 201,
      headers: corsHeaders
    });
  } catch (err) {
    console.log(err);
    const errorMessage = err.errors[0].message;
    return NextResponse.json(
      { msg: errorMessage, error: err },
      { status: 500, headers: corsHeaders }
    );
  }
}
