import Section from 'components/layout/Section'
import ProfileForm from 'components/profiles/ProfileForm'
import { getProfileSkills } from 'integrations/directus'
import { getUser } from 'utils/auth/session'
import { redirect } from 'next/navigation'
export default async function NewProfilePage() {
  const skills = await getProfileSkills()
  const user = await getUser()

  if (!user) {
    redirect('/auth/login?next=/profiles/new&info=protected')
  }

  return (
    <>
      <Section className="bg-slate-100">
        <div>
          <h1 className="text-4xl mb-6 md:text-6xl font-title">
            Create Your Profile
          </h1>
          <p className="text-lg mb-8">
            Share your skills and interests with the Civic Tech WR community
          </p>
        </div>
      </Section>
      <Section className="">
        <ProfileForm skills={skills} user={user} />
      </Section>
    </>
  )
} 