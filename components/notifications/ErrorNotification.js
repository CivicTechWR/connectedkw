export default function ErrorNotification({ message, onClose }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] pt-6 px-4">
      <div className="container max-w-screen-md mx-auto w-full">
        <div className="flex items-center justify-between bg-red text-white px-4 py-2 shadow-xl">
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
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <span>{message}</span>
        </div>
        <button 
          onClick={onClose}
          className="text-white hover:text-red-100"
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
  )
} 