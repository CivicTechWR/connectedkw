import Image from 'next/image'
import Link from 'next/link'

const Footer = () => {

  return (

      <footer className={`w-full relative bg-slate-100 py-6`}>
        <div className="container max-w-screen-xl mx-auto px-5">
          <div className="md:grid grid-cols-2 md:gap-24">
            <div className="mb-4 basis-1/2">
              <p className="font-body font-medium text-xl md:text-lg ">About Connected KW</p>
              <p className="">Connected KW is a volunteer-run project with the goal of creating an inclusive and comprehensive resource for residents of KW.</p>
              <p className="">If your organization might be interested in a partnership please <a href="mailto:shay@connectedkw.com" className="hover:text-red">reach out!</a></p>
              <a
                href="https://instagram.com/connectedkw"
                rel="noopener noreferrer"
                className="my-6 block"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height="30" width="30" fill="currentColor">
                  <path
                    d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
                  />
                </svg>
              </a>
            </div>

            <div className="basis-1/2">
              <p className="font-body font-medium text-xl md:text-lg ">Get involved</p>
              <p className=""><a href="https://cms.connectedkw.com/admin/" target="_blank" rel="noreferrer">Submit an event</a></p>
              <p className=""><a href="https://github.com/s-kennedy/connectedkw/issues" target="_blank" rel="noreferrer">Report a bug</a></p>
              <p className=""><a href="https://buy.stripe.com/cN24hE161goQcZa8wx" target="_blank" rel="noreferrer">Make a donation</a></p>
              <p className=""><a href="mailto:shay@connectedkw.com" target="_blank" rel="noreferrer">Contact shay@connectedkw.com</a></p>
              <p className="my-6">
                <a href="https://www.dreamsidedigital.com" className="hover:text-red order-1 sm:order-2 mb-4">
                  Made by Dreamside Digital
                </a>
              </p>
            </div>
          </div>

        </div>
      </footer>
  )
}

export default Footer
