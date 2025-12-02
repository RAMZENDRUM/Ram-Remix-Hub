'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styles from './Hero.module.css';
import uiText from '../data/ui-text.json';

const Hero = () => {
    const { home } = uiText;

    return (
        <section className={styles.hero}>
            <div className={styles.orb} />

            <motion.h1
                className={styles.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {home.heroTitle}
            </motion.h1>

            <motion.p
                className={styles.subtitle}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
                {home.heroSubtitle}
            </motion.p>

            <motion.button
                className={styles.ctaButton}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                {home.listenNow}
            </motion.button>
        </section>
    );
};

export default Hero;
