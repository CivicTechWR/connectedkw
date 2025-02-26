import { useRouter } from "next/router";
import Image from "next/image";
import Layout from "components/Layout";
import DOMPurify from "isomorphic-dompurify";

// Fetch single profile
import { getProfileById } from "integrations/directus"; 

export async function getServerSideProps({ params }) {
  const profile = await getProfileById(params.id);

  if (!profile || profile.length === 0) {
    return { notFound: true };
  }

  return {
    props: { profile },
  };
}

// TODO: this page could be made better, it is barebones for now. I think we have existing designs that we can put here
export default function ProfileDetails({ profile }) {
  const router = useRouter();
  const directusURL = process.env.NEXT_PUBLIC_DIRECTUS_URL;

  if (!profile[0]) {
    return <p className="text-center text-red-500 mt-10">Not found, sorry</p>;
  }

  const avatarId = profile[0].profile_picture;
  const avatarURL = avatarId ? `${directusURL}/assets/${avatarId}` : null;

  const cleanBio = DOMPurify.sanitize(profile[0].bio, {
    FORBID_ATTR: ['style'],
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li']
  });

  return (
    <Layout color="rainbow">
      <button
        onClick={() => router.push("/profiles")}
        className="bg-slate-100 md:py-12 pt-12 pb-12 w-full flex justify-start pl-8"
      >
          {`< Back`}
      </button>
      <section className="bg-slate-100 md:py-12 pt-12 pb-12 w-full flex flex-col items-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
          {/* Avatar */}
          <div className="w-32 h-32 relative rounded-full overflow-hidden mx-auto mb-4">
            {avatarURL ? (
              <Image src={avatarURL} alt="User Avatar" fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-300" />
            )}
          </div>
          {/* Name */}
          <h1 className="text-2xl font-bold text-center">{profile[0].name}</h1>
          {/* City & Bio */}
          <div
          className="mb-2 text-gray-700"
          dangerouslySetInnerHTML={{ __html: cleanBio }}
          />
          {/* Verified Badge */}
          {profile[0].is_verified && (
            <div className="mt-4 flex justify-center">
              <span className="inline-flex items-center bg-green-500 text-white px-3 py-1 text-sm font-semibold rounded-full">
                <svg
                  className="h-4 w-4 mr-1"
                  fill="none"
                  stroke="white"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                Verified
              </span>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
