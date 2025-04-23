import { NextResponse } from 'next/server'
import { directus } from 'integrations/directus'
import { createItem, readItem } from '@directus/sdk'

export async function POST(request) {
  try {
    const { profileId, name, email, message } = await request.json()

    // Get profile details
    const profile = await directus.request(
      readItem('profiles', profileId)
    )

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Create contact request
    const contactRequest = await directus.request(
      createItem('profile_contact_requests', {
        profile: profileId,
        name,
        email,
        message,
        status: 'pending'
      })
    )

    // TODO: Send email notification to profile owner
    // This could use your preferred email service (SendGrid, AWS SES, etc.)

    return NextResponse.json({
      message: 'Contact request sent successfully'
    })

  } catch (error) {
    console.error('Error sending contact request:', error)
    return NextResponse.json(
      { error: 'Failed to send contact request' },
      { status: 500 }
    )
  }
} 