import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/order';
import Address from '@/models/address';
import { sendOrderConfirmationEmail } from '@/lib/nodemailer';
import Color from '@/models/color';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const orders = await Order.find({ user: session.user.id })
      .populate({
        path: 'items.product',
        select: 'name price discountedPrice variants'
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
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

    const { items, shippingAddressId, paymentMethod } = await req.json();
    await connectDB();

    // Modify items to populate the color reference
    const populatedItems = await Promise.all(items.map(async (item: any) => ({
      ...item,
      variant: {
        ...item.variant,
        color: await Color.findById(item.variant.color)
      }
    })));

    // Fetch the complete address details
    const shippingAddress = await Address.findById(shippingAddressId).lean();
    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address not found' },
        { status: 404 }
      );
    }

    const total = populatedItems.reduce((acc: number, item: any) =>
      acc + (item.product.saleType ? item.product.discountedSalePrice : item.product.discountedPrice * item.quantity), 0
    );

    // Set initial status based on payment method
    const initialStatus = paymentMethod === 'cod' ? 'pending' : 'confirmed';

    const order = await Order.create({
      user: session.user.id,
      items: populatedItems,
      shippingAddress,
      paymentMethod,
      status: initialStatus,
      total
    });

    // Send confirmation email
    if (session.user.email) {
      await sendOrderConfirmationEmail(session.user.email, {
        orderId: order._id.toString(),
        items: populatedItems,
        total,
        shippingAddress: {
          fullName: shippingAddress.fullName,
          streetAddress: shippingAddress.streetAddress,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          phoneNumber: shippingAddress.phoneNumber
        }
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 