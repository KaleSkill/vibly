import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Sale from '@/models/sale';
import Product from '@/models/product';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const sales = await Sale.find()
      .populate({
        path: 'products.product',
        select: 'name price discountedPrice'
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(sales);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch sales' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, products, startDate, endDate, status } = await req.json();

    // Validate required fields
    if (!name || !products?.length || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Create the sale with proper dates
    const sale = await Sale.create({
      name,
      description,
      products,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status || 'scheduled'
    });

    // Update products' sale status
    if (status === 'active') {
      for (const item of products) {
        await Product.findByIdAndUpdate(item.product, {
          saleType: true,
          salePrice: item.salePrice,
          salePriceDiscount: item.salePriceDiscount,
          discountedSalePrice: item.discountedSalePrice
        });
      }
    }

    const populatedSale = await Sale.findById(sale._id)
      .populate({
        path: 'products.product',
        select: 'name price discountedPrice'
      });

    return NextResponse.json(populatedSale);
  } catch (error: any) {
    console.error('Error creating sale:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create sale' },
      { status: 500 }
    );
  }
} 