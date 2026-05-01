import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from "@/app/generated/prisma";
import { auth } from '@/auth';

export async function GET(request: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // optional cursor for pagination, createdAt of the last post from previous page
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');

    // optional filter — global (default) or following (you + people you follow)
    const filter = searchParams.get('filter') ?? 'global';
    if (filter !== 'global' && filter !== 'following') {
        return NextResponse.json({ error: 'Invalid filter parameter' }, { status: 400 });
    }

    try {
        // build where clauses, combine cursor + filter when both apply
        const whereClauses: Prisma.PostWhereInput[] = [];
        if (cursor) {
            whereClauses.push({ createdAt: { lt: new Date(cursor) } });
        }
        if (filter === 'following') {
            // posts from users the current user follows, plus the user's own posts
            whereClauses.push({
                OR: [
                    { user: { followers: { some: { followerId: session.user.id } } } },
                    { userId: session.user.id }
                ]
            });
        }

        // fetch 11 posts (one extra to determine if more pages exist)
        const allPosts = await prisma.post.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            take: 11,
            ...(whereClauses.length > 0 ? { where: { AND: whereClauses } } : {}),
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

        // count follows on the first following-page only, used by empty state copy
        let followCount: number | undefined;
        if (filter === 'following' && !cursor) {
            followCount = await prisma.userFollow.count({
                where: { followerId: session.user.id }
            });
        }

        return NextResponse.json({ posts, hasMore, ...(followCount !== undefined ? { followCount } : {}) });
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
