export default function SkillFilter({ skills, selectedSkill, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2">
        Filter by skill
      </label>
      <select
        value={selectedSkill || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full md:w-auto px-4 py-2 border rounded-md"
      >
        <option value="">All skills</option>
        {skills.map((skill) => (
          <option key={`${skill.value}skill`} value={skill.value}>
            {skill.label}
          </option>
        ))}
      </select>
    </div>
  );
}
