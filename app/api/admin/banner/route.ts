import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Banner from '@/models/banner';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();

    // Get the banner document or create one if it doesn't exist
    let banner = await Banner.findOne({});
    
    if (!banner) {
      banner = await Banner.create({ images: [] });
    }

    return NextResponse.json(banner);
  } catch (error: any) {
    console.error('Error fetching banner:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch banner' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  let mongoSession;

  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { images } = await req.json();

    mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    try {
      // Get or create the banner document
      let banner = await Banner.findOne({}).session(mongoSession);
      
      if (!banner) {
        banner = await Banner.create([{ images: [] }], { session: mongoSession });
        banner = banner[0];
      }

      // Update images array
      banner.images = images;

      // Save changes
      await banner.save({ session: mongoSession });

      await mongoSession.commitTransaction();
      return NextResponse.json({ success: true });
    } catch (error) {
      if (mongoSession) await mongoSession.abortTransaction();
      throw error;
    }
  } catch (error: any) {
    console.error('Error processing batch update:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to process batch update' 
    }, { 
      status: 500 
    });
  } finally {
    if (mongoSession) await mongoSession.endSession();
  }
} 