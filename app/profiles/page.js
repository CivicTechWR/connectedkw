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
          <div className="lg:grid grid-cols-2 gap-6">
            <div className="flex justify-center items-center">
              <div>
                <h1 className="text-4 mb-6 md:text-6xl font-title">
                  Volunteer Directory
                </h1>
                <p className="text-lg">{`Connected KW partnered with CivicTechWR to create a directory of skilled volunteers that helps local organizations find the support they need, and makes it easy for community members to offer their time and skills. Many organizations are doing vital work with limited resources. By connecting them with volunteers, we help strengthen our community.`}</p> 
                <p className="text-lg">{`We're always looking for more volunteers with diverse skills. Create your profile and let us know how you'd like to help!`}</p>
                <div className="flex flex-col md:flex-row gap-2 items-center mt-6">
                  <Link href="/profiles/new" className="btn btn-red no-underline">
                    <i className={`mr-2 fa-solid fa-circle-user hidden sm:inline`}></i>
                    Create a profile             
                  </Link>
                  <Link href="/profiles/request" className="btn btn-yellow no-underline">
                    <i className={`mr-2 fa-solid fa-handshake hidden sm:inline`}></i>
                    Request a volunteer                
                  </Link>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex max-h-[75vh] justify-center items-center relative p-20">
              <div className="absolute bottom-0 left-0 bg-[url(/highlights-01.svg)] bg-contain bg-no-repeat h-1/5 w-1/5" />
              <div className="absolute top-0 right-0 bg-[url(/highlights-02.svg)] bg-contain bg-no-repeat h-1/5 w-1/5" />
              <Image
                  className={`object-contain`}
                  src={`/volunteer-directory.png`}
                  alt="Group of volunteers at Civic Tech Waterloo Region" 
                  height="500"
                  width="500"
                />
            </div>
          </div>
      </Section>
      <Section>
		    {/* <p className="text-lg">{`Meet the skilled volunteers of Civic Tech WR`}</p> */}
        <ProfileList initialProfiles={profiles} skills={skills} />
      </Section>
    </>
  )
}
