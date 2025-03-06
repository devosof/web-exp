import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from '@/db/db';
import { BlogArticle } from '@/db/models';
import { blogArticleSchema } from '@/lib/validation';

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

    const validatedData = blogArticleSchema.parse(body);

    const updatedBlogArticle = await BlogArticle.findByIdAndUpdate(id, validatedData, {
      new: true,
    });

    if (!updatedBlogArticle) {
      return NextResponse.json({ message: "Blog article not found" }, { status: 404 });
    }

    return NextResponse.json({ blogArticle: updatedBlogArticle }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating blog article:", error);
    return NextResponse.json(
      { message: "Error updating blog article", error: error.message },
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

    const deletedBlogArticle = await BlogArticle.findByIdAndDelete(id);

    if (!deletedBlogArticle) {
      return NextResponse.json({ message: "Blog article not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Blog article deleted" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting blog article:", error);
    return NextResponse.json(
      { message: "Error deleting blog article", error: error.message },
      { status: 500 }
    );
  }
}