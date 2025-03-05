import { NextResponse } from 'next/server';
import connectDB from '@/db/db';
import { Service } from '@/db/models';

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const services = await Service.find()
      .skip(skip)
      .limit(limit)
      .exec();

    const totalServices = await Service.countDocuments();

    return NextResponse.json({
      services,
      total: totalServices,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { message: "Error fetching services" },
      { status: 500 }
    );
  }
} 