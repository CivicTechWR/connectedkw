import { NextResponse } from "next/server";
import { registerRequest } from "integrations/directus";

export async function POST(request) {
  try {
    const requestData = await request.json();

    const result = await registerRequest(requestData);
    return NextResponse.json({ request: result }, { status: 201 });
  } catch (error) {
    console.error("Error creating volunteer request:", error);
    return NextResponse.json({ message: error }, { status: 500 });
  }
}
