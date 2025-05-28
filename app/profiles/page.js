import { getProfiles, getProfileSkills } from 'integrations/directus'
import ProfileList from 'components/profiles/ProfileList'
import Section from 'components/layout/Section'
import Link from 'next/link'
import { getUser } from 'utils/auth/session'
import Image from 'next/image'
import { redirect } from 'next/navigation'

export default async function ProfilesPage() {
  const profiles = await getProfiles({});
  const skills = await getProfileSkills();
  // const user = await getUser();

  // console.log(user);

  // if (!user) {
  //   redirect('/auth/login?next=/profiles&info=protected')
  // }

  return (
    <>
      <Section className="bg-slate-100">
          <div className="lg:grid gap-6">
            <div className="flex justify-center items-center">
              <div>
                <h1 className="text-4 mb-6 md:text-6xl font-title">
                  Volunteer Directory
                </h1>
                <p className="text-lg">{`We partnered with Civic Tech WR to create this directory of skilled volunteers who want to get more involved in the community.`}</p> 
                <p className="text-lg">{`The first step to engaging a volunteer is to book a 30-minute consultation to discuss your needs and see if we have a volunteer with the right skills. Please submit a request to get the process started.`}</p>
                <p className="text-lg">{`We're always looking for more volunteers with diverse skills. Create your profile and let us know how you'd like to help!`}</p>
                <div className="flex flex-col md:flex-row gap-2 items-center mt-6">
                  <Link href="/profiles/new" className="btn btn-red no-underline">
                    <i className={`mr-2 fa-solid fa-circle-user hidden sm:inline`}></i>
                    Submit your profile                
                  </Link>
                  <Link href="/profiles/request" className="btn btn-yellow no-underline">
                    <i className={`mr-2 fa-solid fa-circle-user hidden sm:inline`}></i>
                    Request a volunteer                
                  </Link>
                </div>
              </div>
            </div>
            {/* <div className="hidden lg:flex max-h-[75vh] justify-center items-center relative p-12">
              <div className="absolute bottom-0 left-0 bg-[url(/highlights-01.svg)] bg-contain bg-no-repeat h-1/5 w-1/5" />
              <div className="absolute top-0 right-0 bg-[url(/highlights-02.svg)] bg-contain bg-no-repeat h-1/5 w-1/5" />
              <Image
                  className={`object-contain`}
                  src={`/calendar-laptop.png`}
                  alt="event calendar on a laptop" 
                  height="464"
                  width="800"
                />
            </div> */}
          </div>
      </Section>
      <Section>
		    {/* <p className="text-lg">{`Meet the skilled volunteers of Civic Tech WR`}</p> */}
        <ProfileList initialProfiles={profiles} skills={skills} />
      </Section>
    </>
  )
}
