import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const userCount = await prisma.user.count();
        return NextResponse.json({ status: 'success', userCount });
    } catch (error: any) {
        console.error("DB Connection Error:", error);
        return NextResponse.json({ status: 'error', message: error.message, stack: error.stack }, { status: 500 });
    }
}
