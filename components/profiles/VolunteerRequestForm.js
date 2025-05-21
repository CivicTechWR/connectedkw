'use client';

import React, { useState } from 'react';
import Notification from '../notifications/Notifications';

const VolunteerRequestForm = () => {
  const [formData, setFormData] = useState({
    knowsVolunteer: '',
    name: '',
    email: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
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

  const handleRadioChange = (value) => {
    setFormData({
      ...formData,
      knowsVolunteer: value,
    });

    // Clear error when user selects an option
    if (errors.knowsVolunteer) {
      setErrors({
        ...errors,
        knowsVolunteer: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.knowsVolunteer) {
      newErrors.knowsVolunteer = 'Please select if you know your volunteer.';
    }

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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      setNotification({
        type: 'error',
        message: 'Please fix the errors in the form.',
        show: true,
      });
      return;
    }

    // submit the data here...
    // to do

    // Show success notification
    setNotification({
      type: 'success',
      message: 'Your volunteer request has been submitted!',
      show: true,
    });

    // Reset form
    setFormData({
      knowsVolunteer: '',
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
            <label className="text-lg font-medium">
              Do you know your volunteer?
            </label>
            <div className="flex space-x-8">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="yes"
                  name="knowsVolunteer"
                  checked={formData.knowsVolunteer === 'yes'}
                  onChange={() => handleRadioChange('yes')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="yes" className="ml-2 text-gray-700">
                  Yes
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="no"
                  name="knowsVolunteer"
                  checked={formData.knowsVolunteer === 'no'}
                  onChange={() => handleRadioChange('no')}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="no" className="ml-2 text-gray-700">
                  No
                </label>
              </div>
            </div>
            {errors.knowsVolunteer && (
              <p className="text-red-500 text-sm mt-1">
                {errors.knowsVolunteer}
              </p>
            )}
          </div>

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
              className={`w-full px-3 py-2 bg-gray-200 border-0 rounded-md focus:outline-none focus:ring-2 ${
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
              className={`w-full px-3 py-2 bg-gray-200 border-0 rounded-md focus:outline-none focus:ring-2 ${
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
            <label htmlFor="description" className="text-lg font-medium">
              What do you want the volunteer to help you with. Please provide a
              small description.
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 bg-gray-200 border-0 rounded-md resize-none h-32 focus:outline-none focus:ring-2 ${
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
            <button
              type="submit"
              className="w-40 h-12 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default VolunteerRequestForm;
