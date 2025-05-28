import Link from 'next/link';

export default function RequestSuccessPage() {
  return (
    <div className="container max-w-screen-lg mx-auto px-4 py-16 text-center">
      <div className="bg-white p-8 shadow-lg">
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
          Thank you for submitting your volunteer request!
        </h1>

        <p className="text-gray-600 mb-8">
          Your request has been successfully submitted and will be reviewed by
          our team.
        </p>

        <div className="flex justify-center items-center flex-col sm:flex-row gap-4">
          <Link href="/profiles/request" className="btn btn-outline">
            Submit Another Request
          </Link>
        </div>
      </div>
    </div>
  );
}
