import { auth } from "@/auth";
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ postId: string }> }) {
    const { postId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    try {
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { id: true },
        });

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

    } catch (error) {
        console.error("Error toggling like:", error);
        return NextResponse.json({ error: "Failed to update like status" }, { status: 500 });
    }

    try {
        const existingLike = await prisma.postLike.findUnique({
            where: {
                userId_postId: {
                    userId: session.user.id,
                    postId: postId,

                },
            },
        });

        if (existingLike) {
            await prisma.postLike.delete({
                where: {
                    userId_postId: {
                        userId: session.user.id,
                        postId: postId,
                    },
                }
            });
        }

        else {
            await prisma.postLike.create({
                data: {
                    userId: session.user.id,
                    postId: postId,
                },
            });
        }

        const likeCount = await prisma.postLike.count({
            where: {
                postId: postId
            }
        })

        return NextResponse.json({ liked: !existingLike, likeCount })

    } catch (error) {
        console.error('Error toggling like:', error)
        return NextResponse.json({ error: "Failed to update like status" }, { status: 500 });
    }
}