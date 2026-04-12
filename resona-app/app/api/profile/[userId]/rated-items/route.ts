import { auth } from "@/auth";
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

// return user's rated items for the prompt picker 
export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;

    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // optional type filter from query string (?type=track|album|artist)
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    try {
        // initialize empty arrays, fill based on type filter (no type = all)
        let tracks: unknown[] = [];
        let albums: unknown[] = [];
        let artists: unknown[] = [];

        if (type === 'track' || !type) {
            tracks = await prisma.userTrackStat.findMany({
                where: {
                    userId,
                    rating: {
                        not: null
                    }
                },
                orderBy: {
                    rating: 'desc'
                },
                include: {
                    track: {
                        select: {
                            id: true,
                            name: true,
                            album: {
                                select: {
                                    imageUrl: true
                                }
                            },
                            artists: {
                                include: {
                                    artist: {
                                        select: {
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }

        if (type === 'album' || !type) {
            albums = await prisma.userAlbumStat.findMany({
                where: {
                    userId,
                    rating: {
                        not: null
                    }
                },
                orderBy: {
                    rating: 'desc'
                },
                include: {
                    album: {
                        select: {
                            id: true,
                            name: true,
                            imageUrl: true,
                            artists: {
                                include: {
                                    artist: {
                                        select: {
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }

        if (type === 'artist' || !type) {
            artists = await prisma.userArtistStat.findMany({
                where: {
                    userId,
                    rating: {
                        not: null
                    }
                },
                orderBy: {
                    rating: 'desc'
                },
                include: {
                    artist: {
                        select: {
                            id: true,
                            name: true,
                            imageUrl: true
                        }
                    }
                }
            });
        }

        return NextResponse.json({ tracks, albums, artists });
    } catch (error) {
        console.error('Error fetching rated items:', error);
        return NextResponse.json({ error: 'Failed to fetch rated items' }, { status: 500 });
    }
}
