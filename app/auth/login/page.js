'use client'

import Image from "next/image";
import Link from "next/link";
import Section from "components/layout/Section";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";	
import { signIn } from "next-auth/react";
const VerificationMessage = () => {
	const searchParams = useSearchParams()
	const verification = searchParams.get('verification');
	
	if (verification === "success") {
		return (
			<div className="mb-4">
				<p><i className={`mr-1 fa-solid fa-check-circle text-red`}></i>Thanks for verifying your email!</p>
				<p><i className={`mr-1 fa-solid fa-user-circle text-red`}></i>Please log in to continue.</p>
			</div>
		)
	}
}


export default function LoginPage() {
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		const email = e.target.email.value;
		const password = e.target.password.value;
		console.log(email, password)
		const res = await signIn("credentials", {
			email: email,
			password: password,
			callbackUrl: `/`,
			redirect: false,
		})
	  
		if (res?.error) {
			setError(res?.error)
			setLoading(false)
		} else {
			router.push("/")
		}

		e.target.reset();
		setLoading(false);

	}

	return (
		<Section>
			<div className="lg:grid grid-cols-2">
				<div className="hidden lg:flex max-h-[75vh] justify-center items-center relative p-12">
					<div className="absolute -bottom-12 lg:-bottom-[5%] lg:right-[13%] bg-[url(/highlights-03.svg)] bg-contain bg-no-repeat h-1/5 w-1/5" />
					<div className="absolute top-0 lg:-top-[2%] right-0 lg:left-[15%] bg-[url(/highlights-04.svg)] bg-contain bg-no-repeat h-1/5 w-1/5" />
					<video
						width="480"
						height="960"
						autoPlay
						loop
						muted
						className="object-contain h-full w-auto max-h-[inherit] mx-auto relative"
					>
						<source src="/events-phone-mockup.webm" type="video/webm" />
						<source src="/events-phone-mockup.mp4" type="video/mp4" />
						<Image
							className={`object-contain`}
							src={`/events-phone-mockup.png`}
							alt="event listings on a phone"
							height="480"
							width="960"
						/>
					</video>
				</div>
				<div className="flex justify-center items-center">
					<form className="w-[90%] md:w-[80%] bg-white shadow-md rounded pt-6 px-8 mb-2 md:mb-8 pb-8" onSubmit={handleLogin}>
						<div className="mb-4">
							<h2>Login</h2>
						</div>
						<Suspense fallback={<div>Loading...</div>}>
							<VerificationMessage />
						</Suspense>
						{
							error && (
								<div className="mb-4">
									<p className="text-red">{error}</p>
								</div>
							)
						}
						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
								Email
							</label>
							<input
								className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
								id="email"
								type="text"
								placeholder="janedoe@gmail.com"
							/>
						</div>
						<div className="mb-4 md:mb-6">
							<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
								Password
							</label>
							<input
								className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
								id="password"
								type="password"
								placeholder="******************"
							/>
							{/* The following is the error side. */}
							{/* <p className="text-red-500 text-xs italic">Enter your password here</p> */}
						</div>
						<div className="md:flex md:items-center md:justify-between justify-items-center">
						{
								loading ? (
									<Image src="/loading.svg" width={40} height={40} alt="loading" />
								) : (
									<button
										className="bg-red text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mx-auto md:mx-0"
								type="submit"
									>
										Sign In
									</button>
								)
							}
							<div className="md:flex md:items-center md:justify-between md:gap-3 mt-4">
								<div className="text-center">
									<Link
										className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
										href="/auth/register"
									>
										Register
									</Link>
								</div>
								<div  className="text-center">
									<a
										className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
										href="#"
									>
										Forgot Password?
									</a>
								</div>
							</div>
						</div>
					</form>
				</div>
			</div>
		</Section>
	);
}
