import styles from "styles/events.module.css"
import Link from 'next/link'
import Image from 'next/image'
import { buildDateString } from 'utils/dates'

const EventCard = ({ event, showImage, labels }) => {
  if (!event) return null

  const { 
    featured,
    title,
    description,
    starts_at,
    ends_at,
    categories,
    tags,
    image,
    location,
    slug,
    classification,
    location_source_text,
    price
  } = event;

  const dateString = buildDateString(starts_at, ends_at)

  const urlFragments = {
    'activity': 'activities',
    'event': 'events',
    'recurring event': 'events',
    'camp': 'events'
  }
  const urlFragment = urlFragments[classification]

  return (
    <Link href={`/${urlFragment}/${slug}`} className={`${styles.eventCard} btn snap-start transition-all relative p-0 items-start flex-col w-full bg-white border-3 rounded-xl border-black overflow-hidden ${styles.result}`}>
      <div className={`${styles.appear} relative flex flex-col w-full md:h-full min-h-0`}>
        {
          (featured) && 
          <div className={`bg-red text-black flex-none rounded-t-lg w-full text-sm px-3 py-1 flex font-medium`}>
            {`️⭐ FEATURED ️⭐`}
          </div>
        }
        <div className="w-full flex-auto min-h-0 flex flex-col sm:flex-row justify-stretch items-stretch">
        { ((featured || showImage) && image) &&
          <div className={`relative basis-1/2 flex-auto min-h-0 overflow-hidden`}>
            <img
              className={`object-cover w-full h-full min-[500px]:max-md:aspect-square ${styles.appear}`}
              src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${image.id}?key=small-640`}
              alt={image.description || image.title} 
              title={image.title}
              loading="lazy"
            />
          </div>
        }
          <div className={`basis-1/2 flex-auto text-left overflow-auto h-full styled-scrollbar p-3`}>
            <h3 className="text-xl mb-2 font-body font-medium">{title}</h3>
            { (classification === "event" || classification === "camp") && 
              <p className="text-sm mb-1 space-x-3 flex flex-nowrap">
                <span>🗓</span>
                <span className="space-x-2">
                  <span className="font-medium">{labels.date}</span>
                  <time>{dateString}</time>
                </span>
              </p> 
            }
            { location && 
              <p className="text-sm mb-1 space-x-3 flex flex-nowrap">
                <span>📍</span>
                <span className="space-x-2">
                  <span className="font-medium">{labels.location}</span>
                  <span>{location.name}</span>
                </span>
              </p>
            }
            { !location && location_source_text && 
              <p className="text-sm mb-1 space-x-3 flex flex-nowrap">
                <span>📍</span>
                <span className="space-x-2">
                  <span className="font-medium">{labels.location}</span>
                  <span>{location_source_text}</span>
                </span>
              </p>
            }
            { price &&  
              <p className="text-sm mb-1 space-x-3 flex flex-nowrap">
                <span>🎟</span>
                <span className="space-x-2">
                  <span className="font-medium">{labels.price}</span>
                  <span>{price}</span>
                </span>
              </p>
            }
            { Boolean(categories?.length) && 
              <p className="text-sm mb-1 space-x-3 flex flex-nowrap">
                <span>🏷</span>
                <span className="space-x-2">
                  <span className="font-medium">{labels.categories}</span>
                  <span>{categories.map(c => c.name).join(', ')}</span>
                </span>
              </p>
            }
            { Boolean(tags?.length) && 
              <p className="text-sm mb-1 space-x-3 flex flex-nowrap">
                <span>#️⃣</span>
                <span className="space-x-2">
                  <span className="font-medium">{labels.tags}</span>
                  <span>{tags.map(t => t.name).join(', ')}</span>
                </span>
              </p>
            }
          </div>
        </div>
      </div>
    </Link>
  )
}

export default EventCard