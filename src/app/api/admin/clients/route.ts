import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from '@/db/db';
import { Client } from '@/db/models';
import { clientSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();

    const validatedData = clientSchema.parse(body);

    const newClient = new Client(validatedData);
    await newClient.save();

    return NextResponse.json({ client: newClient }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { message: "Error creating client", error: error.message },
      { status: 500 }
    );
  }
} 