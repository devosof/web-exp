import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from '@/db/db';
import { Service } from '@/db/models';
import { serviceSchema } from '@/lib/validation';

interface Params {
  id: string;
}

export async function PUT(request: Request, { params }: { params: Params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();

    const validatedData = serviceSchema.parse(body);

    const updatedService = await Service.findByIdAndUpdate(id, validatedData, {
      new: true,
    });

    if (!updatedService) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ service: updatedService }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { message: "Error updating service", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = params;

    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      return NextResponse.json({ message: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Service deleted" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { message: "Error deleting service", error: error.message },
      { status: 500 }
    );
  }
} 