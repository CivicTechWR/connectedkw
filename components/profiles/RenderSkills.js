"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getRandomColor } from "@utils/colorUtils";

export function renderCardSkills(profileSkillNames) {
  const maxSkillsToShow = 5; // Limit the number of skills displayed

  // If there are more than 5 skills, do a ... that will just open there page to show all the skills

  if (profileSkillNames.length === 0) {
    return <span className="text-xs text-gray-500">No skills</span>;
  }

  return (
    <>
      {profileSkillNames.slice(0, maxSkillsToShow).map((skillName, index) => (
        <span
          key={index}
          style={{ backgroundColor: getRandomColor(skillName.name) }}
          className="inline-flex items-center text-white px-2 py-1 text-xs font-semibold rounded-full"
        >
          {skillName.name}
        </span>
      ))}
      {profileSkillNames.length > maxSkillsToShow && (
        <span
          className="inline-flex items-center justify-center w-12 h-6 bg-gray-300 rounded-full"
          title="Show more skills"
        >
          <Image
            src="/icons/more-horizontal.svg"
            alt="Show more"
            className="w-4 h-4"
            width={4}
            height={4}
          />
        </span>
      )}
    </>
  );
}

export default function RenderProfileSkills({ profileSkillNames }) {
  const maxSkillsToShow = 10;
  const [showAll, setShowAll] = useState(false);

  if (profileSkillNames.length === 0) {
    return <span className="text-xs text-gray-500">No skills</span>;
  }
  const skillsToDisplay = showAll
    ? profileSkillNames
    : profileSkillNames.slice(0, maxSkillsToShow);
  return (
    <>
      {skillsToDisplay.map((skillName, index) => (
        <span
          key={index}
          style={{ backgroundColor: getRandomColor(skillName.name) }}
          className="inline-flex items-center text-white px-2 py-1 text-xs font-semibold rounded-full mr-2 mb-1"
        >
          {skillName.name}
        </span>
      ))}
      {profileSkillNames.length > maxSkillsToShow && (
        <>
          {!showAll ? (
            <button
              className="flex items-center justify-center ml-auto w-12 h-6 bg-gray-300 rounded-full cursor-pointer"
              title="Show more skills"
              onClick={() => setShowAll(true)}
            >
              <Image
                src="/icons/more-horizontal.svg"
                alt="Show more"
                className="w-4 h-4"
                width={4}
                height={4}
              />
            </button>
          ) : (
            <button
              className="flex items-center justify-center ml-auto w-12 h-6 bg-gray-300 rounded-full cursor-pointer"
              title="Show less skills"
              onClick={() => setShowAll(false)}
            >
              <Image
                src="/icons/minus.svg"
                alt="Show less"
                className="w-4 h-4"
                width={4}
                height={4}
              />
            </button>
          )}
        </>
      )}
    </>
  );
}
