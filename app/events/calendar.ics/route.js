import { getEvents } from 'integrations/directus'
import { createEvents } from 'ics'
import { DateTime } from 'luxon'
import { marked } from 'marked'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const events = await getEvents()

    const icsEvents = events.map(event => {
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

    const { error, value } = createEvents(icsEvents)

    if (error) {
      console.error('Error creating ICS:', error)
      return new NextResponse('Error creating calendar feed', { status: 500 })
    }

    return new NextResponse(value, {
      headers: {
        'Content-Type': 'text/calendar',
        'Content-Disposition': 'attachment; filename="calendar.ics"'
      }
    })

  } catch (error) {
    console.error('Calendar feed error:', error)
    return new NextResponse('Error generating calendar feed', { status: 500 })
  }
} 