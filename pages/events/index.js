import Link from 'next/link'
import Section from 'components/Section'
import Layout from 'components/Layout'
import { useState } from 'react'

export default function AllEvents() {
  const [view, setView] = useState("calendar")

  const setCalendarView = () => {
    setView("calendar")
  }

  const setTableView = () => {
    setView("table")
  }

  return (
    <Layout title="All events" color="green">
      <Section className="snap-center mt-12">
        <div className="bg-white rounded-xl border-black border-3 p-5 lg:p-10">
          <div className="mb-6">
            <h1 className="text-5xl sm:text-6xl md:text-7xl mb-4">
              Events calendar
            </h1>
            <p>This is the full events calendar. Feel free to browse or search.</p>
            <p>Do you want to add your event? Please fill out this form to <Link href="/events/new">submit an event!</Link></p>
          </div>
          <div className="w-full flex justify-end">
            <div className="border-black border-2 rounded-lg mb-2">
              <button onClick={setCalendarView} className={`text-sm border-0 rounded-r-none ${view === "calendar" ? 'bg-green' : 'bg-white'}`}>Calendar</button>
              <button onClick={setTableView} className={`text-sm border-0 rounded-l-none ${view === "table" ? 'bg-green' : 'bg-white'}`}>List</button>
            </div>
          </div>
          { view == "calendar" &&
            <div className="flex">
              <iframe
                className="airtable-embed appear"
                src="https://airtable.com/embed/shrxS10aCQxlJYcvQ?backgroundColor=teal&viewControls=on"
                frameBorder="0"
                onmousewheel=""
                width="100%"
                height="533"
                style={{
                  background: "transparent",
                  border: "1px solid #ccc"
                }}
              />
            </div>
          }

          { view == "table" &&
            <div className="flex">
              <iframe
                className="airtable-embed appear"
                src="https://airtable.com/embed/shrbZZ1RBY1cQO0Np?backgroundColor=teal&viewControls=on"
                frameBorder="0"
                onmousewheel=""
                width="100%"
                height="533"
                style={{
                  background: "transparent",
                  border: "1px solid #ccc"
                }}
              />
            </div>
          }
          <div className="my-6">
            <p>👈 <Link href="/">Back home</Link></p>
          </div>
        </div>
      </Section>
    </Layout>
  )
}
