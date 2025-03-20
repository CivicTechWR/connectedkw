"use client"

import { useState, useEffect } from "react"
import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    version: "weekly",
    libraries: ["maps"]
  });

export default function LocationSelector({className, handleSelect, value="", required=false}) {
  const [options, setOptions] = useState(null)
  const [address, setAddress] = useState(value)
  const [geocoder, setGeocoder] = useState(null)

  useEffect(() => {
    if (!geocoder) {
      loader
        .importLibrary('geocoding')
        .then(({Geocoder}) => {
            const gc = new Geocoder();
            setGeocoder(gc);
        })
        .catch((e) => {
            console.error(e)
        });
    }
  }, [])

  useEffect(() => {
    if (value && value !== address) {
      setAddress(value)
    }
  }, [value])

  const handleChange = async(e) => {
    const query = e.target.value
    setAddress(query)
    
    if (query.length < address.length) {
      return setOptions(null)
    }

    if (query.length > 2) {
      geocoder.geocode({address: query}, (results, status) => {
        if (results?.length > 0) {
          setOptions(results)
        }
      })
    }
  }

  const selectLocation = (location) => (e) => {
    e.preventDefault()
    setAddress(location.formatted_address)
    handleSelect(location)
    setOptions(null)
  }
  
  return (
      <div className={`flex flex-col mb-4 mt-2 relative ${className}`}>
        <input 
          onChange={handleChange} 
          value={address} 
          className="shadow appearance-none border w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
          type="text" 
          id={'location_address'} 
          name={'location_address'}
          required={required}
        />
      <div className="absolute top-10 z-10 left-0 right-0 flex flex-col bg-slate-100 shadow divide-y">
        {
          options?.map(option => {
            return <button className="p-1 focus:bg-light hover:bg-white text-left px-3 " key={option.place_id} onClick={selectLocation(option)}>{option.formatted_address}</button>
          })
        }
        </div>
      </div>
  )
}
