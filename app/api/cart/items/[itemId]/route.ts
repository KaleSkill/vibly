import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Cart from '@/models/cart';

export async function PATCH(
  req: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quantity } = await req.json();
    await connectDB();

    const cart = await Cart.findOneAndUpdate(
      { 
        user: session.user.id,
        'items._id': params.itemId 
      },
      { 
        $set: { 'items.$.quantity': quantity },
        updatedAt: new Date()
      },
      { new: true }
    ).populate('items.product', 'name price discountedPrice variants');

    if (!cart) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update quantity' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const cart = await Cart.findOneAndUpdate(
      { user: session.user.id },
      { 
        $pull: { items: { _id: params.itemId } },
        updatedAt: new Date()
      },
      { new: true }
    ).populate('items.product', 'name price discountedPrice variants');

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove item' },
      { status: 500 }
    );
  }
} 