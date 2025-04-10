import { createEvents } from 'ics'
import { DateTime } from 'luxon'
import { getEvents } from 'integrations/directus';
import {marked} from 'marked';

function generateCalendar(events) {
  const eventData = events.map(event => {
    const startDate = DateTime.fromISO(event.starts_at, { zone: "America/Toronto" })
    const htmlDescription = marked.parse(event.description || "")
    const markdownDescription = event.description ? event.description.trim() : ""
    const eventObj = {
      title: event.title.trim(),
      description: markdownDescription,
      start: startDate.toUTC().toFormat('y-M-d-H-m').split("-").map((a) => parseInt(a)),
      url: event.external_link.trim(),
      calName: 'Connected KW',
      htmlContent: htmlDescription,
    }

    if (event.ends_at) {
      const endDate = DateTime.fromISO(event.ends_at, { zone: "America/Toronto" })
      eventObj.end = endDate.toUTC().toFormat('y-M-d-H-m').split("-").map((a) => parseInt(a))
    } else {
      eventObj.duration = { hours: 1 }
    }

    if (event.location?.name) {
      eventObj.location = event.location.name.trim()
      if (event.location?.map_point?.coordinates) {
        eventObj.geo = {
          lon: event.location.map_point.coordinates[0],
          lat: event.location.map_point.coordinates[1]
        }
      }
    } else if (event.location_source_text) {
      eventObj.location = event.location_source_text.trim()
    } else {
      eventObj.location = "No location provided"
    }

    return eventObj
  })

  const { error, value } = createEvents(eventData)

  if (error) {
    console.log(error)
    throw Error(error)
  }

  return `${value}`;
}

function Calendar() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }) {
  try {
    // We make an API call to gather the events for the calendar
    const events = await getEvents()

    // We generate the ics file with the event data
    const calendar = generateCalendar(events);

    res.setHeader('Content-Type', 'text/calendar');
    // we send the ICS to the browser
    res.write(calendar);
    res.end();
  } catch (err) {
    return {
       notFound: true,
     }
  }

  return {
    props: {},
  };
}

export default Calendar;
