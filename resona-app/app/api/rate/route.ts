import { auth } from "@/auth";
import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { getTrack, getArtist, getAlbum } from "@/lib/spotify";

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsedBody = body as { type?: unknown; spotifyId?: unknown; rating?: unknown };

    const type = parsedBody.type;
    const spotifyId = typeof parsedBody.spotifyId === "string" ? parsedBody.spotifyId.trim() : "";
    const rating = parsedBody.rating;

    if (type !== "track" && type !== "artist" && type !== "album") {
        return NextResponse.json({ error: "Invalid ranking type" }, { status: 400 });
    }

    if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 0 || rating > 10) {
        return NextResponse.json({ error: "Rating must be an integer between 0 and 10" }, { status: 400 });
    }

    if (!spotifyId) {
        return NextResponse.json({ error: "Spotify ID is required" }, { status: 400 });
    }

    try {
        // handle track rating logic
        // check if spotify ID exists in the database
        // if it does, update the existing rating
        // if it doesn't, create a new rating entry
        if (type === "track") {
            let track = await prisma.track.findUnique({
                where: { spotifyId }
            });

            // create track in database if it doesn't exist
            if (!track) {
                const spotifyTrack = await getTrack(spotifyId);

                // check if track's album exists in the database
                // if it doesn't, create album with the fields needed for feed rendering (iamgeUrl and releaseDate)
                let album = await prisma.album.findUnique({
                    where: { spotifyId: spotifyTrack.album.id }
                })
                
                
                if (!album) {
                    try {
                        album = await prisma.album.create({
                            data: {
                                spotifyId: spotifyTrack.album.id,
                                name: spotifyTrack.album.name,
                                imageUrl: spotifyTrack.album.images[0]?.url || null,
                                releaseDate: spotifyTrack.album.release_date ? new Date(spotifyTrack.album.release_date) : null,
                            }
                        });
                        // if the album creation fails, try to find it again in case it was created by a concurrent request
                    } catch (error) {
                        album = await prisma.album.findUnique({
                            where: { spotifyId: spotifyTrack.album.id }
                        });
                        if (!album) {
                            throw new Error("Failed to create or load album");
                        }
                    }
                }

                // collect each track artist, ensuring every artist exists in the database
                // if an artist doesn't exist, create it before linking to the track
                const createdArtists = [];

                for (const spotifyArtist of spotifyTrack.artists) {
                    let artist = await prisma.artist.findUnique({
                        where: { spotifyId: spotifyArtist.id }
                    })
                    if (!artist) {
                        try {
                            artist = await prisma.artist.create({
                                data: {
                                    spotifyId: spotifyArtist.id,
                                    name: spotifyArtist.name,
                                }
                            });
                            // if the artist creation fails, try to find it again in case it was created by a concurrent request
                        } catch (error) {
                            artist = await prisma.artist.findUnique({
                                where: { spotifyId: spotifyArtist.id }
                            });
                            if (!artist) {
                                throw new Error("Failed to create or load artist");
                            }
                        }
                    }
                    createdArtists.push(artist)
                }

                // try-catch block to handle race condition where multiple requests try to create the same track at the same time
                try {
                    track = await prisma.track.create({
                        data: {
                            spotifyId: spotifyTrack.id,
                            name: spotifyTrack.name,
                            durationMs: spotifyTrack.duration_ms,
                            albumId: album.id
                        }
                    });
                    // if the track creation fails, try to find it again in case it was created by a concurrent request
                } catch (error) {
                    track = await prisma.track.findUnique({
                        where: { spotifyId: spotifyId }
                    });
                    if (!track) {
                        throw new Error("Failed to create or load track");
                    }
                }

                // link track to artists in the join table (trackArtist)
                for (const artist of createdArtists) {
                    try {
                        await prisma.trackArtist.create({
                            data: {
                                trackId: track.id,
                                artistId: artist.id
                            }
                        });
                    } catch (error) {
                        // if the track-artist relation creation fails, check if it already exists in case it was created by a concurrent request
                        const existingRelation = await prisma.trackArtist.findUnique({
                            where: {
                                trackId_artistId: {
                                    trackId: track.id,
                                    artistId: artist.id
                                }
                            }
                        });
                        if (!existingRelation) {
                            throw error;
                        }
                    }
                }

                // at this point, track, album, and all track artists are guaranteed to exist
                // trackArtist rows are now created (or confirmed to already exist from concurrent requests)
            }

            // track is guaranteed to exist at this point, so we can safely upsert the user rating
            await prisma.userTrackStat.upsert({
                where: { userId_trackId: { userId: session.user.id, trackId: track.id } },
                update: { rating: rating },
                create: { userId: session.user.id, trackId: track.id, rating: rating }
            });

            // create or update the user's post for this track to reflect the new rating 
            // if the user has already posted about this track, we update the rating in their post instead of creating a new post
            await prisma.post.upsert({
                where: { userId_trackId: { userId: session.user.id, trackId: track.id } },
                update: { rating: rating },
                create: { userId: session.user.id, trackId: track.id, rating: rating }
            })
        }

        // handle artist rating logic
        // check if spotify ID exists in the database
        // if it does, update the existing rating
        // if it doesn't, create a new rating entry
        else if (type === "artist") {
            let artist = await prisma.artist.findUnique({
                where: { spotifyId: spotifyId }
            })

            // create artist in database if it doesn't exist
            if (!artist) {
                const spotifyArtist = await getArtist(spotifyId);
                // try-catch block to handle race condition where multiple requests try to create the same artist at the same time
                try {
                    artist = await prisma.artist.create({
                        data: {
                            spotifyId: spotifyArtist.id,
                            name: spotifyArtist.name,
                        }
                    });
                    // if the artist creation fails, try to find it again in case it was created by a concurrent request
                } catch (error) {
                    artist = await prisma.artist.findUnique({
                        where: { spotifyId: spotifyId }
                    });
                    if (!artist) {
                        throw new Error("Failed to create or load artist");
                    }
                }
            }

            // artist is guaranteed to exist at this point, so we can safely upsert the user rating
            await prisma.userArtistStat.upsert({
                where: { userId_artistId: { userId: session.user.id, artistId: artist.id } },
                update: { rating: rating },
                create: { userId: session.user.id, artistId: artist.id, rating: rating }
            });

            // create or update the user's post for this artist to reflect the new rating 
            // if the user has already posted about this artist, we update the rating in their post instead of creating a new post
            await prisma.post.upsert({
                where: { userId_artistId: { userId: session.user.id, artistId: artist.id } },
                update: { rating: rating },
                create: { userId: session.user.id, artistId: artist.id, rating: rating }
            })
        }

        // handle album rating logic
        // check if spotify ID exists in the database
        // if it does, update the existing rating
        // if it doesn't, create a new rating entry
        else if (type === "album") {

            let album = await prisma.album.findUnique({
                where: { spotifyId: spotifyId }
            })

            // create album in database if it doesn't exist
            if (!album) {
                const spotifyAlbum = await getAlbum(spotifyId);
                // try-catch block to handle race condition where multiple requests try to create the same album at the same time
                try {
                    album = await prisma.album.create({
                        data: {
                            spotifyId: spotifyAlbum.id,
                            name: spotifyAlbum.name,
                            imageUrl: spotifyAlbum.images[0]?.url || null,
                            releaseDate: spotifyAlbum.release_date ? new Date(spotifyAlbum.release_date) : null,
                        }
                    });
                    // if the album creation fails, try to find it again in case it was created by a concurrent request
                } catch (error) {
                    album = await prisma.album.findUnique({
                        where: { spotifyId: spotifyId }
                    });
                    if (!album) {
                        throw new Error("Failed to create or load album");
                    }
                }
            }

            // album is guaranteed to exist at this point, so we can safely upsert the user rating
            await prisma.userAlbumStat.upsert({
                where: { userId_albumId: { userId: session.user.id, albumId: album.id } },
                update: { rating: rating },
                create: { userId: session.user.id, albumId: album.id, rating: rating }
            });

            // create or update the user's post for this album to reflect the new rating 
            // if the user has already posted about this album, we update the rating in their post instead of creating a new post
            await prisma.post.upsert({
                where: { userId_albumId: { userId: session.user.id, albumId: album.id } },
                update: { rating: rating },
                create: { userId: session.user.id, albumId: album.id, rating: rating }
            })
        }

        return NextResponse.json({ message: "Rating and post saved successfully" });

        // differentiate errors from Spotify API calls and database operations
    } catch (error) {
        if (error instanceof Error && error.message.includes("Failed to fetch")) {
            return NextResponse.json({ error: "Spotify entity not found" }, { status: 404 });
        }
        return NextResponse.json({ error: "Failed to save rating" }, { status: 500 });
    }
}
