import Link from 'next/link';

export default function AnalyticsPage() {
    return (
        <div className="flex-1 bg-neutral-800 rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Coming soon…
            </h2>
            <p className="text-neutral-400 text-sm md:text-base max-w-md leading-relaxed">
                If you&apos;re a little tech savvy and curious on where it&apos;s headed,{' '}
                <Link
                    href="https://github.com/joeechenn/resona-recommendation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-green-300 underline underline-offset-2"
                >
                    check the repo out
                </Link>
            </p>
        </div>
    );
}
