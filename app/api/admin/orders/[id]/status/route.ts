import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/order';
import { sendOrderStatusEmail } from '@/lib/nodemailer';
import { OrderStatus } from '@/types';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await req.json();
    await connectDB();

    const order = await Order.findById(params.id)
      .populate('user', 'name email')
      .populate({
        path: 'items.product',
        select: 'name price discountedPrice variants'
      });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    order.status = status;
    await order.save();

    // Get variant details including images for each item
    const orderItems = order.items.map((item: any) => {
      const variant = item.product.variants.find(
        (v: any) => v.color._id.toString() === item.variant.color
      );
      return {
        name: item.product.name,
        colorName: item.variant.colorName,
        size: item.variant.size,
        quantity: item.quantity,
        price: item.product.discountedPrice,
        image: variant?.images[0] || item.product.variants[0].images[0]
      };
    });

    // Send email notification with complete details
    if (order.user.email) {
      await sendOrderStatusEmail(order.user.email, {
        orderId: order._id.toString(),
        status,
        items: orderItems,
        total: order.total,
        shippingAddress: order.shippingAddress
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
} 