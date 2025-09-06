import { NextResponse } from 'next/server'
//import { createItem } from '@directus/sdk'
import { getFSAData, getFSAGeoData } from 'integrations/directus'

export async function GET() {
  try {
    const [fsaData, fsaGeoData] = await Promise.all([await getFSAData(), await getFSAGeoData()])
    
    return NextResponse.json({ fsaGeoData, fsaData }, { 
      status: 200,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { msg: 'Something went wrong', error: err },
      { status: 500 }
    );
  }
}
