import Section from 'components/layout/Section'
import ProfileForm from 'components/profiles/ProfileForm'
import { getProfileSkills } from 'integrations/directus'

export default async function NewProfilePage() {
  const skills = await getProfileSkills()

  return (
    <Section className="bg-slate-100">
      <div>
        <h1 className="text-4xl mb-6 md:text-6xl font-title">
          Create Profile
        </h1>
        <p className="text-lg mb-8">
          Share your skills and interests with the Civic Tech WR community
        </p>
        <ProfileForm skills={skills} />
      </div>
    </Section>
  )
} 