import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from '@/db/db';
import { JobPosting } from '@/db/models';
import { jobPostingSchema } from '@/lib/validation';

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
    // Ensure params is properly awaited before destructuring
    const { id } = await params;
    const body = await request.json();

    const validatedData = jobPostingSchema.parse(body);

    const updatedJobPosting = await JobPosting.findByIdAndUpdate(id, validatedData, {
      new: true,
    });

    if (!updatedJobPosting) {
      return NextResponse.json({ message: "Job posting not found" }, { status: 404 });
    }

    return NextResponse.json({ jobPosting: updatedJobPosting }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating job posting:", error);
    return NextResponse.json(
      { message: "Error updating job posting", error: error.message },
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
    // Ensure params is properly awaited before destructuring
    const { id } = await params;

    const deletedJobPosting = await JobPosting.findByIdAndDelete(id);

    if (!deletedJobPosting) {
      return NextResponse.json({ message: "Job posting not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Job posting deleted" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting job posting:", error);
    return NextResponse.json(
      { message: "Error deleting job posting", error: error.message },
      { status: 500 }
    );
  }
}