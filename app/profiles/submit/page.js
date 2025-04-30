import Section from "components/layout/Section";
import CreateProfileForm from "components/profiles/CreateProfileForm";
import "./submit.module.css";
import { getProfileSkills } from "integrations/directus";

export default async function Page() {
  const skills = await getProfileSkills();
  
  return (
    <Section className="bg-slate-100">
      <div>
        <h1>Create Profile</h1>
        <p>Share your skills and interests with the Civic Tech WR community</p>

        <CreateProfileForm skills={skills} />
      </div>
    </Section>
  );
}
