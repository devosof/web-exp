import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectDB from '@/db/db';
import { BlogArticle } from '@/db/models';
import { blogArticleSchema } from '@/lib/validation';

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
    const total = await BlogArticle.countDocuments();
    
    // Get blog articles with pagination
    const blogArticles = await BlogArticle.find()
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({ 
      blogArticles, 
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching blog articles:", error);
    return NextResponse.json(
      { message: "Error fetching blog articles", error: error.message },
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