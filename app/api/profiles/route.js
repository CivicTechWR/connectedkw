import { NextResponse } from 'next/server'
//import { createItem } from '@directus/sdk'
import { registerProfile } from 'integrations/directus'

export async function POST(request) {
  try {
    const { image,  } = await request.json();

    const result = await

  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json({ message: err }, { status: 500 });
  }
} 