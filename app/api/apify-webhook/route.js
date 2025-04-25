import { ApifyClient } from 'apify-client';
import { saveEventsToDatabase } from 'integrations/apify'
import { NextResponse } from 'next/server'

const apify = new ApifyClient({
  token: process.env.APIFY_TOKEN
});

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
    const data = await request.json()
    console.log({webhook_data: data})
    const success = data.eventType === "ACTOR.RUN.SUCCEEDED"

    if (!success) {
      await fetch(process.env.CONNECTEDKW_IMPORT_FLOW_FAILED_URL, {
        method: 'POST',
        body: JSON.stringify({
          source: "apify"
        })
      })
      return NextResponse.json({ message: "Run failed" }, { status: 200 })
    }

    const datasetId = data.resource.defaultDatasetId
    const dataset = await apify.dataset(datasetId)
    const datasetItems = await dataset.listItems()
    const result = await saveEventsToDatabase(datasetItems.items)

    // trigger email notification
    await fetch(process.env.CONNECTEDKW_IMPORT_FLOW_URL, {
      method: 'POST',
      body: JSON.stringify({
        source: result.source,
        created: result.created,
        failed: result.failed,
      })
    })
    return NextResponse.json({ result }, { status: 200 })

  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: err }, { status: 500 })
  }
}

// This function can run for a maximum of 60 seconds
export const config = {
  maxDuration: 60,
};
