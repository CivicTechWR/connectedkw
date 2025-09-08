import { getCollectionBySlug } from 'integrations/directus'
import Collection from 'components/Collection'

export default async function CollectionPage({ params }) {
  const {slug} = await params
  const collection = await getCollectionBySlug(slug)

  return (
    <Collection title={collection.title} events={collection.events} />
  )
}


