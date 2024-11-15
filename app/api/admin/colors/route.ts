import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Color from '@/models/color';

export async function GET() {
  try {
    await connectDB();
    const colors = await Color.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(colors);
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
    if (!session?.user?.role === 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();
    const color = await Color.create(data);
    
    return NextResponse.json(color);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Color already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 