import Section from 'components/layout/Section';
import ProfileForm from 'components/profiles/ProfileForm';
import { getProfileSkills } from 'integrations/directus';
import { getUser } from 'utils/auth/session';
import { redirect } from 'next/navigation';
export default async function NewProfilePage() {
  const skills = await getProfileSkills();
  const user = await getUser();

  console.log('skills', skills);

  if (!user) {
    redirect('/auth/login?next=/profiles/new&info=protected');
  }

  return (
    <>
      <Section className="bg-slate-100">
        <div>
          <h1 className="text-4xl mb-6 md:text-6xl font-title">
            Create Your Profile
          </h1>
          <p className="text-lg font-bold">
            {`Ready to connect with your community in a meaningful way?`} 
          </p>
          <p className="text-lg">
            {`Local nonprofits are working hard to support the people and places we care about, but many are underfunded and stretched thin. Some may be lacking the resources or specialized skills they need to fully achieve their mission.`} 
          </p>
          <p className="text-lg font-bold">
            {`That's where you come in.`} 
          </p>
          <p className="text-lg">
            {`By creating a volunteer profile, you're letting these organizations know you're open to helping. Whether you bring time, talent, or a passion for change, your support can make a real impact. `}
          </p>
          <p className="text-lg">
            {`Once you create a profile, our admin team will review and publish it, making it visible to nonprofits who may reach out with volunteer requests. All requests are reviewed and vetted, and your participation is 100% voluntary. You can update or remove your profile at any time.`} 
          </p>
        </div>
      </Section>
      <Section className="">
        <ProfileForm skills={skills} user={user} />
      </Section>
    </>
  );
}
