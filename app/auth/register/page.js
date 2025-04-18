'use client'

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Suspense } from "react";

const VerificationMessage = () => {
	const searchParams = useSearchParams()
	const verification = searchParams.get('verification');
	
	if (verification === "failed") {
		return (
			<div className="mb-4">
				<p className="text-red">
					Something went wrong when verifying your email. Please try again.
				</p>
			</div>
		)
	}
}

export default function LoginPage({}) {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(null);
	const searchParams = useSearchParams()
	const verification = searchParams.get('verification');

	// Error Messages
	const [error, setError] = useState("");
	const resetForm = () => {
		setFirstName("");
		setLastName("");
		setEmail("");
		setPassword("");
		setConfirmPassword("");
	};

	const handleRegister = async (e) => {
		setError(null);
		setSuccess(null);
		setLoading(true);
		e.preventDefault();

		if (firstName === "") {
			setLoading(false);
			setError("First name is required");
			return;
		}
		if (lastName === "") {
			setLoading(false);
			setError("Last name is required");
			return;
		}
		if (email === "") {
			setLoading(false);
			setError("Email is required");
			return;
		}
		if (password === "") {
			setLoading(false);
			setError("Password is required");
			return;
		}
		if (password.length < 8) {
			setLoading(false);
			setError("Password must be atleast 8 characters long");
			return;
		}
		if (password !== confirmPassword) {
			setLoading(false);
			setError("Passwords do not match");
			return;
		}

		const result = await fetch("/api/register", {
			method: "POST",
			body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password }),
		});

		// TODO: check result for errors and display them

		setLoading(false);
		setSuccess(true);
		resetForm();
	};

	return (
		<>
			<section className="bg-slate-100 md:py-12 pt-12 pb-0">
				<div className="container mx-auto">
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
							<form
								className="w-[90%] md:w-[80%] bg-white shadow-md rounded pt-6 px-8 mb-2 md:mb-8 pb-8"
								onSubmit={handleRegister}
							>
								<div className="mb-4">
									<h2>Register</h2>
								</div>
								<Suspense fallback={<div>Loading...</div>}>
									<VerificationMessage />
								</Suspense>
								{error && (
									<div className="mb-4">
										<p className="text-red">{error}</p>
									</div>
								)}
								{success && (
									<div className="mb-4">
										<p className="text-green">
											Thanks for signing up! Please check your email for verification
											instructions.
										</p>
									</div>
								)}
								<div className="mb-4">
									<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="firstName">
										First Name*
									</label>
									<input
										className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
										id="firstName"
										type="text"
										placeholder="Jane"
										value={firstName}
										onChange={(e) => setFirstName(e.target.value)}
									/>
								</div>
								<div className="mb-4">
									<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="lastName">
										Last Name*
									</label>
									<input
										className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
										id="lastName"
										type="text"
										placeholder="Doe"
										value={lastName}
										onChange={(e) => setLastName(e.target.value)}
									/>
								</div>
								<div className="mb-4">
									<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
										Email*
									</label>
									<input
										className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
										id="email"
										type="email"
										placeholder="janedoe@gmail.com"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
									/>
								</div>
								<div>
									<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
										Password*
									</label>
									<input
										className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
										id="password"
										type="password"
										placeholder="******************"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
									/>
									{/* The following is the error side. */}
									{/* <p className="text-red-500 text-xs italic">Enter your password here</p> */}
								</div>
								<div className="mb-4 md:mb-6">
									<label
										className="block text-gray-700 text-sm font-bold mb-2"
										htmlFor="confirm-password"
									>
										Confirm Password*
									</label>
									<input
										className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
										id="confirm-password"
										type="password"
										placeholder="******************"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
									/>
									{/* The following is the error side. */}
									{/* <p className="text-red-500 text-xs italic">Enter your password here</p> */}
								</div>
								<div className="md:flex md:items-center md:justify-between justify-items-center">
									{loading ? (
										<Image src="/loading.svg" width={40} height={40} alt="loading" />
									) : (
										<button
											className="bg-red text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mx-auto md:mx-0"
											type="submit"
										>
											Sign Up
										</button>
									)}
									<div className="md:flex md:items-center md:justify-between md:gap-3 mt-4">
										<div className="text-center">
											<Link
												className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
												href="/auth/login"
											>
												Login
											</Link>
										</div>
										<div className="text-center">
											<Link
												className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
												href="#"
											>
												Forgot Password?
											</Link>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
