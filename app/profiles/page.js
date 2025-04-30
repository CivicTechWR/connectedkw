import { getProfiles, getProfileSkills } from "integrations/directus";
import ProfileList from "components/profiles/ProfileList";
import Section from "components/layout/Section";
import Link from "next/link";

export default async function ProfilesPage() {
  const profiles = await getProfiles({});
  const skills = await getProfileSkills();

  return (
    <Section className="bg-slate-100">
      <div>
        <h1 className="text-4 mb-6 md:text-6xl font-title">
          Community Profiles
        </h1>

        <div className="flex justify-between items-center">
          <p className="text-lg m-0">{`Meet the skilled volunteers of Civic Tech WR`}</p>
          <div className="flex gap-4">
            <Link href="/profiles/request" className="btn btn-yellow py-[11px]">
              Request a volunteer
            </Link>
            <Link href="/profiles/submit" className="btn btn-yellow py-[11px]">
              Submit Profile
            </Link>
          </div>
        </div>
        <ProfileList initialProfiles={profiles} skills={skills} />
      </div>
    </Section>
  );
}
