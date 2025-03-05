import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from '@/db/db';
import { CaseStudy } from '@/db/models';
import { caseStudySchema } from '@/lib/validation';

interface Params {
  id: string;
}

export async function PUT(request: Request, { params }: { params: Params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    const validatedData = caseStudySchema.parse(body);

    const updatedCaseStudy = await CaseStudy.findByIdAndUpdate(id, validatedData, {
      new: true,
    });

    if (!updatedCaseStudy) {
      return NextResponse.json({ message: "Case study not found" }, { status: 404 });
    }

    return NextResponse.json({ caseStudy: updatedCaseStudy }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating case study:", error);
    return NextResponse.json(
      { message: "Error updating case study", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = params;

    const deletedCaseStudy = await CaseStudy.findByIdAndDelete(id);

    if (!deletedCaseStudy) {
      return NextResponse.json({ message: "Case study not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Case study deleted" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting case study:", error);
    return NextResponse.json(
      { message: "Error deleting case study", error: error.message },
      { status: 500 }
    );
  }
} 