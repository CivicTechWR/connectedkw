import InteractiveMapParks from 'components/InteractiveMapParks'
import Section from 'components/Section'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { getPagesByTemplate, getPageData, getFeaturesByCollection, getFeaturesTags, getCategoriesByGroup } from 'integrations/directus';

export async function generateStaticParams() {
  const pages = await getPagesByTemplate('map')

  return pages.map((page) => ({
    slug: page.slug,
  }))
}

export default async function MapPage({ params }) {
  const {slug} = await params
  const page = await getPageData(slug)
  const features = await getFeaturesByCollection(page.collection.id)
  const tags = await getFeaturesTags(features)
  let categories = null
  if (page.collection.category_group?.id) {
    categories = await getCategoriesByGroup(page.collection.category_group?.id)
  }

  const mapConfig = {
    categories: categories,
    categoriesName: page.collection?.category_group?.group,
    tags: tags,
    tagsName: page.collection?.tag_group?.group,
    preview: page.collection.preview,
    mapId: slug
  }

  return (
    <>
      <Section>
        <div className="mb-2">
          <h1 className="text-4xl sm:text-6xl md:text-7xl mb-6">
            {page.title}
          </h1>
          <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
            {page.body}
          </ReactMarkdown>
        </div>
      </Section>
      <div className="w-screen">
        <InteractiveMapParks 
          features={features} 
          mapConfig={mapConfig}
        />
      </div>
    </>
  )
}
