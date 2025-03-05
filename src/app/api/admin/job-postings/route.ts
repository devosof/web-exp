import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from '@/db/db';
import { JobPosting } from '@/db/models';
import { jobPostingSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();

    const validatedData = jobPostingSchema.parse(body);

    const newJobPosting = new JobPosting(validatedData);
    await newJobPosting.save();

    return NextResponse.json({ jobPosting: newJobPosting }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating job posting:", error);
    return NextResponse.json(
      { message: "Error creating job posting", error: error.message },
      { status: 500 }
    );
  }
} 