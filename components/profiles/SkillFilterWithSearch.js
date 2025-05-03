import { useEffect, useRef, useState } from "react";
import closeIcon from "public/icons/material_ic_close.svg";

const SkillFilterWithSearch = ({ allSkills, skillHandler }) => {
  const skillList = allSkills;
  const [filteredSkillList, setFilteredSkillList] = useState([]);
  const [selectedSkillList, setSelectedSkillList] = useState([]);
  const inputRef = useRef(null);

  const handleSkillSearch = (e) => {
    if (!e.target.value) {
      setFilteredSkillList([]);
    } else {
      setFilteredSkillList(
        skillList.filter((skill) => {
          if (skill.name.toLowerCase().includes(e.target.value.toLowerCase())) {
            return skill;
          }
        })
      );
    }
  };

  const handleSkillAdd = (e) => {
    filteredSkillList.forEach((skill) => {
      if (selectedSkillList.includes(skill)) {
        return;
      }
      if (skill.name.toLowerCase() === e.target.innerText.toLowerCase()) {
        setSelectedSkillList([...selectedSkillList, skill]);
      }
    });

    const skillIds = selectedSkillList.filter((skill) => skill.id);

    skillHandler(skillIds);
    inputRef.current.value = "";
    setFilteredSkillList([]);
  };

  const handleSkillRemoval = (e) => {
    const updatedSkill = selectedSkillList.filter(
      (skill) => skill.name !== e.currentTarget.innerText
    );
    setSelectedSkillList(updatedSkill);
  };

  return (
    <div className="relative flex flex-col">
      <label className="text-sm" htmlFor="skills">
        Skills
      </label>
      <input
        ref={inputRef}
        name="skills"
        id="skills"
        type="search"
        className="border-1 p-2"
        placeholder="Type a skill..."
        onChange={handleSkillSearch}
      />
      <ul className="absolute mt-16 bg-white w-full max-h-48 overflow-y-auto">
        {filteredSkillList.length > 0 &&
          filteredSkillList.map((skill) => (
            <li
              onClick={handleSkillAdd}
              className="p-2 list-none hover:bg-red hover:text-white data-skills"
              key={skill.id}
            >
              {skill.name}
            </li>
          ))}
      </ul>
      <ul className="flex flex-row gap-2.5 mt-2">
        {selectedSkillList.map((skill) => (
          <li
            className="flex flex-row gap-1 justify-center items-center p-2 border border-red text-sm rounded-2xl"
            key={skill.id}
            onClick={handleSkillRemoval}
          >
            {skill.name}{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
            >
              <path
                fill="#d8135b"
                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
              />
            </svg>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SkillFilterWithSearch;
