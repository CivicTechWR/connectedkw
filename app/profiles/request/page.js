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
          <p className="text-lg">{`The first step to engaging a volunteer is to request a short consultation with us to discuss your needs. Please fill out the form below to get started!`}</p>
        </div>
      </Section>
      <Section>
        <VolunteerRequestForm />
      </Section>
    </>
  );
}
