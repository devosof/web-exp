import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from '@/db/db';
import { Service } from '@/db/models';
import { serviceSchema } from '@/lib/validation';

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