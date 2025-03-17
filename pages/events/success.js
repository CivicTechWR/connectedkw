import Link from 'next/link'
import Layout from 'components/Layout'

export default function EventSuccessPage() {
  return (
    <Layout>
      <div className="container max-w-screen-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-green-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4">
            Thank You for Submitting Your Event!
          </h1>
          
          <p className="text-gray-600 mb-8">
            Your event has been successfully submitted and will be reviewed by our team.
          </p>

          <div className="space-x-4">
            <Link 
              href="/events" 
              className="btn btn-primary"
            >
              View All Events
            </Link>
            <Link 
              href="/events/new" 
              className="btn btn-outline"
            >
              Submit Another Event
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
