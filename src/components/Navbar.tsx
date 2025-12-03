'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Globe, User } from 'lucide-react';
import styles from './Navbar.module.css';
import uiText from '../data/ui-text.json';
import { useSession } from 'next-auth/react';
import SearchOverlay from './SearchOverlay';

const Navbar = () => {
    const pathname = usePathname();
    const { global } = uiText;
    const { data: session } = useSession();
    const user = session?.user;

    const isActive = (path: string) => pathname === path ? styles.active : '';
    const [isSearchOpen, setIsSearchOpen] = React.useState(false);

    // Simple admin check based on email
    const isAdmin = user?.email === 'ramzendrum@gmail.com';

    return (
        <>
            <nav className={styles.navbar}>
                <div className={styles.inner}>
                    <Link href="/" className={styles.brand}>
                        {global.appName}
                    </Link>

                    <div className={styles.navLinks}>
                        <Link href="/" className={`${styles.navLink} ${isActive('/')}`}>
                            Home
                        </Link>
                        <Link href="/releases" className={`${styles.navLink} ${isActive('/releases')}`}>
                            Releases
                        </Link>
                        <Link href="/playlists" className={`${styles.navLink} ${isActive('/playlists')}`}>
                            Playlists
                        </Link>
                        <Link href="/about" className={`${styles.navLink} ${isActive('/about')}`}>
                            About
                        </Link>
                        {isAdmin && (
                            <Link href="/admin" className={`${styles.navLink} ${isActive('/admin')}`}>
                                {global.admin}
                            </Link>
                        )}
                    </div>

                    <div className={styles.actions}>
                        <button
                            className={styles.iconButton}
                            aria-label="Search"
                            onClick={() => setIsSearchOpen(true)}
                        >
                            <Search size={20} />
                        </button>
                        <button className={styles.iconButton} aria-label={global.language}>
                            <Globe size={20} />
                        </button>

                        {user ? (
                            <Link href="/profile" className={styles.profileButton}>
                                {user.name?.substring(0, 2).toUpperCase() || 'U'}
                            </Link>
                        ) : (
                            <Link href="/auth" className={styles.iconButton} aria-label={global.signIn}>
                                <User size={20} />
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
            <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
};

export default Navbar;
