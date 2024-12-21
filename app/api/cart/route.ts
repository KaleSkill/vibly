import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Cart from '@/models/cart';
import Product from '@/models/product';

interface CartItem {
  product: string;
  variant: {
    color: string;
    size: string;
  };
  quantity: number;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const cart = await Cart.findOne({ user: session.user.id })
      .populate({
        path: 'items.product',
        model: Product,
        select: 'name price discountedPrice discountPercent variants saleType salePrice discountedSalePrice',
        populate: {
          path: 'variants.color',
          model: 'Color',
          select: 'name value',
        },
      })
      .lean();

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    // Add stock information to each cart item
    cart.items = cart.items.map(item => {
      const product = item.product;
      console.log(item)
      const variant = product.variants.find(v => v.color._id.toString() === item.variant.color.toString());
      console.log(variant)
      const sizeInfo = variant.sizes.find(s => s.size === item.variant.size);
      console.log(sizeInfo);
      return {
        ...item,
        stock: sizeInfo ? sizeInfo.stock : 0,
      };
    });

    return NextResponse.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
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

    const data = await req.json();
    await connectDB();

    let cart = await Cart.findOne({ user: session.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: session.user.id,
        items: []
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item: CartItem) =>
        item.product.toString() === data.productId &&
        item.variant.color === data.variant.color &&
        item.variant.size === data.variant.size
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += data.quantity;
    } else {
      // Add new item if it doesn't exist
      cart.items.push({
        product: data.productId,
        variant: data.variant,
        quantity: data.quantity
      });
    }

    await cart.save();

    // Fetch updated cart with populated product data
    const updatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        model: Product,
        select: 'name price discountedPrice discountPercent variants',
        populate: {
          path: 'variants.color',
          model: 'Color',
          select: 'name value'
        }
      })
      .lean();

      // Add stock information to each cart item
      updatedCart.items = updatedCart.items.map(item => {
      const product = item.product;
      console.log(item)
      const variant = product.variants.find(v => v.color._id.toString() === item.variant.color.toString());
      console.log(variant)
      const sizeInfo = variant.sizes.find(s => s.size === item.variant.size);
      console.log(sizeInfo);
      return {
        ...item,
        stock: sizeInfo ? sizeInfo.stock : 0,
      };
    });

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Failed to add to cart' },
      { status: 500 }
    );
  }
} 