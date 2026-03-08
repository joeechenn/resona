import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;

    // validate userId
    if (!userId || userId.trim().length === 0) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // fetch followers list for the user
    try {
        // validate user existence
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const followers = await prisma.userFollow.findMany({
            where: { followingId: userId },
            include: {
                follower: {
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

        return NextResponse.json({ followers: followers.map(f => f.follower) });
    } catch (error) {
        console.error('Error fetching followers list:', error);
        return NextResponse.json({ error: 'Failed to fetch followers list' }, { status: 500 });
    }
}