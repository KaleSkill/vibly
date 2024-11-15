import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/product';

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({ 
      featured: true,
      status: 'active'
    })
      .populate('category')
      .populate('gender')
      .limit(8)
      .lean();
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 