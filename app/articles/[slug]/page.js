import Layout from 'components/Layout'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { getPagesByTemplate, getPageData } from 'integrations/directus';

export async function getStaticPaths(context) {
  // if (process.env.NEXT_PUBLIC_PREVIEW_MODE) {
  //   return {
  //     paths: [],
  //     fallback: 'blocking',
  //   }
  // }
  const pages = await getPagesByTemplate('article')

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

  return {
    props: { page },
  }
}

export default function ArticlePage({ page }) {

  return (
    <Layout 
      title={page.title} 
      description={page.description} 
      color={page.background_colour} 
      image={page.share_image ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${page.share_image.id}` : null}
    >
      <div className="container p-3 sm:py-8 lg:p-8 max-w-screen-lg mx-auto">
        <div className="article">
          <h1 className="mb-6">{page.title}</h1>
          <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
            {page.body}
          </ReactMarkdown>
          <div className="my-6">
            <p>👈 <Link href="/">Back home</Link></p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
