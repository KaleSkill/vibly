import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Review from '@/models/review';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const reviews = await Review.find({ product: params.id })
      .populate('user', 'name email image')
      .sort({ createdAt: -1 })
      .lean();

    const safeReviews = reviews.map(review => ({
      ...review,
      user: {
        name: review.user?.name || 'Anonymous User',
        email: review.user?.email,
        image: review.user?.image || null
      }
    }));

    return NextResponse.json(safeReviews);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await req.json();
    await connectDB();

    const review = await Review.create({
      user: session.user.id,
      product: params.id,
      rating: data.rating,
      comment: data.comment
    });

    await review.populate('user', 'name email image');

    const safeReview = {
      ...review.toObject(),
      user: {
        name: review.user?.name || null,
        email: review.user?.email || null,
        image: review.user?.image || null
      }
    };

    return NextResponse.json(safeReview);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
} 