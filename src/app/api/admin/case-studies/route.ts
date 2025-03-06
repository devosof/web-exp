import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from '@/db/db';
import { CaseStudy } from '@/db/models';
import { caseStudySchema } from '@/lib/validation';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    
    // Parse query parameters
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 10;
    const page = url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : 1;
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await CaseStudy.countDocuments();
    
    // Get case studies with pagination
    const caseStudies = await CaseStudy.find()
      .skip(skip)
      .limit(limit);

    return NextResponse.json({ 
      caseStudies, 
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching case studies:", error);
    return NextResponse.json(
      { message: "Error fetching case studies", error: error.message },
      { status: 500 }
    );
  }
}

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