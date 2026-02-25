import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from "@/app/generated/prisma";

export async function GET(request: Request) {
    try {

    // query the 20 most recent posts, including related user, track, album, and artist data for feed rendering
    const allPosts = await prisma.post.findMany({
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
                            artist: true
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
                    primaryArtist: true,
                    _count: {
                        select: {
                            tracks: true
                        }
                    }
                }
            },
            artist: true,
        },
        take: 20
    });

    // implicit 200 status because empty array is a valid response (no posts)
    return NextResponse.json(allPosts);
    } catch (error) {
        // log error server-side for debugging
        console.error('Error fetching feed:', error);
        // check if error is relaetd to database connection issue
        if (error instanceof Prisma.PrismaClientInitializationError) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 503 });
        }
        // return generic error for all other errors
        return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
    }
}