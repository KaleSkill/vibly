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

    const validStatuses: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findById(params.id)
      .populate('user', 'email name')
      .populate('items.product', 'name price discountedPrice variants');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const currentStatus = order.status;
    const isValidTransition = (
      (currentStatus === 'pending' && ['confirmed', 'cancelled'].includes(status)) ||
      (currentStatus === 'confirmed' && ['shipped', 'cancelled'].includes(status)) ||
      (currentStatus === 'shipped' && ['delivered', 'cancelled'].includes(status)) ||
      (currentStatus === status)
    );

    if (!isValidTransition) {
      return NextResponse.json(
        { error: `Cannot change status from ${currentStatus} to ${status}` },
        { status: 400 }
      );
    }

    order.status = status;
    await order.save();

    if (order.user?.email) {
      await sendOrderStatusEmail(order.user.email, {
        orderId: order._id.toString(),
        status,
        items: order.items,
        total: order.total,
        shippingAddress: order.shippingAddress
      });
    }

    const transformedOrder = {
      ...order.toObject(),
      _id: order._id.toString(),
      user: {
        _id: order.user._id.toString(),
        name: order.user.name,
        email: order.user.email
      },
      items: order.items.map(item => ({
        ...item,
        product: {
          ...item.product,
        
          _id: item.product._id.toString()
        }
      }))
    };

    return NextResponse.json(transformedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
} 