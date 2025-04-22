import { NextResponse } from 'next/server'
import { generateTags } from 'integrations/openai'
import { getEventById, updateEvent } from 'integrations/directus'

const checkAuthorization = (req, done) => {
  const bearerToken = req.headers.get("authorization")

  if (!bearerToken) {
    return new NextResponse(null, { status: 401, statusText: "No Bearer Token" })
  }

  const token = bearerToken.split(" ")[1];

  if (token && token === process.env.CONNECTEDKW_SECRET_KEY) {
    return done("Authorized")
  } else {
    return new NextResponse(null, { status: 401, statusText: "Unauthorized" })
  }
}

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, fn) {
  return new Promise((resolve, reject) => {
    fn(req, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

export async function POST(request) {
  await runMiddleware(request, checkAuthorization)

  try {
    const { events } = await request.json()

    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Array of event IDs is required' },
        { status: 400 }
      )
    }

    const results = []
    const errors = []

    // Process each event
    for (const eventId of events) {
      try {
        // Fetch event from Directus
        const event = await getEventById(eventId)

        if (!event) {
          errors.push({ id: eventId, error: 'Event not found' })
          continue
        }

        if (event.tags && event.tags.length > 0) {
          errors.push({ id: eventId, error: 'Event already has tags' })
          continue
        }

        // Generate tags
        const { tags, error: tagError } = await generateTags(event)

        if (tagError || !tags) {
          errors.push({ id: eventId, error: tagError || 'Failed to generate tags' })
          continue
        }

        // Format and save tags
        const formattedTags = tags.map(tagId => ({
          tags_id: tagId
        }))

        await updateEvent(eventId, {
          tags: formattedTags
        })

        results.push({ id: eventId, tags })

      } catch (error) {
        console.log({error})
        errors.push({ id: eventId, error: error.message })
      }
    }

    return NextResponse.json({
      message: 'Tag generation complete',
      results,
      errors: errors.length > 0 ? errors : null
    })

  } catch (error) {
    console.error('Error processing events:', error)
    return NextResponse.json(
      { error: 'Failed to process events' },
      { status: 500 }
    )
  }
} 