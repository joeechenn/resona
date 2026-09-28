import Image from 'next/image';
import type { LoginCover } from '@/lib/loginCovers';
import ScoreBadge from './ScoreBadge';

// 12 columns x 8 tiles fills screens up to ~2150px wide and ~1430px tall
const COLUMN_COUNT = 12;
const TILES_PER_COLUMN = 8;
// shifts each column's starting cover so neighbors don't line up
const COLUMN_OFFSET = 7;

export default function CoverColumns({ covers }: { covers: LoginCover[] }) {
    if (covers.length === 0) return null;

    const columns = Array.from({ length: COLUMN_COUNT }, (_, column) =>
        Array.from({ length: TILES_PER_COLUMN }, (_, row) =>
            covers[(column * COLUMN_OFFSET + row) % covers.length]
        )
    );

    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="cover-columns">
                {columns.map((column, columnIndex) => (
                    <div key={columnIndex} className="cover-column">
                        {/* tiles are doubled so the drift loops seamlessly */}
                        {[...column, ...column].map((cover, tileIndex) => (
                            <div key={tileIndex} className="cover-tile">
                                <Image
                                    src={cover.imageUrl}
                                    alt=""
                                    fill
                                    sizes="165px"
                                    loading="eager"
                                    className="object-cover"
                                />
                                <ScoreBadge
                                rating={cover.rating}
                                className="absolute right-2 bottom-2 h-8 w-8 bg-background/70 text-sm"
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="cover-columns-veil" />
        </div>
    );
}
