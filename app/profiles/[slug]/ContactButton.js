'use client'

import { useState } from 'react'
import ContactForm from 'components/profiles/ContactForm'
import Modal from 'components/Modal'

export default function ContactButton({ profile }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn btn-primary"
      >
        Contact {profile.name}
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Contact ${profile.name}`}
      >
        <ContactForm
          profileId={profile.id}
          profileName={profile.name}
          onClose={() => setShowModal(false)}
        />
      </Modal>
    </>
  )
} 