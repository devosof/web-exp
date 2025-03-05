import { NextResponse } from 'next/server';
import connectDB from '@/db/db';
import { BlogArticle } from '@/db/models';

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    const blogArticles = await BlogArticle.find()
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 }) // Sort by date in descending order
      .exec();

    const totalBlogArticles = await BlogArticle.countDocuments();

    return NextResponse.json({
      blogArticles,
      total: totalBlogArticles,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching blog articles:", error);
    return NextResponse.json(
      { message: "Error fetching blog articles" },
      { status: 500 }
    );
  }
} 