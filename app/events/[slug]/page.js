import Section from 'components/layout/Section'
import EventDisplay from "components/events/EventDisplay"
import { getEventBySlug } from 'integrations/directus'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  return {
    title: event.title,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      images: [
        {
          url: event.image ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${event.image.id}` : false,
        },
      ],
    }
  }
}

export default async function EventPage({ params, searchParams }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  const imageUrl = event.image ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${event.image.id}` : false
  return (
    <Section>
      <EventDisplay event={event} />
    </Section>
  )
}


