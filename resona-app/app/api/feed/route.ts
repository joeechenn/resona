import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from "@/app/generated/prisma";

export async function GET(request: Request) {
    try {
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
    return NextResponse.json(allPosts);
    } catch (error) {
        console.error('Error fetching feed:', error);
        if (error instanceof Prisma.PrismaClientInitializationError) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 503 });
        }
        return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
    }
}