import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Sale from '@/models/sale';
import Product from '@/models/product';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, products, status } = await req.json();

    await connectDB();

    const sale = await Sale.findById(params.id);
    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    // Update sale details
    sale.name = name;
    sale.description = description;
    sale.products = products;
    sale.status = status;

    await sale.save();

    // Update products' sale status and prices
    if (status === 'active') {
      for (const item of products) {
        await Product.findByIdAndUpdate(item.product, {
          saleType: true,
          salePrice: item.salePrice,
          salePriceDiscount: item.discountPercent,
          discountedSalePrice: item.discountedPrice
        });
      }
    } else {
      // If sale is inactive, reset all products' sale status
      for (const item of products) {
        await Product.findByIdAndUpdate(item.product, {
          saleType: false,
          salePrice: 0,
          salePriceDiscount: 0,
          discountedSalePrice: 0
        });
      }
    }

    // Return populated sale
    const updatedSale = await Sale.findById(params.id)
      .populate({
        path: 'products.product',
        select: 'name price discountedPrice'
      });

    return NextResponse.json(updatedSale);
  } catch (error) {
    console.error('Error updating sale:', error);
    return NextResponse.json(
      { error: 'Failed to update sale' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const sale = await Sale.findById(params.id);
    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    // Reset all products' sale status before deleting
    for (const item of sale.products) {
      await Product.findByIdAndUpdate(item.product, {
        saleType: false,
        salePrice: 0,
        salePriceDiscount: 0,
        discountedSalePrice: 0
      });
    }

    await sale.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sale:', error);
    return NextResponse.json(
      { error: 'Failed to delete sale' },
      { status: 500 }
    );
  }
} 