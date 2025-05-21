'use client';

import { useState, useEffect } from 'react';

export default function Notification({
  type = 'info', // 'info', 'error', 'success'
  message,
  onClose,
  autoClose = 5000, // auto close after 5 seconds, set to 0 to disable
}) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    if (onClose) onClose();
  };

  if (!show || !message) return null;

  // Define styles based on type
  const styles = {
    info: {
      bg: 'bg-yellow',
      text: 'text-black',
      hover: 'hover:text-slate-500',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
    success: {
      bg: 'bg-green-500',
      text: 'text-white',
      hover: 'hover:text-slate-200',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        />
      ),
    },
    error: {
      bg: 'bg-red',
      text: 'text-white',
      hover: 'hover:text-red-100',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
  };

  const currentStyle = styles[type] || styles.info;

  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] pt-6 px-4">
      <div className="container max-w-screen-md mx-auto w-full">
        <div
          className={`flex items-center justify-between ${currentStyle.bg} ${currentStyle.text} px-4 py-2 shadow-xl rounded-md`}
        >
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {currentStyle.icon}
            </svg>
            <span>{message}</span>
          </div>
          <button
            onClick={handleClose}
            className={`${currentStyle.text} ${currentStyle.hover}`}
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
