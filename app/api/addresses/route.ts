import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Address from '@/models/address';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const addresses = await Address.find({ user: session.user.id })
      .sort({ isDefault: -1, createdAt: -1 });

    return NextResponse.json(addresses);
  } catch (error: unknown) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    await connectDB();

    // If this is the first address, make it default
    const addressCount = await Address.countDocuments({ user: session.user.id });
    if (addressCount === 0) {
      data.isDefault = true;
    }

    const address = await Address.create({
      ...data,
      user: session.user.id
    });

    return NextResponse.json(address);
  } catch (error: unknown) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { _id, ...updateData } = data;

    await connectDB();

    const address = await Address.findOneAndUpdate(
      { _id, user: session.user.id },
      updateData,
      { new: true }
    );

    if (!address) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(address);
  } catch (error: unknown) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    );
  }
} 
