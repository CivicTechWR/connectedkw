import Image from "next/image";
import { getProfiles } from "integrations/directus";
import DOMPurify from "isomorphic-dompurify";
import Link from "next/link";

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

export default async function ProfilePage({ params }) {
  const { slug } = params;
  const profiles = await getProfiles({ profileID: slug });
  const profile = profiles[0];

  if (!profile) {
    return <p className="text-center text-red-500 mt-10">Not found, sorry</p>;
  }

  const directusURL = process.env.NEXT_PUBLIC_DIRECTUS_URL;
  const avatarId = profile.profile_picture;
  const avatarURL = avatarId ? `${directusURL}/assets/${avatarId}` : null;

  const profileSkillNames = profile.skills
    ? profile.skills.map((skillRelation) => ({
        id: skillRelation.skills_id.id,
        name: skillRelation.skills_id.name,
      }))
    : [];

  return (
    <section className="bg-slate-100 pb-12 w-full flex flex-col">
      <div className="grid grid-cols-12 w-full gap-5 px-2 my-5">
        <div className="col-span-12 md:col-span-5 md:col-start-2 flex">
          <Link
            href="/profiles"
            className="bg-white ml-2 p-4 shadow hover:shadow-lg transition-shadow cursor-pointer w-6 h-6 flex items-center justify-center rounded-lg"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </Link>
          <p className="p-1 ml-2">Back to all profiles</p>
        </div>
      </div>
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
            <h1 className="text-2xl font-semibold text-center mt-4 mb-1">{profile.name}</h1>
            <p className="text-sm font-regular text-center text-gray-600">
              {profile.headline.length > 90
                ? `${profile.headline.substring(0, 90)}...`
                : profile.headline}
            </p>

            <div className="text-sm font-regular text-center mt-8" dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(profile.bio, {
                FORBID_ATTR: ["style"],
                ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "ul", "ol", "li"],
              })
            }} />
          </div>
        </div>

        <div className="col-span-12 md:col-span-5">
          {profile.skills ? (
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
            </div>
          ) : null}
          {profile.interests ? (
            <div className="rounded-xl overflow-hidden shadow-lg bg-white p-5 mt-4">
              <h1 className="text-2xl font-semibold mb-1 text-red">Interests</h1>
              <div className="text-sm font-regular text-gray-600" dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(profile.interests, {
                  FORBID_ATTR: ["style"],
                  ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "ul", "ol", "li"],
                })
              }} />
            </div>
          ) : null}
          {profile.experiences ? (
            <div className="rounded-xl overflow-hidden shadow-lg bg-white p-5 mt-4">
              <h1 className="text-2xl font-semibold mb-1 text-red">Experiences</h1>
              <div className="text-sm font-regular text-gray-600 markdown" dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(profile.experiences, {
                  FORBID_ATTR: ["style"],
                  ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "ul", "ol", "li"],
                })
              }} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
