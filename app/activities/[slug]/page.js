import Layout from 'components/Layout'
import EventDisplay from "components/EventDisplay"
import { getEventBySlug } from 'integrations/directus'
import ActivityDisplay from 'archived/ActivityDisplay'

export async function getServerSideProps({ params }) {
  const event = await getEventBySlug(params.slug)

  return {
    props: { event },
  }
}

export default function EventPage({ event }) {
  const imageUrl = event.image ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${event.image.id}` : null
  return (
    <Layout 
      color="white" 
      className="md:bg-lightGreen" 
      title={event.title} 
      description={event.description}
      image={imageUrl}
    >
      <ActivityDisplay activity={event} />
    </Layout>
  )
}


