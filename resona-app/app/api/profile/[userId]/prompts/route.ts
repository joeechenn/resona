import { auth } from "@/auth";
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { PROFILE_PROMPTS, MAX_PROFILE_PROMPTS, getPromptType } from "@/lib/constants/profilePrompts";

// return user's prompts with attached entity data 
export async function GET(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;

    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const prompts = await prisma.userProfilePrompt.findMany({
            where: {
                userId
            },
            orderBy: {
                position: 'asc'
            },
            include: {
                track: {
                    include: {
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
                },
                album: {
                    include: {
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
                },
                artist: {
                    select: {
                        name: true,
                        imageUrl: true
                    }
                }
            }
        });

        return NextResponse.json(prompts);
    } catch (error) {
        console.error('Error fetching prompts:', error);
        return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
    }
}

// create or update a prompt 
export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;

    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // parse and validate body
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsedBody = body as { prompt?: unknown; entityType?: unknown; entityId?: unknown; position?: unknown };
    const prompt = typeof parsedBody.prompt === "string" ? parsedBody.prompt.trim() : "";
    const entityType = parsedBody.entityType;
    const entityId = typeof parsedBody.entityId === "string" ? parsedBody.entityId.trim() : "";
    const position = parsedBody.position;

    // validate prompt exists in allowlist and get its entity type
    const promptType = getPromptType(prompt);
    if (!promptType) {
        return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
    }

    if (entityType !== "track" && entityType !== "album" && entityType !== "artist") {
        return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
    }

    if (!entityId) {
        return NextResponse.json({ error: "Entity ID is required" }, { status: 400 });
    }

    if (position !== 0 && position !== 1 && position !== 2) {
        return NextResponse.json({ error: "Invalid position" }, { status: 400 });
    }

    // "any" type prompts accept all entity types, otherwise must match
    if (promptType !== "any" && promptType !== entityType) {
        return NextResponse.json({ error: "Entity type does not match prompt type" }, { status: 400 });
    }

    try {
        // verify the entity exists and the user has rated it
        if (entityType === "track") {
            const stat = await prisma.userTrackStat.findUnique({
                where: {
                    userId_trackId: {
                        userId,
                        trackId: entityId
                    }
                }
            });
            if (!stat?.rating) {
                return NextResponse.json({ error: "You haven't rated this track" }, { status: 400 });
            }
        } else if (entityType === "album") {
            const stat = await prisma.userAlbumStat.findUnique({
                where: {
                    userId_albumId: {
                        userId,
                        albumId: entityId
                    }
                }
            });
            if (!stat?.rating) {
                return NextResponse.json({ error: "You haven't rated this album" }, { status: 400 });
            }
        } else {
            const stat = await prisma.userArtistStat.findUnique({
                where: {
                    userId_artistId: {
                        userId,
                        artistId: entityId
                    }
                }
            });
            if (!stat?.rating) {
                return NextResponse.json({ error: "You haven't rated this artist" }, { status: 400 });
            }
        }

        // check if this prompt already exists (update) or is new (create)
        const existingPrompt = await prisma.userProfilePrompt.findUnique({
            where: {
                userId_prompt: {
                    userId,
                    prompt
                }
            }
        });

        if (!existingPrompt) {
            // new prompt, enforce max count
            const count = await prisma.userProfilePrompt.count({
                where: { userId }
            });
            if (count >= MAX_PROFILE_PROMPTS) {
                return NextResponse.json({ error: "Maximum 3 prompts allowed" }, { status: 400 });
            }

            // check position isn't already taken by a different prompt
            const positionTaken = await prisma.userProfilePrompt.findUnique({
                where: {
                    userId_position: {
                        userId,
                        position
                    }
                }
            });
            if (positionTaken) {
                return NextResponse.json({ error: "This position is already taken" }, { status: 400 });
            }
        }

        // set matching entity field, null out the other two
        const upsertedPrompt = await prisma.userProfilePrompt.upsert({
            where: {
                userId_prompt: {
                    userId,
                    prompt
                }
            },
            update: {
                position,
                trackId:  entityType === "track"  ? entityId : null,
                albumId:  entityType === "album"  ? entityId : null,
                artistId: entityType === "artist" ? entityId : null,
            },
            create: {
                userId,
                prompt,
                position,
                trackId:  entityType === "track"  ? entityId : null,
                albumId:  entityType === "album"  ? entityId : null,
                artistId: entityType === "artist" ? entityId : null,
            }
        });

        return NextResponse.json(upsertedPrompt);
    } catch (error) {
        console.error('Error saving prompt:', error);
        return NextResponse.json({ error: 'Failed to save prompt' }, { status: 500 });
    }
}

// remove a prompt 
export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;

    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsedBody = body as { promptId?: unknown };
    const promptId = typeof parsedBody.promptId === "string" ? parsedBody.promptId.trim() : "";

    if (!promptId) {
        return NextResponse.json({ error: "Prompt ID is required" }, { status: 400 });
    }

    try {
        // verify prompt exists and belongs to this user
        const existingPrompt = await prisma.userProfilePrompt.findUnique({
            where: {
                id: promptId
            }
        });

        if (!existingPrompt || existingPrompt.userId !== userId) {
            return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
        }

        await prisma.userProfilePrompt.delete({
            where: {
                id: promptId
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting prompt:', error);
        return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 });
    }
}
