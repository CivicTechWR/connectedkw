import EventsFeed from 'components/events/EventsFeed'
import CalendarSubscriptionButton from 'components/events/CalendarSubscriptionButton'
import { getEvents, getCategories, getTags, getDataSources } from 'integrations/directus';
import Image from 'next/image'
import Link from 'next/link'
import Section from 'components/layout/Section'

export const metadata = {
  title: 'Events in Kitchener, Waterloo, and Cambridge',
  description: 'Find events in Kitchener, Waterloo, and Cambridge. Get the latest events, activities, and things to do in the area.',
}

export default async function Events() {
  const categories = await getCategories('Age groups')
  const tags = await getTags('Events and activities')
  const events = await getEvents()
  const dataSources = await getDataSources()

  return (
    <>
      <Section className="bg-slate-100">
          <div className="lg:grid grid-cols-2 gap-6">
            <div className="flex justify-center items-center">
              <div>
                <h1 className="text-4 mb-6 md:text-6xl font-title">
                  Events in KW
                </h1>
                <p className="text-lg">{`Tired of checking multiple event calendars and still missing out?`}</p> 
                <p className="text-lg">{`Connected KW aggregates events from the City of Kitchener, the City of Waterloo, the City of Cambridge, Explore Waterloo, Region of Waterloo Museums, Waterloo Public Library, Eventbrite, and social media.`}</p> 
                <p className="text-lg">{`You can add events to your calendar, subscribe to get them all, or bookmark this page so you'll always know what there is to do!`}</p>
                <div className="flex flex-col md:flex-row gap-2 items-center">
                  <CalendarSubscriptionButton />
                  <Link href="/events/new" className="btn btn-yellow py-[11px]">
                    <i className={`mr-2 fa-solid fa-circle-user hidden sm:inline`}></i>
                    Submit an event                
                  </Link>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex max-h-[75vh] justify-center items-center relative p-12">
              <div className="absolute bottom-0 left-0 bg-[url(/highlights-01.svg)] bg-contain bg-no-repeat h-1/5 w-1/5" />
              <div className="absolute top-0 right-0 bg-[url(/highlights-02.svg)] bg-contain bg-no-repeat h-1/5 w-1/5" />
              <Image
                  className={`object-contain`}
                  src={`/calendar-laptop.png`}
                  alt="event calendar on a laptop" 
                  height="464"
                  width="800"
                />
            </div>
          </div>
      </Section>
      <Section>
        <EventsFeed events={events} tags={tags} />
      </Section>
    </>
  )
}


