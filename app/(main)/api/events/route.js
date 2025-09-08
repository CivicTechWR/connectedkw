import { getEvents, createEvent } from 'integrations/directus';
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
    const event = await createEvent(eventData)
    
    if (event) {
      return NextResponse.json(event, { 
        status: 201,
        headers: corsHeaders
      });
    } else {
      return NextResponse.json(
        { msg: 'Something went wrong :(' },
        { status: 500, headers: corsHeaders }
      );
    }
  } catch (err) {
    console.log(err);
    const errorMessage = err.errors[0].message;
    return NextResponse.json(
      { msg: "Dang, something went wrong", error: err },
      { status: 500, headers: corsHeaders }
    );
  }
}
