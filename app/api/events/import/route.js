import { importExploreWaterlooEvents } from 'utils/import-functions'
import { NextResponse } from 'next/server'
import { triggerApifyScraper } from 'integrations/apify'

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

export async function POST(req) {
  await runMiddleware(req, checkAuthorization)

  try {
    const body = await req.json()
    const { source } = body

    if (!source) {
      return NextResponse.json(
        { message: "Provide a source" },
        { status: 500 }
      )
    }

    if (source === "Explore Waterloo") {
      const result = await importExploreWaterlooEvents()
      
      // trigger email notification
      await fetch(process.env.CONNECTEDKW_IMPORT_FLOW_URL, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: source,
          created: result.created.length,
          failed: result.failed.length,
        })
      })
      return NextResponse.json(result)
    }

    const result = await triggerApifyScraper(source)
    console.log({result})
    return NextResponse.json({ message: "Triggered run on Apify for " + source })

  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: err },
      { status: 500 }
    )
  }
}

// This function can run for a maximum of 60 seconds
export const config = {
  maxDuration: 60,
};
