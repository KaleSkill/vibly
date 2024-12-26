import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Color from '@/models/color';
import { Product } from '@/models';

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

    const products = await Product.find({ 'variants.color': params.id }).populate('variants.color').lean();
    for (const product of products) {
      for (const variant of product.variants) {
        if (variant.color._id.toString() === params.id) {
          await Product.findByIdAndUpdate(product._id, { $pull: { variants: { color: params.id } } });
          for (const image of variant.images) {
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

    const color = await Color.findByIdAndDelete(params.id);
    
    if (!color) {
      return NextResponse.json(
        { error: 'Color not found' },
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
    
    const color = await Color.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true }
    );
    
    if (!color) {
      return NextResponse.json(
        { error: 'Color not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(color);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 