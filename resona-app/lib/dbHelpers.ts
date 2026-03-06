// helper function to find or create a record in the database, used for artists, albums, and tracks
export async function findOrCreate(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    model: any,
    spotifyId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createData: Record<string, any>,
    entityName: string
) {

    // try to find existing record
    let record = await model.findUnique({ where: { spotifyId } });

    // if record exists, return it
    if (record) return record;

    // if not found, try to create it
    try {
        record = await model.create({
            data: createData
        })
    } catch (_error) {
        // handle race condition where another request might have created the record after the initial findUnique check
        record = await model.findUnique({ 
            where: { spotifyId } 
        });

        if (!record) {
            throw new Error(`Failed to create or find ${entityName} with Spotify ID: ${spotifyId}`);
        }
    }

    return record;
}