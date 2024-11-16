import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Cart from '@/models/cart';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Populate product details when fetching cart
    const cart = await Cart.findOne({ user: session.user.id })
      .populate({
        path: 'product',
        select: 'name price discountedPrice discountPercent variants',
        model: 'Product'
      });

    return NextResponse.json(cart || { items: [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
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

    const { productId, variant, quantity } = await req.json();

    await connectDB();
    let cart = await Cart.findOne({ user: session.user.id });

    if (!cart) {
      cart = new Cart({
        user: session.user.id,
        items: []
      });
    }

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId &&
      item.variant.color === variant.color &&
      item.variant.size === variant.size
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        variant: {
          color: variant.color,
          colorName: variant.colorName,
          size: variant.size
        },
        quantity
      });
    }

    cart.updatedAt = new Date();
    await cart.save();

    // Fetch the updated cart with populated product details
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: 'name price discountedPrice discountPercent variants',
        model: 'Product'
      });

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
} 