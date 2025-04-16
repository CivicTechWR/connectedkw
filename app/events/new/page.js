import EventForm from 'components/events/EventForm'
import { getTags } from 'integrations/directus'

export default async function NewEventPage() {
  const tags = await getTags('Events and activities')

  return (
    <EventForm tags={tags} />
  )
}