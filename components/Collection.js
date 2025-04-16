'use client'

import { useState, useEffect } from "react"
import dynamic from 'next/dynamic'
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
  views: ['list', 'calendar'],
  defaultView: 'calendar'
}

const Collection = ({ title="Events", events=[], filters=[], loading, config={}, children }) => {
  const fullConfig = { ...defaultConfig, ...config }
  const [isLoading, setLoading] = useState(loading)
  const emptyFilters = filters.reduce((a, f) => {
    const defaultValue = defaultValues[f.type]
    return { ...a, [f.id]: defaultValue}
  }, {}) 
  const [selectedFilters, setSelectedFilters] = useState(emptyFilters)
  const [filteredEvents, setFilteredEvents] = useState(events)
  const [featured, setFeatured] = useState(false)
  const [view, setView] = useState(fullConfig.defaultView || "calendar")

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
    let newFilteredEvents = events;

    filters.forEach(filter => {
      switch (filter.type) {
      case "boolean":
        if (selectedFilters[filter.id] === true) {
          newFilteredEvents = newFilteredEvents.filter(event => filter.attributeFn(event) === true) 
        }
        break;
      case "select-multiple":
        if (Boolean(selectedFilters[filter.id]?.length)) {
          newFilteredEvents = newFilteredEvents.filter(event => {
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

    setFilteredEvents(newFilteredEvents)
    setLoading(false)
  }

  const reset = () => {
    setSelectedFilters(emptyFilters)
  }

  const toggleFn = (filter, value) => {
    switch (filter.type) {
      case "select-multiple": {
        const alreadySelected = selectedFilters[filter.id].includes(value)

        if (alreadySelected) {
          // unselect tag
          const optionRemoved = selectedFilters[filter.id].filter(f => f !== value)
          setSelectedFilters({ ...selectedFilters, [filter.id]: optionRemoved })
        } else {
          // add tag
          const optionAdded = [...selectedFilters[filter.id], value]
          setSelectedFilters({ ...selectedFilters, [filter.id]: optionAdded })
        }
        break;
      }
      case "boolean": {
        const newValue = !selectedFilters[filter.id]
        setSelectedFilters({ ...selectedFilters, [filter.id]: newValue })
        break;
      }
      default:
        break;
    }
  }

  const length = isLoading ? false : `${filteredEvents.length}`

  return (
    <div id="collection" className={`relative min-h-0 flex flex-col w-full h-full styled-scrollbar my-2`}>
      <div className="">
        <div className={`flex-auto flex-col space-y-2`}>
          <h1 className="space-x-2">
            <span className="text-4 md:text-6xl font-title">{title}</span>
            {length && <span className="">{` (${length})`}</span>}
          </h1>
          {children}
          {isLoading ? (
            <Loading />
            ) : (
            <>
              <div className="w-full lg:flex justify-between items-end lg:items-center">
                <Filters
                  filters={filters}
                  selectedFilters={selectedFilters}
                  toggleFn={toggleFn}
                  reset={reset}
                />
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
                <div className="flex-auto flex-col space-y-2 overflow-auto styled-scrollbar snap-y relative my-2">
                  {filteredEvents.map(event => <EventCard labels={fullConfig.labels} event={event} key={event.id} />)}
                </div>
              }
              {
                view === "calendar" && 
                <CalendarView events={filteredEvents} /> 
              }
              {
                view === "map" && 
                <InteractiveMap features={filteredEvents} mapConfig={{ mapId: title }} /> 
              }
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Collection
