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
        console.error("Error commenting on post:", error);
        return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
    }

    let content: unknown;
    try {
        const body: unknown = await request.json();
        content = typeof body === "object" && body !== null ? (body as { content?: unknown }).content : undefined;
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return NextResponse.json({ error: "Comment content cannot be empty" }, { status: 400 });
    }

    try {
        const newComment = await prisma.comment.create({
            data: {
                postId: postId,
                userId: session.user.id,
                content: content.trim(),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    }
                },
                _count: {
                    select: {
                        likes: true,
                    }
                },
                likes: {
                    where: {
                        userId: session.user.id
                    }
                }
            }
        });

        return NextResponse.json({ newComment });
    }
    catch (error) {
        console.error("Error commenting on post:", error);
        return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
    }
}

export async function GET(request: Request, { params }: { params: Promise<{ postId: string }> }) {
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
        console.error("Error fetching comments:", error);
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }


    try {
        const allComments = await prisma.comment.findMany({
            orderBy: {
                createdAt: 'asc',
            },
            where: {
                postId: postId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    }
                },
                _count: {
                    select: {
                        likes: true,
                    }
                },
                likes: {
                    where: {
                        userId: session.user.id
                    }
                }
            }
        });

        return NextResponse.json({ comments: allComments });
    } catch (error) {
        console.error("Error fetching comments:", error);
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}
