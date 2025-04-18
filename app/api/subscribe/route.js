import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Add to mailing list
    const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY
    const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID
    const DATACENTER = process.env.MAILCHIMP_API_KEY?.split('-')[1]

    const data = {
      email_address: email,
      status: 'subscribed'
    }

    const response = await fetch(
      `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`,
      {
        method: 'POST',
        headers: {
          Authorization: `apikey ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    )

    const responseData = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: responseData.detail || 'Failed to subscribe' },
        { status: response.status }
      )
    }

    return NextResponse.json(
      { message: 'Successfully subscribed!' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}