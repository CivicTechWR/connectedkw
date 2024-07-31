"use client"

import { AddToCalendarButton } from 'add-to-calendar-button-react';


export default function CalendarSubscriptionButton() {

  return (
      <AddToCalendarButton
        name="Get the calendar (ICS)"
        subscribe
        icsFile={`${process.env.NEXT_PUBLIC_BASE_URL}/events/calendar.ics`}
        iCalFileName="ConnectedKW"
        options="'Apple','Google','iCal','Outlook.com','Microsoft 365','Microsoft Teams'"
        buttonStyle="flat"
        lightMode="light"
        styleLight="--font: Outfit; --btn-background: #D81E5B; --btn-background-hover: #ffd166; --btn-hover-text: #030F12; --btn-text: #FFFFFF; --btn-border: none;"
        hideBranding={true}
        startDate="today"
        label="Get the calendar"
      >
      </AddToCalendarButton>
  )
}
