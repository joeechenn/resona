import { auth } from "@/auth";
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;

    // validate userId
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        return NextResponse.json({ error: "Profile content cannot be empty" }, { status: 400 });
    }

    const session = await auth();

    // check if user is authenticated
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // fetch user profile with posts, followers, and following counts
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                posts: {
                    orderBy: {
                        createdAt: 'desc',
                    },
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
                    },
                },
                _count: {
                    select: {
                        follows: true,
                        followers: true
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // fetch follow status and profile prompts in parallel
        const [existingFollow, profilePrompts] = await Promise.all([
            prisma.userFollow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: session.user.id,
                        followingId: userId,
                    }
                }
            }),
            prisma.userProfilePrompt.findMany({
                where: { userId },
                orderBy: { position: 'asc' },
                include: {
                    track: {
                        select: {
                            id: true,
                            spotifyId: true,
                            name: true,
                            album: { select: { imageUrl: true } },
                            artists: {
                                include: {
                                    artist: { select: { name: true } }
                                }
                            }
                        }
                    },
                    album: {
                        select: {
                            id: true,
                            spotifyId: true,
                            name: true,
                            imageUrl: true,
                            artists: {
                                include: {
                                    artist: { select: { name: true } }
                                }
                            }
                        }
                    },
                    artist: {
                        select: { id: true, spotifyId: true, name: true, imageUrl: true }
                    }
                }
            })
        ]);

        // enrich each prompt with the user's rating for that entity
        const enrichedPrompts = await Promise.all(
            profilePrompts.map(async (prompt) => {
                let rating: number | null = null;

                if (prompt.trackId) {
                    const stat = await prisma.userTrackStat.findUnique({
                        where: { userId_trackId: { userId, trackId: prompt.trackId } },
                        select: { rating: true }
                    });
                    rating = stat?.rating ?? null;
                } else if (prompt.albumId) {
                    const stat = await prisma.userAlbumStat.findUnique({
                        where: { userId_albumId: { userId, albumId: prompt.albumId } },
                        select: { rating: true }
                    });
                    rating = stat?.rating ?? null;
                } else if (prompt.artistId) {
                    const stat = await prisma.userArtistStat.findUnique({
                        where: { userId_artistId: { userId, artistId: prompt.artistId } },
                        select: { rating: true }
                    });
                    rating = stat?.rating ?? null;
                }

                return { ...prompt, rating };
            })
        );

        return NextResponse.json({
            user: {
                id: user.id,
                name: user.name,
                bio: user.bio,
                image: user.image,
                createdAt: user.createdAt,
                spotifyId: user.spotifyId,
            },
            followerCount: user._count.followers,
            followingCount: user._count.follows,
            isOwnProfile: session.user.id === userId,
            isFollowing: existingFollow !== null,
            posts: user.posts,
            profilePrompts: enrichedPrompts,
        });


    } catch (error) {
        // log error server-side for debugging
        console.error('Error fetching feed:', error);
        // check if error is relaetd to database connection issue
        if (error instanceof Prisma.PrismaClientInitializationError) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 503 });
        }
        // return generic error for all other errors
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}
