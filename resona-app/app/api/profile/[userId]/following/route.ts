import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;

    // validate userId
    if (!userId || userId.trim().length === 0) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // fetch following list for the user
    try {
        // validate user existence
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const following = await prisma.userFollow.findMany({
            where: { followerId: userId },
            include: {
                following: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({ following: following.map(f => f.following) });
    } catch (error) {
        console.error('Error fetching following list:', error);
        return NextResponse.json({ error: 'Failed to fetch following list' }, { status: 500 });
    }
}