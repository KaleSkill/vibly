import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Order from '@/models/order';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate({
        path: 'items.product',
        select: 'name price discountedPrice discountPercent variants'
      })
      .sort({ createdAt: -1 })
      .lean();

    // Transform MongoDB documents to plain objects with proper type conversion
   
    
    const transformedOrders = orders.map(order => ({
      ...order,
      _id: order._id.toString(),
      user: {
        _id: order.user?._id.toString(),
        name: order.user?.name || 'Anonymous',
        email: order.user?.email || ''
      },
      items: order.items.map(item => ({
        ...item,
        product: {
          ...item.product,
          color: item.variant.colorName,
          _id: item.product._id.toString()
        }
      })),
      createdAt: new Date(order.createdAt).toISOString()
    }));

    return NextResponse.json(transformedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 