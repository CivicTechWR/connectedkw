import { NextResponse } from 'next/server'
//import { createItem } from '@directus/sdk'
import { getFSAs } from 'integrations/directus'

export async function GET() {
  try {
    const FSAs = await getFSAs();
    return NextResponse.json(FSAs, { 
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
