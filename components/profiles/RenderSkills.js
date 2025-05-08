'use client';

import React, { useState } from 'react';
import Image from 'next/image';

function hashStringToSeed(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function getRandomColor(skillName) {
    const seed = hashStringToSeed(skillName);
    const baseRed = 216;
    const baseGreen = 31;
    const baseBlue = 91;
    const diff = 50;

    const redVariation = Math.floor(seededRandom(seed) * diff * 2 - diff);
    const greenVariation = Math.floor(seededRandom(seed + 1) * diff * 2 - diff);
    const blueVariation = Math.floor(seededRandom(seed + 2) * diff * 2 - diff);

    const red = Math.min(Math.max(baseRed + redVariation, 0), 255);
    const green = Math.min(Math.max(baseGreen + greenVariation, 0), 255);
    const blue = Math.min(Math.max(baseBlue + blueVariation, 0), 255);

    return `rgb(${red}, ${green}, ${blue})`;
}

export default function RenderSkills({ profileSkillNames }) {
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