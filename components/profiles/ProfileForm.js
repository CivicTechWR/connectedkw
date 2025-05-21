'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import TagButton from 'components/TagButton'
import dynamic from 'next/dynamic'
const RichTextEditor = dynamic(() => import('components/RichTextEditor'), { ssr: false })

import { Suspense } from 'react'
export default function ProfileForm({ skills }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedSkills, setSelectedSkills] = useState([])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const bioEditorRef = useRef(null)
  const interestsEditorRef = useRef(null)
  const experiencesEditorRef = useRef(null)
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    headline: '',
    bio: '',
    interests: '',
    experiences: '',
    preferred_contact_method: 'email'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSkillClick = (skill) => {
    setSelectedSkills(prev => {
      const isSelected = prev.some(s => s === skill.id)
      return isSelected 
        ? prev.filter(s => s !== skill.id)
        : [...prev, skill.id]
    })
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Upload image if selected
      let imageId = null
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        const { id } = await uploadRes.json()
        imageId = id
      }

      // Create profile
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          profile_picture: imageId,
          skills: selectedSkills.map(skillId => ({
            skills_id: skillId
          }))
        })
      })

      if (!res.ok) {
        throw new Error('Failed to create profile')
      }

      const { id } = await res.json()
      router.push(`/profiles/${id}`)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold mb-1">
          Profile Picture
        </label>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-24 h-24 aspect-square shrink-0 relative rounded-full overflow-hidden bg-gray-100">
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Profile preview"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:border-0
                    file:text-sm file:font-semibold
                    file:bg-yellow file:text-black
                    hover:file:bg-black hover:file:text-white
                    disabled:opacity-50"
          />
        </div>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-semibold mb-1">
          Name*
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full shadow appearance-none border flex-1 py-2 px-3 text-black focus:outline-none focus:shadow-outline"
        />
      </div>

      <div>
        <label htmlFor="headline" className="block text-sm font-semibold mb-1">
          Headline*
        </label>
        <input
          type="text"
          id="headline"
          name="headline"
          value={formData.headline}
          onChange={handleChange}
          required
          placeholder="e.g. Full Stack Developer | Community Builder"
          className="w-full shadow appearance-none border flex-1 py-2 px-3 text-black focus:outline-none focus:shadow-outline"
        />
      </div>

      <div>
        <label htmlFor="city" className="block text-sm font-semibold mb-1">
          City
        </label>
        <input
          type="text"
          id="city"
          name="city"
          placeholder="e.g. Kitchener"
          value={formData.city}
          onChange={handleChange}
          className="w-full shadow appearance-none border flex-1 py-2 px-3 text-black focus:outline-none focus:shadow-outline"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-semibold mb-1">
          Bio*
        </label>
        <p className="text-sm text-gray-500 mb-2">
          Tell us about yourself.
        </p>
        <div className="border shadow h-48">
          <Suspense fallback={<div>Loading...</div>}>
            <RichTextEditor
              markdown={formData.bio}
              onBlur={(value) => handleChange({ target: { name: 'bio', value }})}
              ref={bioEditorRef}
              required
            />
          </Suspense>
        </div>
      </div>

      <div>
        <label htmlFor="interests" className="block text-sm font-semibold mb-1">
          Interests
        </label>
        <p className="text-sm text-gray-500 mb-2">
          What are you passionate about?
        </p>
        <div className="border shadow h-48">
          <Suspense fallback={<div>Loading...</div>}>
            <RichTextEditor
              markdown={formData.interests}
              onBlur={(value) => handleChange({ target: { name: 'interests', value }})}
              ref={interestsEditorRef}
            />
          </Suspense>
        </div>
      </div>

      <div>
        <label htmlFor="experiences" className="block text-sm font-semibold mb-1">
          Unique Experiences
        </label>
        <p className="text-sm text-gray-500 mb-2">
          What are you proud of?
        </p>
        <div className="border shadow h-48">
          <Suspense fallback={<div>Loading...</div>}>
            <RichTextEditor
              markdown={formData.experiences}
              onBlur={(value) => handleChange({ target: { name: 'experiences', value }})}
              ref={experiencesEditorRef}
            />
          </Suspense>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">
          Skills
        </label>
        <div className="flex flex-wrap gap-2">
          {skills.map(skill => (
            <TagButton
              key={skill.id}
              tag={skill}
              selected={selectedSkills.includes(skill.id)}
              onClick={() => handleSkillClick(skill)}
            />
          ))}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full md:w-auto"
        >
          {loading ? (
            <Image src="/loading.svg" width={24} height={24} alt="loading" />
          ) : (
            'Create Profile'
          )}
        </button>
      </div>
    </form>
  )
} 