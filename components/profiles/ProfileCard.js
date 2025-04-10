'use client'

import Image from "next/image"
import Link from "next/link"
import DOMPurify from "isomorphic-dompurify"

// Color generation functions
function hashStringToSeed(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return hash
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function getRandomColor(skillName) {
  const seed = hashStringToSeed(skillName)
  const baseRed = 216
  const baseGreen = 31
  const baseBlue = 91
  const diff = 50

  const redVariation = Math.floor(seededRandom(seed) * diff * 2 - diff)
  const greenVariation = Math.floor(seededRandom(seed + 1) * diff * 2 - diff)
  const blueVariation = Math.floor(seededRandom(seed + 2) * diff * 2 - diff)

  const red = Math.min(Math.max(baseRed + redVariation, 0), 255)
  const green = Math.min(Math.max(baseGreen + greenVariation, 0), 255)
  const blue = Math.min(Math.max(baseBlue + blueVariation, 0), 255)

  return `rgb(${red}, ${green}, ${blue})`
}

export default function ProfileCard({ profile }) {
  const directusURL = process.env.NEXT_PUBLIC_DIRECTUS_URL
  const avatarURL = profile.profile_picture 
    ? `${directusURL}/assets/${profile.profile_picture}`
    : null

  const cleanBio = DOMPurify.sanitize(profile.bio, {
    FORBID_ATTR: ['style'],
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li']
  })

  const profileSkillNames = profile.skills
    ? profile.skills.map(skillRelation => ({
        id: skillRelation.skills_id.id,
        name: skillRelation.skills_id.name
      }))
    : []

  return (
    <Link
      href={`/profiles/${profile.id}`}
      className="block no-underline"
    >
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center space-x-4 mb-2">
          <div className="w-20 h-20 relative rounded-full overflow-hidden">
            {avatarURL ? (
              <Image
                src={avatarURL}
                alt={`${profile.name}'s avatar`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{profile.name}</h2>
            <div className="mt-1 flex items-center space-x-2">
              <span className="text-gray-500 text-xs">
                {profile.city || "No City Listed"}
              </span>
            </div>
          </div>
        </div>

        <div
          className="mb-2 text-gray-700"
          dangerouslySetInnerHTML={{ __html: cleanBio }}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {profileSkillNames.length > 0 ? (
            profileSkillNames.map((skillName, index) => (
              <span
                key={index}
                style={{ backgroundColor: getRandomColor(skillName.name) }}
                className="inline-flex items-center text-white px-2 py-1 text-xs font-semibold rounded-full"
              >
                {skillName.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-500">No skills</span>
          )}
        </div>
      </div>
    </Link>
  )
} 