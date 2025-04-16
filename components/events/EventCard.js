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
  const imageUrl = image?.id ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${image.id}?key=small-640` : "/default-event-image.png"

  return (
    <div className={`py-4 snap-start transition-all relative items-start flex-col w-full`}>
      <div className={`shadow relative flex flex-col w-full md:h-full min-h-0`}>
        {
          (featured) && 
          <div className={`bg-red text-black flex-none w-full text-sm px-3 py-1 flex font-medium`}>
            {`️⭐ FEATURED ️⭐`}
          </div>
        }
        <div className="w-full gap-4 flex-auto min-h-0 flex flex-col sm:flex-row">
        { (featured && image) &&
          <div className={`basis-1/2 relative flex-auto min-h-0 overflow-hidden`}>
            <Link href={`/${urlFragment}/${slug}`}>
            <Image
              className={`object-cover w-full h-full min-[500px]:max-md:aspect-square`}
              src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${image.id}?key=small-640`}
              alt={image.description || image.title} 
              title={image.title}
              loading="lazy"
              height="500"
              width="500"
            />
            </Link>
          </div>
        }

        { (!featured && showImage) &&
          <div className={`w-full aspect-video sm:aspect-square sm:w-40 grow-0 relative min-h-0 overflow-hidden`}>
            <Link href={`/${urlFragment}/${slug}`}>
            <Image
              className={`object-cover w-full h-full min-[500px]:max-md:aspect-square`}
              src={imageUrl}
              alt={"event image"} 
              loading="lazy"
              height="200"
              width="200"
            />
            </Link>
          </div>
        }
          <div className={`basis-1/2 flex-auto text-left overflow-auto h-full styled-scrollbar p-3`}>
            <Link href={`/${urlFragment}/${slug}`}><h3 className="text-xl mb-2 font-body font-medium">{title}</h3></Link>
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
    </div>
  )
}

export default EventCard