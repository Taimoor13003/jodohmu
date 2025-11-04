import { NextResponse } from 'next/server';

const profiles = [
  {
    id: 1,
    name: 'John Doe',
    age: 30,
    gender: 'male',
    education: 'Masters in Computer Science',
    occupation: 'Software Engineer',
    sect: 'Sunni',
    praying: true,
  },
  {
    id: 2,
    name: 'Jane Smith',
    age: 28,
    gender: 'female',
    education: 'PhD in Psychology',
    occupation: 'Researcher',
    sect: 'Shia',
    praying: true,
  },
  // Add more dummy profiles here
];

export async function GET() {
  return NextResponse.json(profiles);
}
