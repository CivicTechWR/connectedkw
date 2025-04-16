import { loginUser } from "integrations/directus";
import { NextResponse } from "next/server";

export async function POST(request) {
	try {
		const { email, password } = await request.json();
		
		// console.log("LOGIN API Invoked");
		const result = await loginUser(email, password);
		// console.log("LOGIN API RESULT", result);
		
		return NextResponse.json(
			{ user: result.user, token: result.access_token },
			{ status: 200 }
		);
	} catch (err) {
		console.log(err);
		return NextResponse.json(
			{ message: "Invalid email or password" },
			{ status: 401 }
		);
	}
}
