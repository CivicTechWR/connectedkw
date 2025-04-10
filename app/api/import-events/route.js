import Cors from 'cors'
import { generateActorInput } from 'utils/scraping-functions'
import { importExploreWaterlooEvents } from 'utils/import-functions'
import { ApifyClient } from 'apify-client'
import { NextResponse } from 'next/server'

const apify = new ApifyClient({
    token: process.env.APIFY_TOKEN
});

// Initializing the cors middleware
const cors = Cors({
  methods: ['POST', 'HEAD'],
  origin: "*"
})

const checkAuthorization = (req, done) => {
  const bearerToken = req.headers.get("authorization")

  if (!bearerToken) {
    return new NextResponse(null, { status: 401, statusText: "No Bearer Token" })
  }

  const token = bearerToken.split(" ")[1];

  if (token && token === process.env.UNBORING_SECRET_KEY) {
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
  await runMiddleware(req, cors)
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

    if (source === "explore-waterloo") {
      const result = await importExploreWaterlooEvents()
      console.log({result})
      return NextResponse.json(result)
    }

    const actorInput = generateActorInput(source)
    const run = await apify.actor("apify/web-scraper").start(actorInput);
    console.log({run})
    return NextResponse.json(run)

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
