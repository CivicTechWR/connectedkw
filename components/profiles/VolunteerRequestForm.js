'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Notification from '../notifications/Notifications';
import Select from 'react-select';
import SearchSelect from '../search-select/SearchSelect';
// Options for the volunteer selection dropdown *to be replaced with api call*
const options = [
  { value: 'No preference', label: 'No preference', category: 'volunteer' },
  { value: 'strawberry', label: 'Strawberry', category: 'icecream' },
  { value: 'vanilla', label: 'Vanilla', category: 'icecream' },
];

const VolunteerRequestForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    type: null, // 'error', 'success', 'info'
    message: '',
    show: false,
  });

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

    // Validate form
    if (!validateForm()) {
      setNotification({
        type: 'error',
        message: 'Please fix the errors in the form.',
        show: true,
      });
      return;
    }

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create volunteer request');
      }

      const { id } = await res.json();
      router.push(`/profiles/request/success`);
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message,
        show: true,
      });
    } finally {
      setLoading(false);
    }

    // Show success notification
    setNotification({
      type: 'success',
      message: 'Your volunteer request has been submitted!',
      show: true,
    });

    // Reset form
    setFormData({
      name: '',
      email: '',
      description: '',
    });
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
          {/* Rest of your form remains the same */}

          <div className="space-y-2">
            <label htmlFor="name" className="text-lg font-medium">
              Your Name
            </label>
            <input
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
              Your Email
            </label>
            <input
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

          <div className="space-y-2">
            {' '}
            <label htmlFor="name" className="text-lg font-medium">
              {`Is there a specific volunteer you'd like to connect with?`}
            </label>
            <SearchSelect options={options} />
          </div>
          <div className="space-y-2">
            <label htmlFor="name" className="text-lg font-medium">
              {`Which skills are you looking for?`}
            </label>
            <SearchSelect options={options} />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-lg font-medium">
              {`What kind of collaboration are you looking for? Please give us a short description of your needs.`}
            </label>
            <textarea
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
