import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/order';
import Address from '@/models/address';
import { sendOrderConfirmationEmail } from '@/lib/nodemailer';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, shippingAddressId, paymentMethod } = await req.json();

    await connectDB();

    // Fetch the complete address details
    const shippingAddress = await Address.findById(shippingAddressId).lean();
    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address not found' },
        { status: 404 }
      );
    }

    const total = items.reduce((acc: number, item: any) => 
      acc + (item.product.discountedPrice * item.quantity), 0
    );

    const order = await Order.create({
      user: session.user.id,
      items,
      shippingAddress,
      paymentMethod,
      status: 'pending',
      total
    });

    // Send confirmation email
    if (session.user.email) {
      await sendOrderConfirmationEmail(session.user.email, {
        orderId: order._id.toString(),
        items,
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