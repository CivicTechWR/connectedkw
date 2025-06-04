'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SearchSelect from '../search-select/SearchSelect';

const CreateProfileForm = ({ skills }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [skillOptions, setSkillOptions] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    headline: '',
    bio: '',
    skills: [],
    interests: '',
    experiences: '',
    image_url: '',
    image: null,
    city: '',
    preferred_contact_method: '',
  });

  // Fetch skills on component mount
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setSkillsLoading(true);
        const response = await fetch('/api/skills');
        if (!response.ok) {
          throw new Error('Failed to fetch skills');
        }
        const skillsData = await response.json();
        setSkills(skillsData);
        // console.log('Fetched skills:', skillsData);
      } catch (error) {
        console.error('Error fetching skills:', error);
        setNotification({
          type: 'error',
          message: 'Failed to load skills',
          show: true,
        });
      } finally {
        setSkillsLoading(false);
      }
    };

    fetchSkills();
  }, [skills]);

  const handleSkillsChange = (selectedSkills) => {
    setUserSkills(selectedSkills || []);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
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

      // Create Profile
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          profile_picture: imageId,
          skills: {
            skills_id: userSkills.map((skill) => skill.value), // Extract skill IDs
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create profile');
      }

      const { id } = await res.json();
      router.push(`/profiles/${id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-6 my-12" onSubmit={handleSubmit}>
      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded">{error}</div>
      )}
      {/* Name */}
      <div className="flex flex-col">
        <label className="text-sm" htmlFor="name">
          Name
        </label>
        <input
          name="name"
          id="name"
          type="text"
          className="p-2 border-1"
          onChange={handleChange}
          value={formData.name}
        />
      </div>
      {/* Headline */}
      <div className="flex flex-col">
        <label className="text-sm" htmlFor="headline">
          Headline
        </label>
        <input
          name="headline"
          id="headline"
          type="text"
          className=" p-2 border-1"
          placeholder="e.g. Full Stack Developer | Community Builder"
          onChange={handleChange}
          value={formData.headline}
        />
      </div>
      {/* Bio */}
      <div className="flex flex-col">
        <label className="text-sm" htmlFor="bio">
          Bio
        </label>
        <textarea
          name="bio"
          id="bio"
          className="border-1 resize-none h-44 p-2"
          onChange={handleChange}
          value={formData.bio}
        ></textarea>
      </div>
      {/* Skills */}
      <div className="flex flex-col">
        <label className="text-sm">Skills</label>
        {skillsLoading ? (
          <div className="text-gray-500">Loading skills...</div>
        ) : (
          <SearchSelect
            options={skills} // Use fetched skills
            value={formData.requiredSkills}
            onChange={handleSkillsChange}
            isMulti // Allow multiple skill selection
            placeholder="Search for skills or categories"
          />
        )}
      </div>
      {/* Interests */}
      <div className="flex flex-col">
        <label className="text-sm" htmlFor="interests">
          Interests
        </label>
        <textarea
          name="interests"
          id="interests"
          className="border-1 resize-none h-44 p-2"
          onChange={handleChange}
          value={formData.interests}
        ></textarea>
      </div>
      {/* Experiences */}
      <div className="flex flex-col">
        <label className="text-sm" htmlFor="experience">
          Experiences
        </label>
        <textarea
          name="experience"
          id="experience"
          className="border-1 resize-none h-44 p-2"
          onChange={handleChange}
          value={formData.experiences}
        ></textarea>
      </div>
      {/* Profile Picture */}
      <div className="flex flex-col">
        <label className="text-sm" htmlFor="profile-picture">
          Upload your profile picture
        </label>
        <input
          name="profile-picture"
          id="profile-picture"
          type="file"
          className=" p-2 border-1"
          onChange={handleFileChange}
        />
      </div>
      {/* City */}
      <div className="flex flex-col">
        <label className="text-sm" htmlFor="city">
          City
        </label>
        <input
          name="city"
          id="city"
          type="text"
          className="p-2 border-1"
          onChange={handleChange}
          value={formData.city}
        />
      </div>
      {/* Preferred Contact Method */}
      <div className="flex flex-col">
        <label className="text-sm" htmlFor="contact-method">
          Preferred Contact Method
        </label>
        <select
          name="preferred_contact_method"
          id="contact-method"
          className="border-1 p-2"
          onChange={handleChange}
          value={formData.preferred_contact_method}
        >
          <option value="">Select method of contact</option>
          <option value="Email">Email</option>
          <option value="Mobile">Mobile</option>
          <option value="Slack">Slack</option>
        </select>
      </div>
      {/* Submit */}
      <div className="flex mt-8">
        {!loading ? (
          <input
            className="btn btn-yellow"
            disabled={loading}
            type="submit"
            value="Submit"
          />
        ) : (
          <Image src="/loading.svg" width={24} height={24} alt="loading" />
        )}
      </div>
    </form>
  );
};

export default CreateProfileForm;
