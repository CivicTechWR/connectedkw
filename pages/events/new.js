import Section from 'components/Section'
import Layout from 'components/Layout'
import Link from 'next/link'

export default function SubmitEvent() {
  return (
    <Layout title="Submit an event" color="red">
      <Section className="snap-center mt-12">
        <div className="bg-white rounded-xl border-black border-3 p-5 lg:p-10">
          <div className="mb-6">
            <h1 className="text-5xl sm:text-6xl md:text-7xl mb-4">
              Submit an event
            </h1>
            <p>{`We would love to add your event to our calendar! Please fill out the form below to submit your event. We will review it before publishing.`}</p>
            <p>You may want to check the <Link href="/events">full list of events</Link> to make sure you&apos;re not duplicating one that is already in there.</p>
          </div>
          <div className="flex">
            <iframe
              className="airtable-embed"
              src="https://airtable.com/embed/shrhKO3DQD1NNs5yQ?backgroundColor=teal"
              frameBorder="0"
              onmousewheel=""
              width="100%"
              height="533"
              style={{
                background: "transparent",
                border: "1px solid #ccc"
              }}
            />
          </div>
          <div className="my-6">
            <p>👈 <Link href="/">Back home</Link></p>
          </div>
        </div>
      </Section>
    </Layout>
  )
}
