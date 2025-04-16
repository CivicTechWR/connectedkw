import Section from 'components/layout/Section'
import EventDisplay from "components/events/EventDisplay"
import { getEventBySlug } from 'integrations/directus'

export default async function EventPage({ params }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  const imageUrl = event.image ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${event.image.id}` : false
  return (
    <Section>
      <EventDisplay event={event} />
    </Section>
  )
}


