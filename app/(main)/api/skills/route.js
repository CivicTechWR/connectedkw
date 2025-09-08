import { NextResponse } from 'next/server';
import { getProfileSkills } from '../../../integrations/directus';

export async function GET() {
  try {
    const skills = await getProfileSkills();
    return NextResponse.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { message: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}
