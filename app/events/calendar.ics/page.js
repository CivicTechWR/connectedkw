import { createEvents } from 'ics'
import { DateTime } from 'luxon'
import { getEvents } from 'integrations/directus'
import { marked } from 'marked'
import { NextResponse } from 'next/server'

function generateCalendar(events) {
  const eventData = events.map(event => {
    const startDate = DateTime.fromISO(event.starts_at, { zone: "America/Toronto" })
    const htmlDescription = marked.parse(event.description || "")
    const markdownDescription = event.description ? event.description.trim() : ""
    const eventObj = {
      title: event.title.trim(),
      description: markdownDescription,
      start: startDate.toUTC().toFormat('y-M-d-H-m').split("-").map((a) => parseInt(a)),
      url: event.external_link.trim(),
      calName: 'Connected KW',
      htmlContent: htmlDescription,
    }

    if (event.ends_at) {
      const endDate = DateTime.fromISO(event.ends_at, { zone: "America/Toronto" })
      eventObj.end = endDate.toUTC().toFormat('y-M-d-H-m').split("-").map((a) => parseInt(a))
    } else {
      eventObj.duration = { hours: 1 }
    }

    if (event.location?.name) {
      eventObj.location = event.location.name.trim()
      if (event.location?.map_point?.coordinates) {
        eventObj.geo = {
          lon: event.location.map_point.coordinates[0],
          lat: event.location.map_point.coordinates[1]
        }
      }
    } else if (event.location_source_text) {
      eventObj.location = event.location_source_text.trim()
    } else {
      eventObj.location = "No location provided"
    }

    return eventObj
  })

  const { error, value } = createEvents(eventData)

  if (error) {
    console.log(error)
    throw Error(error)
  }

  return value
}

export async function GET() {
  try {
    const events = await getEvents()
    const calendar = generateCalendar(events)

    return new NextResponse(calendar, {
      headers: {
        'Content-Type': 'text/calendar'
      }
    })
  } catch (error) {
    return new NextResponse('Error generating calendar', { status: 500 })
  }
}
