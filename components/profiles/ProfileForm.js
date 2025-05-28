'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import TagButton from 'components/TagButton';
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(() => import('components/RichTextEditor'), {
  ssr: false,
});
import { uploadImage } from 'integrations/directus';

import Select from 'react-select';

import { Suspense } from 'react';
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
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    headline: '',
    bio: '',
    interests: '',
    image_url: '',
    image: null,
    experiences: '',
    skills: [],
    preferred_contact_method: 'email',
  });

  // The following functions takes skills from the directus as input
  // and gives an output for the react-select
  const transformSkills = (skills) => {
    const uniqueNames = new Set();
    return skills
      .map((item) => {
        const name = item.name?.trim();
        if (name && !uniqueNames.has(name)) {
          uniqueNames.add(name);
          return { label: name, value: name, id: item.id };
        }
        return null;
      })
      .filter(Boolean); // remove nulls
  };
  const allSkills = transformSkills(skills);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillClick = (skill) => {
    setSelectedSkills((prev) => {
      const isSelected = prev.some((s) => s === skill.id);
      return isSelected
        ? prev.filter((s) => s !== skill.id)
        : [...prev, skill.id];
    });
  };

  // const handleFileChange = async (e) => {
  //   const file = e.target.files[0]
  //   if (!file) return

  //   setImageFile(file)
  //   setImagePreview(URL.createObjectURL(file))
  // }

  const handleFileChange = async (e) => {
    if (e.target.files[0]) {
      setFileUploading(true);
      const formData = new FormData();
      formData.append('file', e.target.files[0], e.target?.files[0]?.name);
      const result = await uploadImage(formData);

      setFormData((prev) => ({
        ...prev,
        image: result,
      }));

      setFileUploading(false);
    } else {
      setFormData((prev) => ({
        ...prev,
        image: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
      // Uncomment following line to log the formData
      // console.log(formData);

      // Create profile
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          //profile_picture: imageId,
          skills: selectedSkills.map((skillId) => ({
            skills_id: skillId,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create profile');
      }

      const { id } = await res.json();
      router.push(`/profiles/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded">{error}</div>
      )}

      <div>
        <label className="block text-sm font-semibold mb-1">
          Profile Picture
        </label>
        {formData.image_url || formData.image ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <img
                src={
                  formData.image_url ||
                  `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${formData.image.id}`
                }
                alt="Preview"
                className="h-20 w-20 object-cover rounded"
              />
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    image_url: '',
                    image: null,
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

      {/* <div>
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
      </div> */}

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
        <div className="border shadow h-48 overflow-auto">
          <Suspense fallback={<div>Loading...</div>}>
            <RichTextEditor
              markdown={formData.bio}
              onBlur={(value) =>
                handleChange({ target: { name: 'bio', value } })
              }
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
        <div className="border shadow h-48 overflow-auto">
          <Suspense fallback={<div>Loading...</div>}>
            <RichTextEditor
              markdown={formData.interests}
              onBlur={(value) =>
                handleChange({ target: { name: 'interests', value } })
              }
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
        <p className="text-sm text-gray-500 mb-2">What are you proud of?</p>
        <div className="border shadow h-48 overflow-auto">
          <Suspense fallback={<div>Loading...</div>}>
            <RichTextEditor
              markdown={formData.experiences}
              onBlur={(value) =>
                handleChange({ target: { name: 'experiences', value } })
              }
              ref={experiencesEditorRef}
            />
          </Suspense>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1">Skills</label>

        <Select
          isMulti
          name="skills"
          options={allSkills}
          value={allSkills.filter((skill) =>
            formData.skills.includes(skill.id)
          )}
          onChange={(selectedOptions) => {
            const ids = selectedOptions.map((option) => option.id);
            setFormData((prev) => ({ ...prev, skills: ids }));
            setSelectedSkills(ids);
          }}
          className="basic-multi-select"
          classNamePrefix="select"
        />
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
