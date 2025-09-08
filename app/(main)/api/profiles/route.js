import { NextResponse } from 'next/server'
//import { createItem } from '@directus/sdk'
import { registerProfile } from 'integrations/directus'

export async function POST(request) {
  try {
    const profileData = await request.json();
    console.log(profileData);

    const result = await registerProfile(profileData);
    // console.log(result);
    return NextResponse.json({ profile: result }, { status: 201 });

  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json({ message: error }, { status: 500 });
  }
} 