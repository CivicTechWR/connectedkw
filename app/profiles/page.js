import { getProfiles, getProfileSkills } from 'integrations/directus'
import ProfileList from 'components/profiles/ProfileList'
import Section from 'components/layout/Section'

export default async function ProfilesPage() {
  const profiles = await getProfiles({})
  const skills = await getProfileSkills()

  return (
    <Section className="bg-slate-100">
	  <div>
		<h1 className="text-4 mb-6 md:text-6xl font-title">
			Community Profiles
		</h1>
		<p className="text-lg">{`Meet the skilled volunteers of Civic Tech WR`}</p>
        <ProfileList initialProfiles={profiles} skills={skills} />
      </div>
    </Section>
  )
}
