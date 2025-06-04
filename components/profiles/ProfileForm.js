'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(() => import('components/RichTextEditor'), {
  ssr: false,
});
import { uploadImage } from 'integrations/directus';
import SearchSelect from 'components/search-select/SearchSelect';

import { Suspense } from 'react';
import { BIO_IS_REQUIRED, INTERESTS_ARE_REQUIRED } from './constants';

export default function ProfileForm({ skills }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [fileUploading, setFileUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const bioEditorRef = useRef(null);
  const interestsEditorRef = useRef(null);
  const experiencesEditorRef = useRef(null);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [skillOptions, setSkillOptions] = useState([]);
  // To track if RichTextEditor fields have been touched by the user
  const [isBioTouched, setIsBioTouched] = useState(false);
  const [isInterestsTouched, setIsInterestsTouched] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    headline: '',
    bio: '',
    interests: '',
    profile_picture: null,
    experiences: '',
    skills: [],
  });

  // Format skills for SearchSelect on component mount
  useEffect(() => {
    if (skills && Array.isArray(skills)) {
      setSkillOptions(skills);
      setSkillsLoading(false);
    } else {
      // Fallback: fetch skills if not provided as prop
      const fetchSkills = async () => {
        try {
          setSkillsLoading(true);
          const response = await fetch('/api/skills');
          if (!response.ok) {
            throw new Error('Failed to fetch skills');
          }
          const skillsData = await response.json();
          setSkillOptions(skillsData);
        } catch (error) {
          console.error('Error fetching skills:', error);
          setError('Failed to load skills');
        } finally {
          setSkillsLoading(false);
        }
      };
      fetchSkills();
    }
  }, [skills]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBioChange = (e) => {
    const content = bioEditorRef.current.getMarkdown()
    setFormData(prev => ({
      ...prev,
      bio: content
    }))
  }

  const handleInterestsChange = (e) => {  
    const content = interestsEditorRef.current.getMarkdown()
    setFormData(prev => ({
      ...prev,
      interests: content
    }))
  }

  const handleExperiencesChange = (e) => {
    const content = experiencesEditorRef.current.getMarkdown()
    setFormData(prev => ({
      ...prev,
      experiences: content
    }))
  }
  const handleSkillsChange = (selectedSkills) => {
    setSelectedSkills(selectedSkills || []);
  };

  const handleFileChange = async (e) => {
    if (e.target.files[0]) {
      setFileUploading(true);
      const formData = new FormData();
      formData.append('file', e.target.files[0], e.target?.files[0]?.name);
      const result = await uploadImage(formData);

      setFormData((prev) => ({
        ...prev,
        profile_picture: result,
      }));

      setFileUploading(false);
    } else {
      setFormData((prev) => ({
        ...prev,
        profile_picture: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trigger HTML5 validation for standard inputs first (Name, Headline)
    if (!e.currentTarget.checkValidity()) {
      return; // Stop the function if browser validation fails
    }

    // Custom validation for RichTextEditor fields (Bio, Interests, Experiences)
    let hasCustomValidationError = false;

    // Bio validation
    if (!formData.bio) {
      setError(BIO_IS_REQUIRED);
      setIsBioTouched(true); // Force bio warning to show on submit attempt
      hasCustomValidationError = true;
    } else if (error === BIO_IS_REQUIRED) { // Clear bio error if now valid
      setError(null);
    }

    // Interests validation
    if (!formData.interests) {
      setError(INTERESTS_ARE_REQUIRED);
      setIsInterestsTouched(true); // Force interests warning to show on submit attempt
      hasCustomValidationError = true;
    } else if (error === INTERESTS_ARE_REQUIRED) { // Clear interests error if now valid
      setError(null);
    }

    if (hasCustomValidationError) {
      return; // Stop submission if any custom validation fails
    }

    // Clear any general form errors before proceeding to submission
    setError(null);
    setLoading(true);

    try {
      // Upload image if selected
      let imageId = null;
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const { id } = await uploadRes.json();
        imageId = id;
      }

      // Create profile
      console.log({formData})
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          skills: selectedSkills.map((skill) => ({
            skills_id: skill.value, // Extract skill ID from SearchSelect format
          })),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create profile');
      }

      const { slug } = await res.json();
      console.log('Profile created successfully');
      router.push(`/profiles/success`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General error message at the top, ensuring it doesn't conflict with specific field errors */}
      {error &&
        error !== BIO_IS_REQUIRED &&
        error !== INTERESTS_ARE_REQUIRED && (
          <div className="bg-red-50 text-red-500 p-4 rounded">
            {error}
          </div>
        )}

      <div>
        <label className="block text-sm font-semibold mb-1">
          Profile Picture
        </label>
        {formData.profile_picture ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <img
                src={
                  `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${formData.profile_picture.id}`
                }
                alt="Preview"
                className="h-20 w-20 object-cover rounded"
              />
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    profile_picture: null,
                  }))
                }
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
              <div className="text-sm text-gray-600">Uploading...</div>
            )}
          </div>
        )}
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
        <p className="text-sm text-gray-500 mb-2">Tell us about yourself.</p>
        <div
          className={`border shadow h-48 overflow-auto ${isBioTouched && !formData.bio ? 'border-red-500' : ''
            }`}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <RichTextEditor
              markdown={formData.bio}
              onBlur={() => {
                handleBioChange()
                setIsBioTouched(true);
              }}
              ref={bioEditorRef}
            />
          </Suspense>
        </div>
      </div>

      <div>
        <label htmlFor="interests" className="block text-sm font-semibold mb-1">
          Interests*
        </label>
        <p className="text-sm text-gray-500 mb-2">
         {`What lights you up? Is there a cause you're interested in or something you'd like to learn more about?`}
        </p>
        <div
          className={`border shadow h-48 overflow-auto ${
            // Apply red border if interests are empty AND has been touched
            isInterestsTouched && !formData.interests ? 'border-red-500' : ''
            }`}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <RichTextEditor
              markdown={formData.interests}
              onBlur={() => {
                handleInterestsChange()
                setIsInterestsTouched(true); // Mark as touched on blur
              }}
              ref={interestsEditorRef}
            />
          </Suspense>
        </div>
      </div>

      <div>
        <label
          htmlFor="experiences"
          className="block text-sm font-semibold mb-1"
        >
          Unique Experiences
        </label>
        <p className="text-sm text-gray-500 mb-2">
          {`Do you have any unique experiences you'd like to share? They don't need to be professional or volunteer experiences, it can be anything that you think is worth sharing.`}
        </p>
        <div
          className={`border shadow h-48 overflow-auto`}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <RichTextEditor
              markdown={formData.experiences}
              onBlur={handleExperiencesChange}
              ref={experiencesEditorRef}
            />
          </Suspense>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Skills</label>
        {skillsLoading ? (
          <div className="text-gray-500">Loading skills...</div>
        ) : (
          <SearchSelect
            options={skillOptions}
            value={selectedSkills}
            onChange={handleSkillsChange}
            isMulti
            placeholder="Search for skills..."
          />
        )}
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
  );
}
