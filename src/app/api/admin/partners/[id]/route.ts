import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from '@/db/db';
import { Partner } from '@/db/models';
import { partnerSchema } from '@/lib/validation';

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

    const validatedData = partnerSchema.parse(body);

    const updatedPartner = await Partner.findByIdAndUpdate(id, validatedData, {
      new: true,
    });

    if (!updatedPartner) {
      return NextResponse.json({ message: "Partner not found" }, { status: 404 });
    }

    return NextResponse.json({ partner: updatedPartner }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating partner:", error);
    return NextResponse.json(
      { message: "Error updating partner", error: error.message },
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

    const deletedPartner = await Partner.findByIdAndDelete(id);

    if (!deletedPartner) {
      return NextResponse.json({ message: "Partner not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Partner deleted" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting partner:", error);
    return NextResponse.json(
      { message: "Error deleting partner", error: error.message },
      { status: 500 }
    );
  }
} 