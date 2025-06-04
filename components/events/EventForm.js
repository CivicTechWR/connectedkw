'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { uploadImage } from 'integrations/directus'
import { importEventFromUrl, generateTags } from 'integrations/openai'
import LocationSelector from 'components/LocationSelector'
import ErrorNotification from 'components/notifications/ErrorNotification'
import TagButton from 'components/TagButton'
import Section from 'components/layout/Section'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { DateTime } from 'luxon'

const RichTextEditor = dynamic(() => import('components/RichTextEditor'), { ssr: false })

export default function NewEventPage({ tags }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fileUploading, setFileUploading] = useState(false)
  const router = useRouter()
  const [selectedTags, setSelectedTags] = useState([])
  const editorRef = useRef(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    starts_at: '',
    ends_at: '',
    location_name: '',
    location_address: '',
    location_source_text: '',
    price: '',
    external_link: '',
    link_text: '',
    image_url: '',
    image: null,
    tags: []
  })

  // Convert markdown to editor state when description changes from import
  useEffect(() => {
    if (formData.description.length > 0 && editorRef.current) {
      editorRef.current.setMarkdown(formData.description)
    }
  }, [formData.description])

  const handleEditorChange = (e) => {
    const content = editorRef.current.getMarkdown()
    setFormData(prev => ({
      ...prev,
      description: content
    }))
  }

  const handleTagClick = (tag) => {
    console.log('tag', tag)
    setSelectedTags(prev => {
      const isSelected = prev.some(t => t === tag.id)
      const newTags = isSelected 
        ? prev.filter(t => t !== tag.id)
        : [...prev, tag.id]

      return newTags
    })
  }

  const handleImport = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSelectedTags([]) // Reset selected tags

    try {
      const { event, error, message } = await importEventFromUrl(url)
      if (error) {
        throw new Error(error)
      }

      // Generate tags
      const suggestedTags = await generateTags(event)
      console.log({suggestedTags})
      // Auto-select suggested tags
      if (suggestedTags.tags) {
        setSelectedTags(suggestedTags.tags)
      }
      
      setFormData({
        title: event.title || '',
        description: event.description || '',
        starts_at: event.starts_at,
        ends_at: event.ends_at || '',
        location_name: event.location_name || '',
        location_address: event.location_address || '',
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
    if (e.target.files[0]) {
      setFileUploading(true)
      const formData = new FormData()
      formData.append('file', e.target.files[0], e.target?.files[0]?.name)
      const result = await uploadImage(formData)
      
      setFormData(prev => ({
        ...prev,
        image: result
      }))
      
      setFileUploading(false)
    } else {
      setFormData(prev => ({
        ...prev,
        image: null
      }))
    }
  }

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      location_address: location.formatted_address
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const eventData = {
      ...formData,
      tags: selectedTags.map(t => ({tags_id: t}))
    }
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify(eventData)
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error?.errors[0]?.message || 'Failed to submit event')
      }

      // Redirect to event page or show success message
      router.push(`/events/success`)
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
    <>
      {error && (
        <ErrorNotification 
          message={error} 
          onClose={() => setError(null)} 
        />
      )}
      
      <Section>
        <h1 className="text-3xl font-bold mb-8">Submit an Event</h1>
        
        {/* Import section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Import Event (optional)</h2>
          <p className="text-gray-500 mb-4">{`If you already have an event page elsewhere, drop the link here and we'll try to import the details.`}</p>
          <form onSubmit={handleImport} className="">
            <div className="mb-4">
              <label 
                htmlFor="url" 
                className="block text-sm font-semibold mb-1"
              >
                Event Page URL
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
                    className={`btn btn-primary w-[92px] flex justify-center items-center ${!url ? 'opacity-50 cursor-not-allowed' : ''} ${loading ? 'bg-white hover:bg-white cursor-not-allowed' : ''}`}
                >
                    {loading ? <Image src="/loading.svg" width={28} height={28} alt="loading" /> : 'Import'}
                </button>
              </div>
            </div>
          </form>
        </div>

        <hr className="border-t border-gray-300 my-6" />

        {/* Event form */}
        <h2 className="text-xl font-semibold mb-4">Event Details</h2>
        <form onSubmit={handleSubmit} className=" space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold mb-1">
              Title*
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
              <Suspense fallback={<div>Loading...</div>}>
                <RichTextEditor 
                  markdown={formData.description} 
                  onBlur={handleEditorChange}
                  ref={editorRef}
                />
              </Suspense>
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
            <label htmlFor="location_name" className="block text-sm font-semibold mb-1">
              Location Name
            </label>
            <input
              type="text"
              id="location_name"
              name="location_name"
              value={formData.location_name}
              onChange={handleChange}
              className="w-full shadow appearance-none border flex-1 py-2 px-3 text-black focus:outline-none focus:shadow-outline"
            />
          </div>

          <div>
            <label htmlFor="location_address" className="block text-sm font-semibold mb-1">
              Location Address*
            </label>
            <LocationSelector
              handleSelect={handleLocationSelect}
              required={true}
              value={formData.location_address}
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
                Link to Event Page
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
            {formData.image_url || formData.image ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <img 
                    src={formData.image_url || `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${formData.image.id}`} 
                    alt="Preview" 
                    className="h-20 w-20 object-cover rounded"
                  />
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image_url: '', image: null }))}
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
                  onChange={handleFileChange}
                  accept="image/*"
                  disabled={fileUploading}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:border-0
                    file:text-sm file:font-semibold
                    file:bg-yellow file:text-black
                    hover:file:bg-black hover:file:text-white
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

          <div>
            <label className="block text-sm font-semibold mb-1">
              Event Tags
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Select all the tags that apply to this event
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <TagButton 
                  key={tag.id} 
                  tag={tag}
                  selected={selectedTags.some(t => t === tag.id)}
                  onClick={handleTagClick}
                />
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`btn btn-primary w-full md:w-auto flex justify-center items-center ${loading ? 'bg-white hover:bg-white cursor-not-allowed' : ''}`}
            >
              {loading ? <Image src="/loading.svg" width={40} height={40} alt="loading" /> : 'Submit Event'}
            </button>
          </div>
        </form>
      </Section>
    </>
  )
} 