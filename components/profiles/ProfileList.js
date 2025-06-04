'use client';

import { useState, useEffect } from 'react';
import ProfileCard from './ProfileCard';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import SearchSelect from 'components/search-select/SearchSelect';

export default function ProfileList({ initialProfiles, skills }) {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [profiles, setProfiles] = useState(initialProfiles);

  const handleSkillChange = async (selected) => {
    setSelectedSkills(selected);
  };

  useEffect(() => {
    if (selectedSkills.length === 0) {
      setProfiles(initialProfiles);
      return;
    }

    console.log('Selected Skills:', selectedSkills);
    console.log('Initial Profiles:', initialProfiles);

    const filteredProfiles = initialProfiles.filter((profile) =>
      profile.skills.some((skillRelation) =>
        selectedSkills.find((skill) => skill.value === skillRelation.skills_id.id)
      )
    );
    setProfiles(filteredProfiles);
  }, [selectedSkills]);

  return (
    <div>
      <div className="mb-8 md:w-1/2 lg:w-1/3
      ">
        <SearchSelect
          options={skills} 
          value={selectedSkills}
          onChange={handleSkillChange}
          isMulti // Allow multiple skill selection
          placeholder="Search for skills"
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
