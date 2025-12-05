import React from 'react';
import { Instagram } from 'lucide-react';
import styles from './Footer.module.css';
import uiText from '../data/ui-text.json';

const Spotify = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14.5c2.5-1 5.5-1 8 0" />
    <path d="M8 11.5c2.5-1 5.5-1 8 0" />
    <path d="M8 8.5c2.5-1 5.5-1 8 0" />
  </svg>
);

const Footer = () => {
  const { footer, links } = uiText;

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.content}>
          {/* About Section */}
          <div className={styles.section}>
            <h3>{footer.aboutTitle}</h3>
            <p>{footer.aboutText}</p>
          </div>

          {/* Contact Section */}
          <div className={styles.section}>
            <h3>{footer.contactTitle}</h3>
            <p>
              {footer.contactEmailLabel}: <a href={links.email}>{footer.contactEmailValue}</a>
            </p>
            <p>
              {footer.contactLocationLabel}: {footer.contactLocationValue}
            </p>
          </div>

          {/* Follow Section */}
          <div className={styles.section}>
            <h3>{footer.followTitle}</h3>
            <div className="flex gap-4">
              <a
                href={links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-3 rounded-full bg-white/5 text-neutral-400 hover:!bg-purple-600 hover:!text-white transition-all hover:scale-110 border border-white/5 hover:border-purple-500/50"
                aria-label={footer.instagramLabel}
              >
                <Instagram size={20} />
              </a>
              <a
                href={links.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-3 rounded-full bg-white/5 text-neutral-400 hover:!bg-[#1DB954] hover:!text-white transition-all hover:scale-110 border border-white/5 hover:border-[#1DB954]/50"
                aria-label={footer.spotifyLabel}
              >
                <Spotify className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.copyright}>
          {footer.copyright}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
