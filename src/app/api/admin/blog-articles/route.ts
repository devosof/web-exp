import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from '@/db/db';
import { BlogArticle } from '@/db/models';
import { blogArticleSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();

    const validatedData = blogArticleSchema.parse(body);

    const newBlogArticle = new BlogArticle(validatedData);
    await newBlogArticle.save();

    return NextResponse.json({ blogArticle: newBlogArticle }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating blog article:", error);
    return NextResponse.json(
      { message: "Error creating blog article", error: error.message },
      { status: 500 }
    );
  }
} 