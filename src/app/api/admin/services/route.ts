import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from '@/db/db';
import { Service } from '@/db/models';
import { serviceSchema } from '@/lib/validation';

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
    const total = await Service.countDocuments();
    
    // Get services with pagination
    const services = await Service.find()
      .sort({ order: 1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({ 
      services, 
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { message: "Error fetching services", error: error.message },
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

    const validatedData = serviceSchema.parse(body);

    const newService = new Service(validatedData);
    await newService.save();

    return NextResponse.json({ service: newService }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { message: "Error creating service", error: error.message },
      { status: 500 }
    );
  }
}