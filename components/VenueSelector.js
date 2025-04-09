"use client"

import { useState, useEffect } from "react"
import { searchVenues } from 'integrations/directus';

const loader = new Loader({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    version: "weekly",
    libraries: ["maps"]
});

export default function LocationSelector({className, handleSelect, value="", required=false}) {
  const [options, setOptions] = useState(null)
  const [venue, setVenue] = useState(value)

  useEffect(() => {
    if (value && value !== venue) {
      setVenue(value)
    }
  }, [value])

  const handleChange = async(e) => {
    const query = e.target.value
    setVenue(query)
    
    if (query.length < venue.length) {
      return setOptions(null)
    }

    if (query.length > 2) {
      const venues = await searchVenues(query)
      if (venues) {
        setOptions([venues])
      }
    }
  }

  const selectVenue = (venue) => (e) => {
    e.preventDefault()
    setVenue(venue.formatted_address)
    handleSelect(venue)
    setOptions(null)
  }
  
  return (
      <div className={`flex flex-col mb-4 mt-2 relative ${className}`}>
        <input 
          onChange={handleChange} 
          value={venue} 
          className="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
          type="text" 
          id={'venue'} 
          name={'venue'}
        />
      <div className="absolute top-10 z-10 left-0 right-0 flex flex-col bg-slate-100 shadow divide-y">
        {
          options?.map(option => {
            return <button className="p-1 focus:bg-light hover:bg-white text-left px-3 " key={option.id} onClick={selectVenue(option)}>{option.name}</button>
          })
        }
        </div>
      </div>
  )
}
