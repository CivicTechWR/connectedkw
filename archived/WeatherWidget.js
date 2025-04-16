import { useState, useEffect } from "react"
import Image from 'next/image'

function WeatherWidget() {
  const [current, setCurrent] = useState(null)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    if (!current) {
      fetchCurrentWeather()
    }
  }, [current])

  const fetchCurrentWeather = () => {
    setLoading(true)
    fetch("/api/weather")
      .then((res) => res.json())
      .then((data) => {
        setCurrent(data.current)
        setLoading(false)
      })
  }

  if (isLoading || !current) {
    return (
      <div id="weather-widget">
        <div className="border-black border-3 rounded-xl bg-white p-12 text-left">
          <Image src="/loading.svg" width={40} height={40} alt="loading" />
        </div>
      </div>
    )
  }

  const description = current.weather[0]
  const icon = description.icon
  const imageSrc = `http://openweathermap.org/img/wn/${icon}@4x.png`
  const temp = Math.round(current.temp)
  const feelsLike = Math.round(current.feels_like)

  return (
    <div id="weather-widget" className="relative w-full">
      <Image src="/clock-tower.png" height="160" width="100" alt="" className="absolute bottom-0 left-0 -rotate-6" />
      <Image src={imageSrc} height="120" width="120" alt={description.description} className="absolute -top-16 left-8 rotate-3" />
      <div className="border-black border-3 rounded-xl bg-white p-4 pl-24 text-left w-100 max-w-md lg:max-w-[300px]">
        <p className="text-lg font-medium">Going out?</p>
        <p className="text-sm">{`Current weather: ${description.description}`}</p>
        <p className="text-sm">{`It's ${temp}°С, feels like ${feelsLike}°С`}</p>
      </div>
    </div>
  )
}

export default WeatherWidget