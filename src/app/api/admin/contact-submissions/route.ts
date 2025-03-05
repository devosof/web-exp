import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from '@/db/db';
import { ContactSubmission } from '@/db/models';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const contactSubmissions = await ContactSubmission.find()
      .skip(skip)
      .limit(limit)
      .sort({ timestamp: -1 }) // Sort by timestamp in descending order
      .exec();

    const totalContactSubmissions = await ContactSubmission.countDocuments();

    return NextResponse.json({
      contactSubmissions,
      total: totalContactSubmissions,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching contact submissions:", error);
    return NextResponse.json(
      { message: "Error fetching contact submissions" },
      { status: 500 }
    );
  }
} 