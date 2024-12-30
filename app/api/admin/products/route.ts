import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Product from '@/models/product';
import Category from '@/models/category';
import mongoose from 'mongoose';

// Define types for queries
interface FilterQuery {
  status: string;
  'variants.color'?: { $in: string[] };
  discountedPrice?: {
    $gte: number;
    $lte?: number;
  };
  gender?: string;
  category?: mongoose.Types.ObjectId;
}

interface SortQuery {
  [key: string]: 1 | -1;
}

interface ProductVariant {
  color: string;
  images: string[];
  sizes: Array<{
    size: string;
    stock: number;
  }>;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get filter parameters
    const colors = searchParams.get('color')?.split(',') || [];
    const priceRange = searchParams.get('price')?.split('-') || [];
    const sortBy = searchParams.get('sort') || '';
    const gender = searchParams.get('gender');
    const category = searchParams.get('category');

    await connectDB();

    // Build filter query
    const filterQuery: FilterQuery = { status: 'active' };

    // Add color filter if colors are selected
    if (colors.length > 0) {
      filterQuery['variants.color'] = { $in: colors };
    }

    // Add category filter if specified
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        filterQuery.category = categoryDoc._id;
      }
    }

    // Add gender filter if specified
    if (gender) {
      filterQuery.gender = gender;
    }

    // Add price filter if price range is specified
    if (priceRange.length === 2) {
      const [min, max] = priceRange;
      filterQuery.discountedPrice = {
        $gte: Number(min) || 0,
        ...(max !== 'max' && { $lte: Number(max) })
      };
    }

    // Build sort query
    const sortQuery: SortQuery = {};
    switch (sortBy) {
      case 'price-low-high':
        sortQuery.discountedPrice = 1;
        break;
      case 'price-high-low':
        sortQuery.discountedPrice = -1;
        break;
      case 'name-a-z':
        sortQuery.name = 1;
        break;
      case 'name-z-a':
        sortQuery.name = -1;
        break;
      case 'newest':
        sortQuery.createdAt = -1;
        break;
      default:
        sortQuery.createdAt = -1;
    }

    const products = await Product.find(filterQuery)
      .populate('category')
      .populate('variants.color')
      .sort(sortQuery)
      .lean();

    return NextResponse.json(products);
  } catch (error: unknown) {
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
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const discount = ((data.price - data.discountedPrice) / data.price) * 100;

    await connectDB();

    // Create new product
    await Product.create({
      name: data.name,
      description: data.description,
      specifications: data.specifications,
      price: data.price,
      discountedPrice: data.discountedPrice,
      discountPercent: Math.round(discount),
      gender: data.gender,
      category: data.category,
      variants: data.variants.map((variant: ProductVariant) => ({
        color: variant.color,
        images: variant.images,
        sizes: variant.sizes
      })),
      status: data.status || 'active',
      featured: data.featured || false
    });

    return NextResponse.json({ message: 'Product created successfully' });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating product:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create product' },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
} 