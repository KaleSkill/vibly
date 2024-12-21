import connectDB from "@/lib/db";
import { Color } from "@/models";
import { NextResponse } from "next/server";

export async function GET() {
    try {
      await connectDB();
      const colors = await Color.find().sort({ createdAt: -1 }).lean();
      return NextResponse.json(colors);
    } catch (error) {
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }