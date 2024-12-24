import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Category from '@/models/category';
import Product from '@/models/product';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const products = await Product.find({ category: params.id }).populate('variants.color').lean();
    for (const product of products) {
      for (const variant of product.variants) {
        if (variant.color) {
          await Product.findByIdAndUpdate(product._id, { $pull: { variants: { color: variant.color._id } } });
          for (const image of variant.images) {
            // Assuming there's a function to delete images from Cloudinary
            const response = await fetch('/api/admin/upload', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ publicId: image.split('/').pop().split('.')[0] })
            });
            if (!response.ok) {
              throw new Error('Failed to delete image from Cloudinary');
            }
            await Product.updateMany({}, { $pull: { 'variants.$[].images': image } });
          }
        }
      }
    }
    const category = await Category.findByIdAndDelete(params.id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    await connectDB();
    
    const category = await Category.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true }
    );
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 