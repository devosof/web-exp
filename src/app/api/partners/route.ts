import { NextResponse } from 'next/server';
import connectDB from '@/db/db';
import { Partner } from '@/db/models';

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const partners = await Partner.find()
      .skip(skip)
      .limit(limit)
      .exec();

    const totalPartners = await Partner.countDocuments();

    return NextResponse.json({
      partners,
      total: totalPartners,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching partners:", error);
    return NextResponse.json(
      { message: "Error fetching partners" },
      { status: 500 }
    );
  }
} 