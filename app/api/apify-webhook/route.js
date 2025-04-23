import { ApifyClient } from 'apify-client';
import { saveEventsToDatabase } from 'integrations/apify'
import { NextResponse } from 'next/server'

const apify = new ApifyClient({
    token: process.env.APIFY_TOKEN
});

export async function POST(request) {
  try {
    const data = await request.json()
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
