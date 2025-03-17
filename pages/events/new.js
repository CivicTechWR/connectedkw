import { useState, useEffect, useRef } from 'react'
import Layout from 'components/Layout'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import { stateToMarkdown } from 'draft-js-export-markdown'
import { stateFromMarkdown } from 'draft-js-import-markdown'

import dynamic from 'next/dynamic';
const Editor = dynamic(
  () => import('react-draft-wysiwyg').then(mod => mod.Editor),
  { ssr: false }
) 
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css"

export default function NewEventPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editorState, setEditorState] = useState(EditorState.createEmpty())
  const [imageFile, setImageFile] = useState(null)
  const [fileUploading, setFileUploading] = useState(false)
  const fileInputRef = useRef(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    starts_at: '',
    ends_at: '',
    location_source_text: '',
    price: '',
    external_link: '',
    link_text: '',
    image_url: ''
  })

  // Convert markdown to editor state when description changes from import
  useEffect(() => {
    console.log('formData.description', formData.description)
    if (formData.description) {
      try {
        const contentState = stateFromMarkdown(formData.description)
        setEditorState(EditorState.createWithContent(contentState))
      } catch (error) {
        console.error('Error converting markdown to editor state:', error)
      }
    }
  }, [formData.description])

  const handleEditorStateChange = (state) => {
    setEditorState(state)
  }

  const onEditorBlur = () => {
    const markdown = stateToMarkdown(editorState.getCurrentContent())
    setFormData(prev => ({
      ...prev,
      description: markdown
    }))
  }

  const handleImport = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

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

      // Populate form with imported data
      const event = data.event
      setFormData({
        title: event.title || '',
        description: event.description || '',
        starts_at: event.starts_at ? new Date(event.starts_at).toISOString().slice(0, 16) : '', // Format for datetime-local input
        ends_at: event.ends_at ? new Date(event.ends_at).toISOString().slice(0, 16) : '',
        location_source_text: event.location_source_text || '',
        price: event.price || '',
        external_link: event.external_link || '',
        link_text: event.link_text || '',
        image_url: event.image_url || ''
      })
      
      setUrl('')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async(e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setFileUploading(true)
      const formData = new FormData()
      formData.append('file', file, file.name)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      
      // Update form with the new image URL
      setFormData(prev => ({
        ...prev,
        image_url: data.url
      }))

      // Clear the file input
      setImageFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error) {
      console.error('Error uploading image:', error)
      setError('Failed to upload image: ' + error.message)
    } finally {
      setFileUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create FormData if we have a file
      let body = formData
      if (imageFile) {
        const formDataWithFile = new FormData()
        Object.entries(formData).forEach(([key, value]) => {
          if (key !== 'image_url') { // Skip image_url since we're uploading a file
            formDataWithFile.append(key, value)
          }
        })
        formDataWithFile.append('image', imageFile)
        body = formDataWithFile
      }

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: imageFile ? {} : {
          'Content-Type': 'application/json',
        },
        body: imageFile ? body : JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error?.errors[0]?.message || 'Failed to submit event')
      }

      // Redirect to event page or show success message
      window.location.href = `/events/${data.event.id}`
    } catch (error) {
      setError(error.message)
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <Layout>
      <div className="container max-w-screen-lg mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Submit New Event</h1>
        
        {/* Import section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Import Event</h2>
          <form onSubmit={handleImport} className="">
            <div className="mb-4">
              <label 
                htmlFor="url" 
                className="block text-sm font-semibold mb-1"
              >
                Event Page URL (optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/event-page"
                  className="shadow appearance-none border flex-1 py-2 px-3 text-black focus:outline-none focus:shadow-outline"
                />
                <button
                  type="submit"
                  disabled={loading || !url}
                  className={`btn btn-primary ${
                    loading || !url ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          </form>
        </div>

        <hr className="border-t border-gray-300 my-6" />

        {/* Event form */}
        <h2 className="text-xl font-semibold mb-4">Event Form</h2>
        <form onSubmit={handleSubmit} className=" space-y-4">
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-semibold mb-1">
              Event Title*
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full shadow appearance-none border flex-1 py-2 px-3 text-black focus:outline-none focus:shadow-outline"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold mb-1">
              Description*
            </label>
            <div className="border shadow">
              <Editor
                editorState={editorState}
                onEditorStateChange={handleEditorStateChange}
                onBlur={onEditorBlur}
                wrapperClassName="w-full"
                editorClassName="px-3 min-h-[200px]"
                toolbar={{
                  options: ['inline', 'blockType', 'list', 'link', 'emoji', 'history'],
                  inline: {
                    options: ['bold', 'italic', 'underline', 'strikethrough'],
                  },
                  blockType: {
                    options: ['Normal', 'H2', 'H3', 'H4', 'Blockquote'],
                  },
                  list: {
                    options: ['unordered', 'ordered'],
                  },
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="starts_at" className="block text-sm font-semibold mb-1">
                Start Date and Time*
              </label>
              <input
                type="datetime-local"
                id="starts_at"
                name="starts_at"
                required
                value={formData.starts_at}
                onChange={handleChange}
                className="w-full shadow appearance-none border flex-1 py-2 px-3 text-black focus:outline-none focus:shadow-outline"
              />
            </div>

            <div>
              <label htmlFor="ends_at" className="block text-sm font-semibold mb-1">
                End Date and Time
              </label>
              <input
                type="datetime-local"
                id="ends_at"
                name="ends_at"
                value={formData.ends_at}
                onChange={handleChange}
                className="w-full shadow appearance-none border flex-1 py-2 px-3 text-black focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>

          <div>
            <label htmlFor="location_source_text" className="block text-sm font-semibold mb-1">
              Location*
            </label>
            <input
              type="text"
              id="location_source_text"
              name="location_source_text"
              required
              value={formData.location_source_text}
              onChange={handleChange}
              className="w-full shadow appearance-none border flex-1 py-2 px-3 text-black focus:outline-none focus:shadow-outline"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-semibold mb-1">
              Price
            </label>
            <input
              type="text"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Free"
              className="w-full shadow appearance-none border flex-1 py-2 px-3 text-black focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="external_link" className="block text-sm font-semibold mb-1">
                Registration/Ticket Link
              </label>
              <input
                type="url"
                id="external_link"
                name="external_link"
                value={formData.external_link}
                onChange={handleChange}
                className="w-full shadow appearance-none border flex-1 py-2 px-3 text-black focus:outline-none focus:shadow-outline"
              />
            </div>

            <div>
              <label htmlFor="link_text" className="block text-sm font-semibold mb-1">
                Link Text
              </label>
              <input
                type="text"
                id="link_text"
                name="link_text"
                value={formData.link_text}
                onChange={handleChange}
                placeholder="Register Here"
                className="w-full shadow appearance-none border flex-1 py-2 px-3 text-black focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Event Image
            </label>
            {formData.image_url ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="h-20 w-20 object-cover rounded"
                  />
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Remove and upload different image
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  disabled={fileUploading}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    disabled:opacity-50"
                />
                {fileUploading && (
                  <div className="text-sm text-gray-600">
                    Uploading...
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary w-full md:w-auto ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Submitting...' : 'Submit Event'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
} 