import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { getPagesByTemplate, getPageData } from 'integrations/directus';

export async function generateStaticParams() {
  const pages = await getPagesByTemplate('article')

  return pages.map((page) => ({
    slug: page.slug,
  }))
}


export default async function ArticlePage({ params }) {
  const {slug} = await params
  const page = await getPageData(slug)

  return (
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
  )
}
