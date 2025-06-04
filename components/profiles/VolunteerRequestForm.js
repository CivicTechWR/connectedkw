'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Notification from '../notifications/Notifications';
import Select from 'react-select';
import SearchSelect from '../search-select/SearchSelect';
import { getProfiles } from 'integrations/directus';

// Static options for volunteer dropdown (first dropdown)

const VolunteerRequestForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    profile_requested: null,
    skills_requested: [], // Add skills to form data
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]); // State for skills
  const [skillsLoading, setSkillsLoading] = useState(true); // Loading state for skills
  const [notification, setNotification] = useState({
    type: null,
    message: '',
    show: false,
  });
  const [volunteerOptions, setVolunteerOptions] = useState([]);
  const [volunteersLoading, setVolunteersLoading] = useState(true);

  // Fetch skills on component mount
  useEffect(() => {
    if (skills.length > 0) {
      return;
    }
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

    // Fetch volunteers for the first dropdown
    const fetchProfiles = async () => {
      if (volunteerOptions.length > 0) {
        return;
      }
      try {
        setVolunteersLoading(true);
        const profiles = await getProfiles({});
        console.log('fetched profiles:', profiles);

        // Transform profiles to the format expected by SearchSelect
        const formattedProfiles = profiles.map((profile) => ({
          value: profile.id,
          label: profile.name,
        }));

        // Add "No preference" option
        const optionsWithNoPreference = [
          { value: null, label: 'No preference' },
          ...formattedProfiles,
        ];

        setVolunteerOptions(optionsWithNoPreference);
      } catch (error) {
        console.error('Error fetching profiles:', error);
        setNotification({
          type: 'error',
          message: 'Failed to load volunteers',
          show: true,
        });
      } finally {
        setVolunteersLoading(false);
      }
    };

    fetchProfiles();
  }, [skills, volunteerOptions]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Handle volunteer selection (first dropdown)
  const handleVolunteerChange = (selectedOption) => {
    setFormData({
      ...formData,
      profile_requested: selectedOption,
    });
  };

  // Handle skills selection (second dropdown)
  const handleSkillsChange = (selectedSkills) => {
    setFormData({
      ...formData,
      skills_requested: selectedSkills || [],
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your name.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.description.trim()) {
      newErrors.description =
        'Please provide a description of what you need help with.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!validateForm()) {
      setNotification({
        type: 'error',
        message: 'Please fix the errors in the form.',
        show: true,
      });
      setLoading(false);
      return;
    }

    try {
      const body = {
        ...formData,
        profile_requested: formData.profile_requested?.value,
        skills_requested: formData.skills_requested.map((skill) => ({ skills_id: skill.value})), // Send skill IDs
      }
      console.log('body:', body);
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error('Failed to create volunteer request');
      }

      console.log('res:', res);

      const { id } = await res.json();
      router.push(`/profiles/request/success`);

      // setNotification({
      //   type: 'success',
      //   message: 'Your volunteer request has been submitted!',
      //   show: true,
      // });

      // // Reset form
      // setFormData({
      //   name: '',
      //   email: '',
      //   description: '',
      //   preferredVolunteer: null,
      //   requiredSkills: [],
      // });
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message,
        show: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {notification.show && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}

      <div className="w-full max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-lg font-medium">
              Your Name*
            </label>
            <input
              required
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full shadow appearance-none border flex-1 py-2 px-3 text-black focus:outline-none focus:shadow-outline ${
                errors.name
                  ? 'ring-2 ring-red-500 focus:ring-red-500'
                  : 'focus:ring-blue-500'
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-lg font-medium">
              Your Email*
            </label>
            <input
              required
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full shadow appearance-none border flex-1 py-2 px-3 text-black focus:outline-none focus:shadow-outline ${
                errors.email
                  ? 'ring-2 ring-red-500 focus:ring-red-500'
                  : 'focus:ring-blue-500'
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* First dropdown - Volunteers (static for now) */}
          <div className="space-y-2">
            <label className="text-lg font-medium">
              {`Is there a specific volunteer you'd like to connect with?`}
            </label>
            {volunteersLoading ? (
              <div className="text-gray-500">Loading volunteers...</div>
            ) : (
              <SearchSelect
                options={volunteerOptions}
                value={formData.profile_requested}
                onChange={handleVolunteerChange}
                placeholder="Search for a volunteer or select 'No preference'"
              />
            )}
          </div>

          {/* Second dropdown - Skills (from database) */}
          <div className="space-y-2">
            <label className="text-lg font-medium">
              {`Which skills are you looking for?`}
            </label>
            {skillsLoading ? (
              <div className="text-gray-500">Loading skills...</div>
            ) : (
              <SearchSelect
                options={skills} // Use fetched skills
                value={formData.skills_requested}
                onChange={handleSkillsChange}
                isMulti // Allow multiple skill selection
                placeholder="Search for skills or categories"
              />
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-lg font-medium">
              {`What kind of help are you looking for? Tell us about your needs or the project you have in mind.* `}
            </label>
            <textarea
              required
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`w-full shadow appearance-none border flex-1 py-2 px-3 h-32 text-black focus:outline-none focus:shadow-outline ${
                errors.description
                  ? 'ring-2 ring-red-500 focus:ring-red-500'
                  : 'focus:ring-blue-500'
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <button type="submit" className="btn">
              Submit
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default VolunteerRequestForm;
