"use client"

import { useState, useEffect } from "react"
import Link from 'next/link'
import dynamic from 'next/dynamic'
import TagFilter from "components/TagFilter"
import EventCard from "components/events/EventCard"
import Filters from "components/Filters"
import Loading from 'components/Loading'

const CalendarView = dynamic(() => import('components/CalendarView'))
const InteractiveMap = dynamic(() => import('components/InteractiveMap'))

const defaultValues = {
  "boolean": false,
  "select-multiple": []
}

const defaultConfig = {
  labels: {
    date: 'Date',
    location: 'Place',
    price: 'Price',
    categories: 'Categories',
    tags: 'Tags',
  },
  views: ['list', 'calendar']
}

const EventsFeed = ({ title="Family-friendly events", events=[], tags=[], loading, config={}, children }) => {
  const fullConfig = { ...defaultConfig, ...config }
  const filters = [
    {
      label: 'Featured',
      id: 'featured',
      type: 'boolean',
      default: false,
      attributeFn: (event) => event.featured
    },
    {
      label: 'Tags',
      id: 'tags',
      type: 'select-multiple',
      options: tags,
      multipleSelect: true,
      attributeFn: (event) => event.tags.map(t => t.id)
    }
  ]
  const [isLoading, setLoading] = useState(loading)
  const emptyFilters = filters.reduce((a, f) => {
    const defaultValue = defaultValues[f.type]
    return { ...a, [f.id]: defaultValue}
  }, {}) 
  const [selectedFilters, setSelectedFilters] = useState(emptyFilters)
  const [filteredEvents, setFilteredEvents] = useState(events)
  const [featured, setFeatured] = useState(false)
  const [view, setView] = useState("list")

  const toggleView = (newView) => () => {
    setView(newView)
  }

  useEffect(() => {
    filterEvents()
  }, [selectedFilters, events])

  useEffect(() => {
    setLoading(loading)
  }, [loading])

  const filterEvents = () => {
    setLoading(true)
    let filteredEvents = events;

    filters.forEach(filter => {
      switch (filter.type) {
      case "boolean":
        if (selectedFilters[filter.id] === true) {
          filteredEvents = filteredEvents.filter(event => filter.attributeFn(event) === true) 
        }
        break;
      case "select-multiple":
        if (Boolean(selectedFilters[filter.id]?.length)) {
          filteredEvents = filteredEvents.filter(event => {
            const attributeIds = filter.attributeFn(event)
            const selectedFilterIds = selectedFilters[filter.id]
            const matches = selectedFilterIds.map(id => attributeIds.includes(id))
            // only allow events that match ALL the selected filters.
            // use .some() to keep the events that match ANY of the selected filters.
            return matches.some(m => m)
          })
        }
        break;
      }
    })

    setFilteredEvents(filteredEvents)
    setLoading(false)
  }

  // const fetchEvents = () => {
  //   setLoading(true)
  //   fetch("/api/events")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setAllEvents(data.events)
  //       setFilteredEvents(data.events)
  //       setLoading(false)
  //     })
  // }

  const reset = () => {
    setSelectedFilters(emptyFilters)
  }

  const toggleFn = (filter, value) => {
    switch (filter.type) {
      case "select-multiple":
        const alreadySelected = selectedFilters[filter.id].includes(value)

        if (alreadySelected) {
          // unselect tag
          const optionRemoved = selectedFilters[filter.id].filter(f => f != value)
          setSelectedFilters({ ...selectedFilters, [filter.id]: optionRemoved })
        } else {
          // add tag
          const optionAdded = [...selectedFilters[filter.id], value]
          setSelectedFilters({ ...selectedFilters, [filter.id]: optionAdded })
        }
        break;
      case "boolean":
        const newValue = !selectedFilters[filter.id]
        setSelectedFilters({ ...selectedFilters, [filter.id]: newValue })
    }
  }

  const length = isLoading ? false : `${filteredEvents.length}`

  return (
    <div id="event-feed" className={`relative min-h-0 flex flex-col w-full h-full styled-scrollbar`}>
      <div className="">
        <div className={`flex-auto flex-col space-y-2`}>
          {children}
          {isLoading ? (
            <Loading />
            ) : (
            <div className="md:grid grid-cols-4">
              <div className="col-span-1 mb-6">
                <Filters
                  filters={filters}
                  selectedFilters={selectedFilters}
                  toggleFn={toggleFn}
                  reset={reset}
                />
              </div>
              <div className="col-span-3">
                <div className="sm:flex justify-between items-center mb-3">
                  <p className="text-xl font-semibold">
                    Events 
                    {length && <span className="">{` (${length})`}</span>}
                  </p>
                  <div className="space-x-2">
                    {fullConfig.views.map(v => {
                      if (v === 'list') {
                        return (
                          <button key={`list-${v.id}`} onClick={toggleView(v)} className={`hover:text-red ${view === v ? "border-b-2 border-red" : ""}`}>
                            <span>List</span>
                          </button>
                        )
                      }

                      if (v === 'calendar') {
                        return (
                          <button key={`cal-${v.id}`} onClick={toggleView(v)} className={`hover:text-red ${view === v ? "border-b-2 border-red" : ""}`}>
                            <span>Calendar</span>
                          </button>
                        )
                      } 

                      if (v === 'map') {
                        return (
                          <button key={`map-${v.id}`} onClick={toggleView(v)} className={`hover:text-red ${view === v ? "border-b-2 border-red" : ""}`}>
                            <span>Map</span>
                          </button>
                        )
                      } 
                    })}
                  </div>
                </div>
              {
                view === "list" && 
                <div className="flex-auto flex-col styled-scrollbar snap-y relative my-2">
                  {filteredEvents.map(event => <EventCard showImage={true} labels={fullConfig.labels} event={event} key={event.id} />)}
                </div>
              }
              {
                view === "calendar" && 
                <CalendarView events={filteredEvents} /> 
              }
              {
                view === "map" && 
                <InteractiveMap 
                  features={filteredEvents} 
                  mapConfig={{ 
                    mapId: 'events-map', 
                    preview: { title: 'title', details: [{ field: 'starts_at', type: 'date' }]}
                  }} 
                /> 
              }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventsFeed