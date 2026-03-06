import { auth } from "@/auth";
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const session = await auth();

    // check if user is authenticated
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // check if user is trying to follow themselves
    if (session.user.id === userId) {
        return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    // check if the profile exists
    try {
        const profile = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true },
        });

        if (!profile) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

    } catch (error) {
        console.error("Error toggling follow:", error);
        return NextResponse.json({ error: "Failed to update follow status" }, { status: 500 });
    }

    // toggle follow status
    try {
        const existingFollow = await prisma.userFollow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: session.user.id,
                    followingId: userId,
                },
            },
        });

        if (existingFollow) {
            await prisma.userFollow.delete({
                where: {
                    followerId_followingId: {
                        followerId: session.user.id,
                        followingId: userId,
                    },
                }
            });
        }

        else {
            await prisma.userFollow.create({
                data: {
                    followerId: session.user.id,
                    followingId: userId,
                },
            });
        }

        const followerCount = await prisma.userFollow.count({
            where: {
                followingId: userId,
            },
        });
        return NextResponse.json({ followed: !existingFollow, followerCount });
    } catch (error) {
        console.error("Error toggling follow:", error);
        return NextResponse.json({ error: "Failed to update follow status" }, { status: 500 });
    }
}