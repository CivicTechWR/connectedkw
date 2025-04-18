import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    const WEATHER_API_KEY = process.env.WEATHER_API_KEY
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`

    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to fetch weather data' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
