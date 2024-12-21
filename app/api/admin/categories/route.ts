import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Category from '@/models/category';

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    await connectDB();
    const category = await Category.create(data);

    return NextResponse.json(category);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 