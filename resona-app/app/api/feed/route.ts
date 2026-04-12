import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from "@/app/generated/prisma";
import { auth } from '@/auth';

export async function GET(request: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // optional cursor for pagination — createdAt of the last post from previous page
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');

    try {
        // fetch 11 posts (one extra to determine if more pages exist)
        // if cursor is provided, only fetch posts older than that timestamp
        const allPosts = await prisma.post.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            take: 11,
            ...(cursor ? { where: { createdAt: { lt: new Date(cursor) } } } : {}),
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                },
                track: {
                    include: {
                        artists: {
                            include: {
                                artist: {
                                    select: {
                                        id: true,
                                        name: true,
                                        spotifyId: true
                                    }
                                }
                            }
                        },
                        album: {
                            select: {
                                imageUrl: true,
                                name: true,
                                _count: {
                                    select: {
                                        tracks: true
                                    }
                                }
                            }
                        }
                    }
                },
                album: {
                    include: {
                        artists: {
                            include: {
                                artist: {
                                    select: {
                                        id: true,
                                        name: true,
                                        spotifyId: true
                                    }
                                }
                            }
                        }
                    }
                },
                artist: true,
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                },
                likes: {
                    where: {
                        userId: session.user.id
                    }
                }
            }
        });

        // if 11 results came back, more pages exist, slice to 10 before returning
        const hasMore = allPosts.length === 11;
        const posts = hasMore ? allPosts.slice(0, -1) : allPosts;

        return NextResponse.json({ posts, hasMore });
    } catch (error) {
        console.error('Error fetching feed:', error);

        if (error instanceof Prisma.PrismaClientInitializationError) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 503 });
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
    }
}
