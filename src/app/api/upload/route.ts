import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert buffer to base64 string for Cloudinary upload
    const base64String = Buffer.from(buffer).toString('base64');
    const dataURI = `data:${file.type};base64,${base64String}`;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'xcelliti-uploads',
      public_id: `${Date.now()}-${Math.random().toString(36).substring(2)}`
    });

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      fileName: result.public_id.split('/').pop(),
      originalName: file.name,
      size: file.size,
      type: file.type,
      width: result.width,
      height: result.height
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}