import Image from "next/image";
import Link from "next/link";
import Layout from "components/Layout";
import { useRouter } from "next/router";
import { useState } from "react";	

export default function LoginPage() {
	const router = useRouter();
	const { verification } = router.query;
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const email = e.target.email.value;
		const password = e.target.password.value;

		const result = await fetch("/api/login", {
			method: "POST",
			body: JSON.stringify({ email, password }),
		});
		const data = await result.json();
		console.log(data);

		if (result.ok) {
			localStorage.setItem('access_token', data.token);
			router.push("/")
		} else {
			setError("Invalid email or password");
		}
		e.target.reset();
		setLoading(false);

	}

	return (
		<Layout color="rainbow">
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
							<form className="w-[90%] md:w-[80%] bg-white shadow-md rounded pt-6 px-8 mb-2 md:mb-8 pb-8" onSubmit={handleLogin}>
								<div className="mb-4">
									<h2>Login</h2>
								</div>
								{	
									verification === "success" && (
										<div className="mb-4">
											<p><i className={`mr-1 fa-solid fa-check-circle text-red`}></i>Thanks for verifying your email!</p>
											<p><i className={`mr-1 fa-solid fa-user-circle text-red`}></i>Please log in to continue.</p>
										</div>
									)
								}
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
				</div>
			</section>
		</Layout>
	);
}
