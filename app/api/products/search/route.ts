import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/product';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json([]);
    }

    await connectDB();

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { 'category.name': { $regex: query, $options: 'i' } }
      ],
      status: 'active'
    })
    .populate('category')
    .populate('gender')
    .limit(5)
    .select('name price discountedPrice category gender variants')
    .lean();

    return NextResponse.json(products);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
} 