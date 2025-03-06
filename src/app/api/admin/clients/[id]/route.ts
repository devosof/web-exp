import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from '@/db/db';
import { Client } from '@/db/models';
import { clientSchema } from '@/lib/validation';

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
    // Ensure params is properly awaited before destructuring
    const { id } = await params;
    const body = await request.json();

    const validatedData = clientSchema.parse(body);

    const updatedClient = await Client.findByIdAndUpdate(id, validatedData, {
      new: true,
    });

    if (!updatedClient) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ client: updatedClient }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { message: "Error updating client", error: error.message },
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
    // Ensure params is properly awaited before destructuring
    const { id } = await params;

    const deletedClient = await Client.findByIdAndDelete(id);

    if (!deletedClient) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Client deleted" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { message: "Error deleting client", error: error.message },
      { status: 500 }
    );
  }
}