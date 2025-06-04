import { register } from "integrations/directus";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { first_name, last_name, email, password } = await request.json();
    
    const result = await register(first_name, last_name, email, password);
    console.log(result);
    
    return NextResponse.json({ user: result }, { status: 201 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: err }, { status: 500 });
  }
}