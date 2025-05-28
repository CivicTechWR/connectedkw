'use client';

import { useState } from 'react';
import ProfileCard from './ProfileCard';
import SkillFilter from './SkillFilter';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';

export default function ProfileList({ initialProfiles, skills }) {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [profiles, setProfiles] = useState(initialProfiles);

  const handleSkillChange = async (skillId) => {
    setSelectedSkill(skillId);

    if (!skillId) {
      setProfiles(initialProfiles);
      return;
    }

    // Filter profiles on the client side by checking if profile has the selected skill
    console.log('Filtering profiles for skill ID:', skillId);
    const filteredProfiles = initialProfiles.filter((profile) =>
      profile.skills.some((skillRelation) => {
        return String(skillRelation.skills_id.id) === String(skillId);
      })
    );
    console.log('Filtered Profiles:', filteredProfiles);
    setProfiles(filteredProfiles);
  };

  return (
    <div>
      <div className="mb-8">
        <SkillFilter
          skills={skills}
          selectedSkill={selectedSkill}
          onChange={handleSkillChange}
        />
      </div>

      <ResponsiveMasonry columnsCountBreakPoints={{ 640: 1, 641: 2, 1024: 3 }}>
        <Masonry gutter="1rem">
          {profiles.map((profile) => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
}
