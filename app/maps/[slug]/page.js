import InteractiveMapParks from 'components/InteractiveMapParks'
import Section from 'components/Section'
import Layout from 'components/Layout'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { getPagesByTemplate, getPageData, getFeaturesByCollection, getFeaturesTags, getCategoriesByGroup } from 'integrations/directus';

export async function getStaticPaths(context) {
  // if (process.env.NEXT_PUBLIC_PREVIEW_MODE) {
  //   return {
  //     paths: [],
  //     fallback: 'blocking',
  //   }
  // }

  const pages = await getPagesByTemplate('map')

  const paths = pages.map((page) => {
    return { params: { slug: page.slug } }
  })
 
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const page = await getPageData(params.slug)

  if (!page) {
    return {
      redirect: {
        destination: "/",
      },
    }
  }

  const features = await getFeaturesByCollection(page.collection.id)
  const tags = await getFeaturesTags(features)
  let categories = null
  if (page.collection.category_group?.id) {
    categories = await getCategoriesByGroup(page.collection.category_group?.id)
  }
  return {
    props: { page, features, tags, categories },
  }
}

export default function MapPage({ page, features, tags, categories }) {

  const mapConfig = {
    mapId: page.slug,
    categories: categories,
    categoriesName: page.collection?.category_group?.group,
    tags: tags,
    tagsName: page.collection?.tag_group?.group,
    preview: page.collection.preview
  }

  return (
    <Layout 
      title={page.title} 
      description={page.description} 
      color={page.background_colour} 
      image={page.share_image ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${page.share_image.id}` : null}
    >
      <section className="container mx-auto pt-8 pb-4">
        <div className="mb-2">
          <h1 className="text-4xl sm:text-6xl md:text-7xl mb-6">
            {page.title}
          </h1>
          <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
            {page.body}
          </ReactMarkdown>
        </div>
      </section>
      <div className="w-screen">
        <InteractiveMapParks 
          features={features} 
          mapConfig={mapConfig}
        />
      </div>
    </Layout>
  )
}
