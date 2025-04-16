import { useState } from 'react'
import TagFilter from "components/TagFilter"

const Filters = ({ filters, selectedFilters, toggleFn, reset, children }) => {
  const [showFilters, setShowFilters] = useState(false)

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const numSelected = filters.reduce((sum, f) => {
    if (f.type === "boolean") {
      const val = selectedFilters[f.id] ? 1 : 0
      return sum + val
    }

    if (f.type === "select-multiple") {
      return sum + selectedFilters[f.id].length
    }
  }, 0)

  // const anySelected = filtersWithOptionsSelected.some(f => f)
  const anySelected = numSelected > 0

  return (
    <div className="block mb-3">
      <div className="flex">
        <p className="font-title text-xl">Filters 
        {
          anySelected && 
          <>
          <span>{` (${numSelected})`}</span>
          <button onClick={reset} className="mx-1 text-red">
            <i className="fa-solid fa-check"></i>
          </button>
          </>
        }
        </p>
      </div>
      <div className="">
        { filters.map(filter => {
          return (
            <TagFilter
              key={filter.id}
              filter={filter}
              toggleFn={toggleFn}
              selectedOptions={selectedFilters[filter.id]}
            />
          )
        })}
      </div>
      {
          anySelected && 
          <button onClick={reset} className="space-x-1 text-red">
            <span>Clear filters</span>
            <i className="fa-solid fa-xmark"></i>
          </button>
        }
    </div>
  )
}

export default Filters
