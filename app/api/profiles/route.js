import { NextResponse } from 'next/server'
import { createItem } from '@directus/sdk'
import { directus } from 'integrations/directus'

export async function POST(request) {
  try {
    const data = await request.json()

    const profile = await directus.request(
      createItem('profiles', {
        ...data,
        status: 'draft',
        is_visible: true
      })
    )

    return NextResponse.json(profile)

  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    )
  }
} 