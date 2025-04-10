import Layout from 'components/Layout'
import Section from 'components/Section'
import Link from 'next/link'
import Image from 'next/image'
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import GridCard from "components/GridCard"

import { getPagesByTemplate } from 'integrations/directus';

export async function getStaticProps({ params }) {
  const pages = await getPagesByTemplate('map')

  return {
    props: { pages }
  }
}

export default function Maps({pages}) {
  const formattedPages = pages.map(page => {
    return {
      ...page,
      image: page.main_image,
      classification: 'map'
    }
  })

  return (
    <Layout title="Maps" color="yellow">
      <div className="container sm:max-w-screen-md md:max-w-screen-lg mx-auto py-5">
        <h1 className="text-4 md:text-6xl font-title">{`Places to Go`}</h1>
        <div className="space-y-2">

          <ResponsiveMasonry
            columnsCountBreakPoints={{640: 1, 641: 2, 1024: 3}}
          >
            <Masonry gutter="0.5rem" columnsCount={1}>
              {formattedPages.map(page => <GridCard item={page} showImage showDescription key={page.slug} />)}
            </Masonry>
          </ResponsiveMasonry>

        </div>
      </div>
    </Layout>
  )
}


