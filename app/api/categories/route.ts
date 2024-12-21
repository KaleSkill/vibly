import connectDB from "@/lib/db";
import { Category } from "@/models";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectDB();
        const categories = await Category.find().sort({ createdAt: -1 }).lean();
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}