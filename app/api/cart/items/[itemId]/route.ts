import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Cart from '@/models/cart';
import Product from '@/models/product';

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

    // First, get the cart item to check product and variant details
    const cart = await Cart.findOne({
      user: session.user.id,
      'items._id': params.itemId
    }).populate('items.product');

    if (!cart) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    // Find the cart item
    const cartItem = cart.items.find(item => item._id.toString() === params.itemId);
    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    // Get the product to check current stock
    const product = await Product.findById(cartItem.product._id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Find the variant and size
    const variant = product.variants.find(v => v.color._id.toString() === cartItem.variant.color.toString());
    if (!variant) {
      return NextResponse.json({ error: 'Product variant not found' }, { status: 404 });
    }

    const size = variant.sizes.find(s => s.size === cartItem.variant.size);
    if (!size) {
      return NextResponse.json({ error: 'Size not found' }, { status: 404 });
    }

    // Check if requested quantity is within stock limits
    if (quantity > size.stock) {
      return NextResponse.json({
        error: `Cannot update quantity. Only ${size.stock} items available in stock.`
      }, { status: 400 });
    }

    // Update the quantity if all checks pass
    const updatedCart = await Cart.findOneAndUpdate(
      {
        user: session.user.id,
        'items._id': params.itemId
      },
      {
        $set: { 'items.$.quantity': quantity },
        updatedAt: new Date()
      },
      { new: true }
    ).populate({
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

    await Cart.findById(cart._id)
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
    console.error('Error updating cart quantity:', error);
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

    const updatedCart = await Cart.findOneAndUpdate(
      { user: session.user.id },
      {
        $pull: { items: { _id: params.itemId } },
        updatedAt: new Date()
      },
      { new: true }
    ).populate({
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

    if (!updatedCart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }
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
    console.error('Error removing item:', error);
    return NextResponse.json(
      { error: 'Failed to remove item' },
      { status: 500 }
    );
  }
} 