import Section from "components/layout/Section";
import CreateRequestForm from "components/profiles/CreateRequestForm";

export default async function Page() {
  return (
    <Section className="bg-slate-100">
      <div>
        <h1>Submit Volunteer Request</h1>
        <p>
          Share your organisation and volunteer needs to match with volunteers
          in our community!
        </p>

        <CreateRequestForm />
      </div>
    </Section>
  );
}
