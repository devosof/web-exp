import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from '@/db/db';
import { CaseStudy } from '@/db/models';
import { caseStudySchema } from '@/lib/validation';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();

    const validatedData = caseStudySchema.parse(body);

    const newCaseStudy = new CaseStudy(validatedData);
    await newCaseStudy.save();

    return NextResponse.json({ caseStudy: newCaseStudy }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating case study:", error);
    return NextResponse.json(
      { message: "Error creating case study", error: error.message },
      { status: 500 }
    );
  }
} 