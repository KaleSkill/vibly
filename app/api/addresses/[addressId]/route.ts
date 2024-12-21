import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Address from '@/models/address';

export async function DELETE(
  req: Request,
  { params }: { params: { addressId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const address = await Address.findOneAndDelete({
      _id: params.addressId,
      user: session.user.id
    });

    if (!address) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    // If the deleted address was default and there are other addresses,
    // make the most recent one default
    if (address.isDefault) {
      const latestAddress = await Address.findOne({ user: session.user.id })
        .sort({ createdAt: -1 });
      
      if (latestAddress) {
        latestAddress.isDefault = true;
        await latestAddress.save();
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    );
  }
} 