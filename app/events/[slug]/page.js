import Layout from 'components/Layout'
import EventDisplay from "components/EventDisplay"
import { getEventBySlug } from 'integrations/directus'

export async function getServerSideProps({ params }) {
  const event = await getEventBySlug(params.slug)

  return {
    props: { event },
  }
}

export default function EventPage({ event }) {
  const imageUrl = event.image ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${event.image.id}` : false
  return (
    <Layout 
      color="white" 
      className="md:bg-lightBlue" 
      title={event.title} 
      description={event.description}
      image={imageUrl}
    >
      <div className="container py-6 lg:max-w-screen-lg mx-auto">
      	<EventDisplay event={event} />
      </div>
    </Layout>
  )
}


