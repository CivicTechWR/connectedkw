import VolunteerRequestForm from 'components/profiles/VolunteerRequestForm';
import Section from 'components/layout/Section';
export default function Page() {
  return (
    <>
      <Section className="bg-slate-100">
        <div>
          <h1 className="text-4 mb-6 md:text-6xl font-title">
            Request a Volunteer
          </h1>
          <p className="text-lg font-bold">
            {`Looking for skilled volunteers to support your organization?`} 
          </p>
          <p className="text-lg">
            {`We know that many local organizations are doing vital work with limited resources, and that finding the right help can make a world of difference. Our Volunteer Directory is here to help you connect with community members who are eager to lend their time and talents. You can browse the volunteer profiles and explore the range of skills available, then fill out a request form to tell us what you need.`}
          </p>
          <p className="text-lg">
            {`Once you submit your request, our admin team will review it to ensure it's a good fit. The next step is a short call with you to better understand your needs and explore how we can match you with the right volunteer. Our goal is to help you build capacity and move your mission forward - one connection at a time.`} 
          </p>
        </div>
      </Section>
      <Section>
        <VolunteerRequestForm />
      </Section>
    </>
  );
}
