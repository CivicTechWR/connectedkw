import { getCollectionBySlug } from 'integrations/directus'
import Collection from 'components/Collection'

export async function getServerSideProps({ params }) {
  const collection = await getCollectionBySlug(params.slug)

  return {
    props: { collection },
  }
}

export default function CollectionPage({ collection }) {
  return (
    <Collection title={collection.title} events={collection.events} />
  )
}


