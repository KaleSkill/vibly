import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Product from '@/models/product';

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find()
      .populate('category')
      .sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
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

    const data = await req.json();

    await connectDB();

    // Create new product
    const product = await Product.create({
      name: data.name,
      description: data.description,
      specifications: data.specifications,
      price: data.price,
      discountPercent: data.discountPercent || 0,
      gender: data.gender,
      category: data.category,
      variants: data.variants.map((variant: any) => ({
        color: variant.color,
        colorName: variant.colorName,
        images: variant.images,
        sizes: variant.sizes
      })),
      status: data.status || 'active',
      featured: data.featured || false
    });

    // Populate the category field
    const populatedProduct = await Product.findById(product._id).populate('category');

    return NextResponse.json(populatedProduct);
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
} 