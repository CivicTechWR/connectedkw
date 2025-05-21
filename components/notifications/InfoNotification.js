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
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState();
  const searchParams = useSearchParams();
  const info = searchParams.get('info');
  const { data: session } = useSession();

  console.log({ session });

  useEffect(() => {
    if (info) {
      setShow(true);
      const infoMessage = generateMessage(info, session);
      setMessage(infoMessage);
    }
  }, [searchParams]);

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] pt-6 px-4">
      <div className="container max-w-screen-md mx-auto w-full">
        <div className="flex items-center justify-between bg-yellow text-black px-4 py-2 shadow-xl">
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
    </div>
  );
}
