import Image from 'next/image'
import { useState } from 'react'

export const STATUS = {
  idle: "IDLE",
  loading: "LOADING",
  success: "SUCCESS",
  error: "ERROR",
};

async function subscribe({ firstName, email }) {
  const body = JSON.stringify({firstName, email})
  const response = await fetch("/api/subscribe", {
    method: "POST",
    body: body
  });
  return response
}

const MailchimpSubscriptionForm = () => {
  const [form, setForm] = useState({ firstName: "", email: "", honeypot: "" });
  const [subscribeState, setSubscribeState] = useState({
    status: STATUS.idle,
    value: "",
    error: null,
  });

  const handleInputChange = (event) => {
    const target = event.target;
    const name = target.name;
    const value = target.value;

    setForm((form) => ({
      ...form,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {

    if (form.honeypot !== "") {
      return null
    }

    if (form.firstName === "" || form.email === "") return;

    const res = await subscribe({ firstName: form.firstName, email: form.email })
    const json = await res.json()
    switch (res.status) {
      case 200:
        setSubscribeState({
          status: STATUS.success,
          value: json.message,
          error: null,
        });
        break;
      case 400:
        setSubscribeState({
          status: STATUS.success,
          value: json.message,
          error: null,
        });
        break;
      case 500:
        setSubscribeState({
          status: STATUS.error,
          value: "",
          error: json.message,
        });
        break;
      default:
        setSubscribeState({
          status: STATUS.error,
          value: "",
          error: json.message,
        });
    }
  };

  return (
    <div className="w-full bg-white p-5 border-3 rounded-xl border-black ">
      <div className="pb-2">
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-body font-bold mb-8 sm:mb-16 -rotate-6">Subscribe</h2>

      <p className="mb-2 text-lg sm:text-xl ">
          {`Find out about family-friendly events and activities in our community. Not in an annoying spammy way, just thoughtful and timely information to keep you in the loop 😜`}
        </p>
      </div>

      {subscribeState.status === STATUS.error && (
        <div
          className="text-red mb-2"
          dangerouslySetInnerHTML={{ __html: subscribeState.error }}
        />
      )}
      {subscribeState.status === STATUS.success && (
        <div
          className="text-green mb-2"
          dangerouslySetInnerHTML={{ __html: subscribeState.value }}
        />
      )}

      {(subscribeState.status !== STATUS.success) && (
        <div id="mc_embed_signup">
          <div className="mc-field-group flex flex-col mb-2">
            <label htmlFor="mce-EMAIL" className="text-sm">Email Address  <span className="asterisk">*</span></label>
            <input id="email" value={form.email} onChange={handleInputChange} type="email" name="email" className="required email border-2 p-2 rounded-md" required />
          </div>

          <div className="mc-field-group flex flex-col mb-2">
            <label htmlFor="firstName" className="text-sm">Name  <span className="asterisk">*</span></label>
            <input id="firstName" value={form.firstName} onChange={handleInputChange} type="text" name="firstName" className="required border-2 p-2 rounded-md" required />
          </div>

          <div style={{position: 'absolute', left: '-5000px'}} aria-hidden="true">
            <input id="honeypot" value={form.honeypot} onChange={handleInputChange} type="text" name="b_0dec77fbe34db1b0cd94df181_5922adb2bc" tabIndex="-1" />
          </div>
          <div className="optionalParent">
            <div className="clear foot">
              <button onClick={handleSubmit} id="mc-embedded-subscribe" className="btn btn-purple mt-4 space-x-1">
                <span>Subscribe</span>
                {(subscribeState.status === STATUS.loading) && <Image src="/loading.svg" width={20} height={20} alt="" />}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MailchimpSubscriptionForm;


