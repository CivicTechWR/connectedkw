"use client";

import Image from "next/image";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { renderCardSkills } from "./RenderSkills";

function renderAvatar(avatarURL, profileName) {
  if (avatarURL) {
    return (
      <Image
        src={avatarURL}
        alt={`${profileName}'s avatar`}
        fill
        className="object-cover"
      />
    );
  } else {
    return <div className="w-full h-full bg-gray-300" />;
  }
}

export default function ProfileCard({ profile }) {
  const directusURL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
  const avatarURL = profile.profile_picture
    ? `${directusURL}/assets/${profile.profile_picture}`
    : null;

  const cleanBio = DOMPurify.sanitize(profile.bio, {
    FORBID_ATTR: ["style"],
    ALLOWED_TAGS: ["p", "b", "i", "em", "strong", "a", "ul", "ol", "li"],
  });

  const profileSkillNames = profile.skills
    ? profile.skills.map((skillRelation) => ({
        id: skillRelation.skills_id.id,
        name: skillRelation.skills_id.name,
      }))
    : [];

  return (
    <Link href={`/profiles/${profile.slug}`} className="block no-underline">
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center space-x-4 mb-2">
          <div className="w-20 h-20 relative rounded-full overflow-hidden">
            {renderAvatar(avatarURL, profile.name)}
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
          {renderCardSkills(profileSkillNames)}
        </div>
      </div>
    </Link>
  );
}
