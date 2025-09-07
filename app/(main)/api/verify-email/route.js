import { verifyEmail } from "integrations/directus";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const result = await verifyEmail(token);
    
    if (result?.errors) {
      console.log(result.errors);
      return NextResponse.redirect(new URL('/auth/register?verification=failed', request.url));
    }
    
    return NextResponse.redirect(new URL('/auth/login?verification=success', request.url));
  } catch (err) {
    console.log(err);
    return NextResponse.redirect(new URL('/auth/register?verification=failed', request.url));
  }
}