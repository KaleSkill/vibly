import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Banner from '@/models/banner';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const data = await req.json();

    // If no position provided, find the next available position
    if (!data.position) {
      const banners = await Banner.find().sort({ position: 1 });
      const takenPositions = banners.map(b => b.position);
      let position = 1;
      while (takenPositions.includes(position) && position <= 10) {
        position++;
      }
      if (position > 10) {
        return NextResponse.json(
          { error: 'No positions available' },
          { status: 400 }
        );
      }
      data.position = position;
    }

    // Validate required fields
    if (!data.image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    const banner = await Banner.create({
      image: data.image,
      position: data.position,
      active: true
    });

    return NextResponse.json(banner);
  } catch (error: any) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create banner' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const banners = await Banner.find().sort({ position: 1 });
    return NextResponse.json(banners);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
} 