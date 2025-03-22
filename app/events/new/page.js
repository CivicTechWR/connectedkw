import EventForm from 'components/EventForm'
import { getTags } from 'integrations/directus'

export default async function NewEventPage() {
  const tags = await getTags('Events and activities')

  console.log({tags})

  return (
    <EventForm tags={tags} />
  )
}