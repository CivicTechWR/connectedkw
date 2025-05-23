'use client';

import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

const generateMessage = (info, session) => {
  if (info === 'loggedin') {
    const name = session?.user?.first_name;
    const message = name ? `Welcome back ${name}!` : 'Welcome back!';
    return message;
  }

  if (info === 'protected') {
    return 'Please log in or register to access this page.';
  }

  return null;
};

export default function InfoNotification() {
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState()
  const searchParams = useSearchParams()
  const info = searchParams.get('info')
  const { data: session } = useSession()

  useEffect(() => {
    if (info) {
      setShow(true)
      const infoMessage = generateMessage(info, session)
      setMessage(infoMessage)

      const timer = setTimeout(() => setShow(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [info, session])


  if (!show) return null

  return (
    <div
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[1000] transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } w-full lg:w-1/2 px-4`}
    >
      <div className="flex items-center justify-between bg-yellow text-black px-4 py-2 rounded-md shadow-md w-full">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{message}</span>
        </div>
        <button
          onClick={() => setShow(false)}
          className="text-black hover:text-slate-500"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
