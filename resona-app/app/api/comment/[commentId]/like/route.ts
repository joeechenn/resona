import { auth } from "@/auth";
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ commentId: string }> }) {
    const { commentId } = await params;
    const session = await auth();

    // check if user is authenticated
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // check if the comment exists
    try {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            select: { id: true },
        });

        if (!comment) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

    } catch (error) {
        console.error("Error toggling like:", error);
        return NextResponse.json({ error: "Failed to update like status" }, { status: 500 });
    }

    // toggle like status
    try {
        const existingLike = await prisma.commentLike.findUnique({
            where: {
                userId_commentId: {
                    userId: session.user.id,
                    commentId: commentId,

                },
            },
        });

        if (existingLike) {
            await prisma.commentLike.delete({
                where: {
                    userId_commentId: {
                        userId: session.user.id,
                        commentId: commentId,
                    },
                }
            });
        }

        else {
            await prisma.commentLike.create({
                data: {
                    userId: session.user.id,
                    commentId: commentId,
                },
            });
        }

        const likeCount = await prisma.commentLike.count({
            where: {
                commentId: commentId
            }
        })

        return NextResponse.json({ liked: !existingLike, likeCount })

    } catch (error) {
        console.error('Error toggling like:', error)
        return NextResponse.json({ error: "Failed to update like status" }, { status: 500 });
    }
}