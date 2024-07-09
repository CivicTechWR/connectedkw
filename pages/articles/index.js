import Link from 'next/link'
import Section from 'components/Section'
import Layout from 'components/Layout'
import Image from 'next/image'
import { getPages } from 'integrations/directus';

export async function getStaticProps() {
  const pages = await getPages()

  return {
    props: { pages }
  }
}

const locale = 'en-CA';
const options = {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
};

const urlFragments = {
    'article': 'articles',
    'map': 'maps',
  }

export default function AllArticles({ pages }) {
  return (
    <Layout title="Local info for families in Kitchener Waterloo" color="red">
      <section className="bg-slate-100 py-6">
        <div className="container py-5 mx-auto">
          <div className="lg:grid grid-cols-2 gap-6">
            <div className="flex justify-center items-center">
              <div>
                <h1 className="text-4 mb-6 md:text-6xl font-title">
                  Local info for families in KW
                </h1>
                <p className="text-lg">{`Get the inside scoop on what's going on in Waterloo Region for kids and families.`}</p> 
                <p className="text-lg">{`We publish articles, maps, recommendations, and more. We're always looking for contributors if you'd like to share your knowledge!`}</p> 
                <p className="text-lg">{`Follow us on Instagram to find out about new content.`}</p>
                <a href="https://www.instagram.com/connectedkw" className="btn my-6">
                  <i className={`mr-2 fa-brands fa-instagram`}></i>
                  Follow us on Instagram
                </a>
              </div>
            </div>
            <div className="hidden lg:flex max-h-[75vh] justify-center items-center relative p-12">
              <div className="absolute bottom-0 left-0 bg-[url(/highlights-01.svg)] bg-contain bg-no-repeat h-1/5 w-1/5" />
              <div className="absolute top-0 right-0 bg-[url(/highlights-02.svg)] bg-contain bg-no-repeat h-1/5 w-1/5" />
                <Image
                  className={`object-contain`}
                  src={`/map-laptop-mockup.png`}
                  alt="map of local playgrounds on a laptop" 
                  height="464"
                  width="800"
                />
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="container mx-auto py-5">

          <div className="space-y-2 divide-y divide-slate-300">
          {
            pages.map(page => {
              const urlFragment = urlFragments[page.template]
              const publishedOn = new Date(page.date_created).toLocaleDateString(locale, options);
              return (
                <div className="w-full article py-4 gap-4 flex-auto flex flex-col sm:flex-row">
                  { (page.main_image) &&
                    <div className={`w-full aspect-video sm:aspect-square sm:w-40 grow-0 relative min-h-0 overflow-hidden`}>
                      <Link href={`/${urlFragment}/${page.slug}`}>
                        <Image
                          className={`object-cover w-full h-full min-[500px]:max-md:aspect-square`}
                          src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${page.main_image.id}?key=small-640`}
                          alt={page.main_image.description || page.main_image.title} 
                          title={page.main_image.title}
                          loading="lazy"
                          height="200"
                          width="200"
                        />
                      </Link>
                    </div>
                  }
                  <div>
                    <Link key={page.slug} href={`/${urlFragment}/${page.slug}`}>
                      <h3>{page.title}</h3>
                    </Link>
                    <p className="uppercase text-sm mb-2 text-grey"><time>{publishedOn}</time></p>
                    <p className="">
                      {page.description}
                    </p>
                  </div>
                </div>
              )
            })
          }
          </div>
        </div>
      </section>
    </Layout>
  )
}
