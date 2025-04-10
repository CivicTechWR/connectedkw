import { useRouter } from "next/router";
import Image from "next/image";
import Layout from "components/Layout";
import DOMPurify from "isomorphic-dompurify";

// Fetch single profile
import { getProfiles } from "integrations/directus";

export async function getServerSideProps({ params }) {
	const profile = await getProfiles({ profileID: params.id });

	if (!profile || profile.length === 0) {
		return { notFound: true };
	}

	return {
		props: { profile },
	};
}

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

// TODO: this page could be made better, it is barebones for now. I think we have existing designs that we can put here
export default function ProfileDetails({ profile }) {
	const sanitizedBio = profile[0].bio;
	const router = useRouter();
	const directusURL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
	console.log(profile);

	if (!profile[0]) {
		return <p className="text-center text-red-500 mt-10">Not found, sorry</p>;
	}

	const avatarId = profile[0].profile_picture;
	const avatarURL = avatarId ? `${directusURL}/assets/${avatarId}` : null;

	const cleanBio = DOMPurify.sanitize(profile[0].bio, {
		FORBID_ATTR: ["style"],
		ALLOWED_TAGS: ["p", "b", "i", "em", "strong", "a", "ul", "ol", "li"],
	});

	const profileSkillNames = profile[0].skills
		? profile[0].skills.map((skillRelation) => ({
				id: skillRelation.skills_id.id,
				name: skillRelation.skills_id.name,
		  }))
		: [];

	return (
		<Layout color="rainbow">
			<section className="bg-slate-100 pb-12 w-full flex flex-col">
				<div className="grid grid-cols-12 w-full gap-5 px-2 my-5">
					<div className="col-span-12 md:col-span-5 md:col-start-2 flex">
						<button
							onClick={() => router.push("/profiles")}
							className="bg-white ml-2 p-4 shadow hover:shadow-lg transition-shadow cursor-pointer w-6 h-6 flex items-center justify-center rounded-lg"
						>
							<i className="fa-solid fa-arrow-left"></i>
						</button>
						<p className="p-1 ml-2">Back to all profiles</p>
					</div>
				</div>
				{/* New one */}
				<div className="grid grid-cols-12 w-full gap-5 px-4">
					<div className="col-span-12 md:col-span-5 md:col-start-2">
						<div className="rounded-xl overflow-hidden shadow-lg bg-white px-3 py-10">
							<div className="w-40 h-40 relative rounded-full mx-auto overflow-hidden">
								{avatarURL ? (
									<Image src={avatarURL} alt="User Avatar" fill className="object-cover" />
								) : (
									<div className="w-full h-full bg-gray-300" />
								)}
							</div>
							<h1 className="text-2xl font-semibold text-center mt-4 mb-1">{profile[0].name}</h1>
							<p className="text-sm font-regular text-center text-gray-600">
								{/* Change here to modify number of characters shown in bio */}
								{profile[0].headline.length > 90
									? `${profile[0].headline.substring(0, 90)}...`
									: profile[0].headline}
							</p>

              <div className="text-sm font-regular text-center mt-8" dangerouslySetInnerHTML={{
									__html: DOMPurify.sanitize(profile[0].bio, {
										FORBID_ATTR: ["style"],
										ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "ul", "ol", "li"],
									})
							}} />
						</div>
					</div>

					<div className="col-span-12 md:col-span-5">
						{profile[0].skills ? (
							<div className="rounded-xl overflow-hidden shadow-lg bg-white p-5">
								<h1 className="text-2xl font-semibold mb-3 text-red">Skills</h1>
								{profileSkillNames.length > 0 ? (
									profileSkillNames.map((skillName, index) => (
										<span
											key={index}
											style={{ backgroundColor: getRandomColor(skillName.name) }}
											className="inline-flex items-center text-white px-2 py-1 text-xs font-semibold rounded-full mr-2 mb-1"
										>
											{skillName.name}
										</span>
									))
								) : (
									<span className="text-xs text-gray-500">No skills</span>
								)}
								{/* <p className="text-sm font-regular text-gray-600">hehehe</p> */}
							</div>
						) : null}
						{profile[0].interests ? (
							<div className="rounded-xl overflow-hidden shadow-lg bg-white p-5 mt-4">
								<h1 className="text-2xl font-semibold mb-1 text-red">Interests</h1>
								<div className="text-sm font-regular text-gray-600" dangerouslySetInnerHTML={{
									__html: DOMPurify.sanitize(profile[0].interests, {
										FORBID_ATTR: ["style"],
										ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "ul", "ol", "li"],
									})
								}} />
							</div>
						) : null}
						{profile[0].experiences ? (
							<div className="rounded-xl overflow-hidden shadow-lg bg-white p-5 mt-4">
								<h1 className="text-2xl font-semibold mb-1 text-red">Experiences</h1>
								<div className="text-sm font-regular text-gray-600 markdown" dangerouslySetInnerHTML={{
									__html: DOMPurify.sanitize(profile[0].experiences, {
										FORBID_ATTR: ["style"],
										ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "ul", "ol", "li"],
									})
								}} />
							</div>
						) : null}
					</div>
				</div>
			</section>
		</Layout>
	);
}
