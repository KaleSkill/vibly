import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Product from '@/models/product';
import Category from '@/models/category';
import Color from '@/models/color';

export async function GET() {
  try {
    await connectDB();
    await Promise.all([
      import('@/models/category'),
      import('@/models/color')
    ]);
    
    const products = await Product.find()
      .populate('category')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    await connectDB();
    const data = await req.json();

    // Validate required fields
    if (!data.name || !data.price || !data.category || !data.variants?.length || !data.gender) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add empty specifications if not provided
    const productData = {
      ...data,
      specifications: data.specifications || {
        material: '',
        fit: '',
        occasion: '',
        pattern: '',
        washCare: '',
        style: '',
        neckType: '',
        sleeveType: '',
      },
      discountedPrice: data.discountPercent > 0 
        ? Math.round(data.price - (data.price * (data.discountPercent / 100)))
        : data.price,
      status: 'active'
    };

    const product = await Product.create(productData);
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
} 