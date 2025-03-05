import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from '@/db/db';
import { Partner } from '@/db/models';
import { partnerSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();

    const validatedData = partnerSchema.parse(body);

    const newPartner = new Partner(validatedData);
    await newPartner.save();

    return NextResponse.json({ partner: newPartner }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating partner:", error);
    return NextResponse.json(
      { message: "Error creating partner", error: error.message },
      { status: 500 }
    );
  }
} 