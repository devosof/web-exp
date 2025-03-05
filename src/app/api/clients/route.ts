import { NextResponse } from 'next/server';
import connectDB from '@/db/db';
import { Client } from '@/db/models';

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const clients = await Client.find()
      .skip(skip)
      .limit(limit)
      .exec();

    const totalClients = await Client.countDocuments();

    return NextResponse.json({
      clients,
      total: totalClients,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { message: "Error fetching clients" },
      { status: 500 }
    );
  }
} 