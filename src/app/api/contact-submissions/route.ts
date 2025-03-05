import { NextResponse } from 'next/server';
import connectDB from '@/db/db';
import { ContactSubmission } from '@/db/models';
import { contactSubmissionSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const validatedData = contactSubmissionSchema.parse(body);

    const newContactSubmission = new ContactSubmission(validatedData);
    await newContactSubmission.save();

    return NextResponse.json({ contactSubmission: newContactSubmission }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating contact submission:", error);
    return NextResponse.json(
      { message: "Error creating contact submission", error: error.message },
      { status: 500 }
    );
  }
} 