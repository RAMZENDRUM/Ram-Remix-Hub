import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <h2 className="text-4xl font-bold mb-4 text-white">404</h2>
            <p className="text-xl text-neutral-400 mb-8">This page could not be found.</p>
            <Link
                href="/"
                className="px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-neutral-200 transition-colors"
            >
                Return Home
            </Link>
        </div>
    );
}
