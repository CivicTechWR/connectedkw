import { NextResponse } from 'next/server'
//import { createItem } from '@directus/sdk'
import { getNeighbourhoodData, getNeighbourhoodGeography } from 'integrations/directus'

export async function GET() {
  try {
    const [neighbourhoodData, neighbourhoodGeography] = await Promise.all([await getNeighbourhoodData(), await getNeighbourhoodGeography()])
    
    return NextResponse.json({ neighbourhoodGeography, neighbourhoodData }, { 
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
