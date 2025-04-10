import Image from "next/image";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import Layout from "components/Layout";
import { getProfiles, getProfileSkills } from "integrations/directus";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"


// get all profiles, optionally filter by URL query
export async function getServerSideProps(context) {
  const { skillId } = context.query;
  const skillFilter = skillId ? parseInt(skillId, 10) : -1; // Default to -1 for all profiles

  const profilesResponse = await getProfiles({skillID: skillFilter}); // Fetch profiles based on skill ID
  const profiles = profilesResponse.data || profilesResponse;

	//Keeping this for now, but theoretically we don't need to make this call and could instead pull the skills from the profilesResponse
	//This would be better long term because then we only show skills that are actually in use on the profiles
	const skillsResponse = await getProfileSkills();
	const skills = skillsResponse.data || skillsResponse;

  return { props: { profiles, skills, selectedSkill: skillFilter.toString() } };
}

// the following functions are what generate the colours for the skills in each profile card
// they are randomly varied from the connectedKW logo colour, but they are seeded by the skillName
// so that any given skill will have the same colour everytime/across refreshes
function hashStringToSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    // Bit-shift and add the ASCII code of the character.
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}
// A basic seeded random generator that returns a number between 0 and 1.
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
const getRandomColor = (skillName) => {
  // Derive a seed from the skill name.
  const seed = hashStringToSeed(skillName);

  const baseRed = 216;
  const baseGreen = 31;
  const baseBlue = 91;

  // Amount of variation
  const diff = 50;

  // Use different seeds for each color component by offsetting the base seed.
  const redVariation = Math.floor(seededRandom(seed) * diff * 2 - diff);
  const greenVariation = Math.floor(seededRandom(seed + 1) * diff * 2 - diff);
  const blueVariation = Math.floor(seededRandom(seed + 2) * diff * 2 - diff);

  // Ensure within RGB range 0-255
  const red = Math.min(Math.max(baseRed + redVariation, 0), 255);
  const green = Math.min(Math.max(baseGreen + greenVariation, 0), 255);
  const blue = Math.min(Math.max(baseBlue + blueVariation, 0), 255);

  return `rgb(${red}, ${green}, ${blue})`;
};

export default function ProfilePage({ profiles, skills }) {
  const directusURL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
  const router = useRouter();
  const { skillId } = router.query;

  // Defaults to -1 (show all profiles)
  const [selected, setSelected] = useState(skillId || "-1");

  useEffect(() => {
    setSelected(skillId || "-1");
  }, [skillId]);

  const handleSkillChange = (event) => {
    const skillId = event.target.value;
    setSelected(skillId);
    // Update the URL without reloading
    router.push({
      pathname: "/profiles",
      query: { skillId },
    });
  };

  return (
    <Layout color="rainbow">
      	<section className="bg-slate-100 md:py-12 pt-12 pb-12 w-full">
			<h1 className="text-3xl font-bold mb-2 text-center">Volunteer Directory</h1>
			<p className="text-center text-gray-600 mb-6">
				Meet the skilled volunteers of <a href="https://civictechwr.org" target="_blank" rel="noopener noreferrer">Civic Tech WR</a>
			</p>
			<div className="mb-4 flex justify-center">
				<select
					value={selected}
					onChange={handleSkillChange}
					className="p-2 rounded-lg border border-gray-300"
				>
					<option value="-1">All Skills</option>
					{skills.map((skill) => (
					<option key={skill.id} value={skill.id}>
						{skill.name}
					</option>
					))}
				</select>
			</div>

			{profiles.length === 0 ? (
			<p className="text-center text-gray-600">No profiles found.</p>
			) : (
				<div className="px-4">
					<ResponsiveMasonry columnsCountBreakPoints={{640: 1, 641: 2, 1024: 3}}>
						<Masonry gutter="1rem">
						{profiles.map((profile) => {
							const avatarId = profile.profile_picture;
							const avatarURL = avatarId
							? `${directusURL}/assets/${avatarId}`
							: null;

							// the bio returns HTML - this is just a safety so people can't inject scripts with their bio
							const cleanBio = DOMPurify.sanitize(profile.bio, {
								FORBID_ATTR: ['style'],
								ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li']
							});
  
							// Skill relations are now taken from the expanded profile object
							const profileSkillNames = profile.skills
							? profile.skills.map(skillRelation => ({
								id: skillRelation.skills_id.id,
								name: skillRelation.skills_id.name
								}))
							: [];
  
								return (
									<Link
										key={profile.id}
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
												{/* <span className="text-gray-500 text-xs">•</span>
												{profile.is_verified ? (
													<span className="text-gray-500 text-xs">
													Verified
													</span>
												) : (
													<span className="text-gray-500 text-xs">
													Not Verified
													</span>
												)} */}
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
								);
							})}

						</Masonry>
					</ResponsiveMasonry>
				</div>
			)}
      	</section>
    </Layout>
  );
}
