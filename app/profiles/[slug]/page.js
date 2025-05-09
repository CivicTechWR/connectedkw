import Image from "next/image";
import { getProfiles } from "integrations/directus";
import DOMPurify from "isomorphic-dompurify";
import Link from "next/link";
import RenderSkills from "@components/profiles/RenderSkills.js";


export default async function ProfilePage({ params }) {
  const { slug } = await params;
  const profiles = await getProfiles({ slug: slug });
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
          <RenderSkills profileSkillNames={profileSkillNames} />
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
