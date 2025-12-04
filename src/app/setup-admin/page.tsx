'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function SetupAdminPage() {
    const { data: session } = useSession();
    const [status, setStatus] = useState('');

    const handlePromote = async () => {
        setStatus('Promoting...');
        const res = await fetch('/api/setup-admin', { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
            setStatus('Success! You are now an ADMIN. Please log out and log back in.');
        } else {
            setStatus('Error: ' + data.error);
        }
    };

    if (!session) return <div className="p-10 text-white">Please log in first.</div>;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4">
            <h1 className="text-2xl font-bold">Admin Setup</h1>
            <p>Logged in as: {session.user?.email}</p>
            <button
                onClick={handlePromote}
                className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
            >
                Make Me Admin
            </button>
            <p className="mt-4 text-lg">{status}</p>
        </div>
    );
}
