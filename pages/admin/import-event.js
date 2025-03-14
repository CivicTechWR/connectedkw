import { useState } from 'react'
import Layout from 'components/Layout'

export default function ImportEventPage() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    try {
      const response = await fetch('/api/process-event-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process URL')
      }

      setStatus({
        type: 'success',
        message: 'Event processed successfully!',
        details: data.event
      })
      setUrl('')
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Import Event from URL</h1>
        
        <form onSubmit={handleSubmit} className="max-w-xl">
          <div className="mb-4">
            <label 
              htmlFor="url" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Event URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/event-page"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Processing...' : 'Import Event'}
          </button>
        </form>

        {status && (
          <div className={`mt-8 p-4 rounded ${
            status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <p className="font-bold">{status.message}</p>
            {status.details && (
              <div className="mt-4">
                <h3 className="font-bold mb-2">Imported Event Details:</h3>
                <pre className="bg-gray-50 p-4 rounded overflow-auto">
                  {JSON.stringify(status.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
} 