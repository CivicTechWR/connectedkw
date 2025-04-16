import Layout from 'components/Layout'
import ActivitiesFeed from 'archived/ActivitiesFeed'
import { getActivities, getCategories, getTags } from 'integrations/directus';
import slugify from 'slugify';

export async function getStaticProps() {
  const activities = await getActivities()
  const categories = await getCategories('Age groups')
  const tags = await getTags('Events and activities')

  return {
    props: { activities, tags, categories }
  }
}

export default function Activities({ activities=[], categories=[], tags=[] }) {

  const filters = [
    {
      label: 'Categories',
      id: 'categories',
      type: 'select-multiple',
      options: categories,
      multipleSelect: true,
      attributeFn: (event) => event.categories.map(c => c.id)
    },
    {
      label: 'Tags',
      id: 'tags',
      type: 'select-multiple',
      options: tags,
      multipleSelect: true,
      attributeFn: (event) => event.tags.map(t => t.id)
    },  
  ]

  return (
    <Layout title="Activity ideas for families and kids in Kitchener-Waterloo" description="A curated, seasonal list of family-friendly activity ideas that you can filter for your interests." color="green">
      <div className="container py-5 mx-auto">
        <ActivitiesFeed activities={activities} filters={filters} />
      </div>
    </Layout>
  )
}


