import React from 'react';
import styles from './Footer.module.css';
import uiText from '../data/ui-text.json';

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
            <div className={styles.socialLinks}>
              <a href={links.instagram} target="_blank" rel="noopener noreferrer">
                {footer.instagramLabel}
              </a>
              <a href={links.spotify} target="_blank" rel="noopener noreferrer">
                {footer.spotifyLabel}
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
