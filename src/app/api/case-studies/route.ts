import { NextResponse } from 'next/server';
import connectDB from '@/db/db';
import { CaseStudy } from '@/db/models';

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const caseStudies = await CaseStudy.find()
      .skip(skip)
      .limit(limit)
      .exec();

    const totalCaseStudies = await CaseStudy.countDocuments();

    return NextResponse.json({
      caseStudies,
      total: totalCaseStudies,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching case studies:", error);
    return NextResponse.json(
      { message: "Error fetching case studies" },
      { status: 500 }
    );
  }
} 