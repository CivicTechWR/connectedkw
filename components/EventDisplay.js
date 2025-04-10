import { eventCategories, tagEmojiDict } from "../utils/constants"
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { AddToCalendarButton } from 'add-to-calendar-button-react';
import Link from 'next/link'
import { buildDateString, getCalendarDates } from 'utils/dates'
import Tag from 'components/Tag'

function EventDisplay({ event, showImage=true, closeModal, backLink="/events" }) {

  if (!event) return null

  console.log({event})

  const { title,
    description,
    starts_at,
    ends_at,
    external_link,
    link_text,
    price,
    tags=[],
    categories,
    image,
    image_url,
    location  
  } = event;

  const dateString = buildDateString(starts_at, ends_at)

  const { calendarStartDate, calendarStartTime, calendarEndDate, calendarEndTime} = getCalendarDates(starts_at, ends_at)
  const calendarLocation = (location?.name && location?.street_address) ? `${location.name}, ${location.street_address}` : (location?.name) ? `${location.name}` : "TBD"
  const calendarTitle = title ? `${title}` : "Untitled event"

  const imageUrl = image ? `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${image.id}` : image_url ? image_url : null
  const showCalendarButton = new Date(starts_at) > new Date()

  return (
    <div className={`overflow-auto styled-scrollbar min-h-0 h-full w-full`}>
    
      <div>
        {image && showImage &&
        <div className="mb-4">
          <div className="relative">
            <img className="w-full object-cover aspect-video" src={imageUrl} alt={image.description} width={image.width} height={image.height} />
            { (image.credit) && <small className={`absolute bottom-0 left-0 right-0 text-xs p-1`}><ReactMarkdown>{image.credit}</ReactMarkdown></small> }
          </div>
        </div>
        }
        {!image && image_url && showImage &&
        <div className="mb-4">
          <div className="relative">
            <img className="w-full object-cover aspect-video" src={imageUrl} />
          </div>
        </div>
        }
        {title && <h1 className="text-4xl mb-3 font-body font-bold">{title}</h1>}
        <p className="mb-1 space-x-3 flex flex-nowrap">
          <span>🗓</span>
          <span>{dateString}</span>
        </p>
        { price && <p className="mb-1 space-x-3 flex flex-nowrap"><span>🎟</span><span>{price}</span></p>}
        { location && <p className="mb-1 space-x-3 flex flex-nowrap"><span>📍</span><span>{location.name}<br />{location.street_address}</span></p>}
        { external_link && <p className="mb-1 space-x-3 flex flex-nowrap"><span>🔗</span><a href={external_link} target="_blank" rel="noopener noreferrer">{`${link_text}`}</a></p>}
        { description && 
          <div className="my-4 markdown">
            <ReactMarkdown 
              rehypePlugins={[rehypeRaw]} 
              remarkPlugins={[remarkGfm]}
            >
              {description}
            </ReactMarkdown>
          </div>
        }

        {tags.length > 0 &&
          <div className="my-4">
            <p className="font-body font-medium">{`Tags: ${tags.map(t => t.name).join(", ")}`}</p>
          </div>
        }

        <div className="flex items-center">
        {
          showCalendarButton && 
          <AddToCalendarButton
            name={calendarTitle}
            startDate={calendarStartDate}
            startTime={calendarStartTime}
            endDate={calendarEndDate}
            endTime={calendarEndTime}
            timeZone="America/Toronto"
            location={calendarLocation}
            description={description}
            options="'Apple','Google','iCal','Outlook.com','Microsoft 365','Microsoft Teams','Yahoo'"
            buttonStyle="flat"
            styleLight="--font: Outfit; --btn-background: #D81E5B; --btn-background-hover: #ffd166; --btn-hover-text: #030F12; --btn-text: #FFFFFF; --btn-border: none;"
            hideBranding={true}
            debug={true}
          ></AddToCalendarButton>
        }
        </div>

      </div>
    </div>
  )
}

export default EventDisplay
