import { NextResponse } from 'next/server';
import connectDB from '@/db/db';
import { JobPosting } from '@/db/models';

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const jobPostings = await JobPosting.find()
      .skip(skip)
      .limit(limit)
      .exec();

    const totalJobPostings = await JobPosting.countDocuments();

    return NextResponse.json({
      jobPostings,
      total: totalJobPostings,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching job postings:", error);
    return NextResponse.json(
      { message: "Error fetching job postings" },
      { status: 500 }
    );
  }
} 