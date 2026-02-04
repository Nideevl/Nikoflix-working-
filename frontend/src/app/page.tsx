'use client'; // Add this at the top since useRouter is a client component hook

import { useRouter } from 'next/navigation'; // Note: 'next/navigation' not 'next/router'
import styles from './landing.module.css';
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter(); // Next.js equivalent of useNavigate

  return (
    <main className={styles.landing}>
      {/* Navbar */}
      <header className={styles.navbar}>
        <Link href="/browse" className="flex items-center pr-5">

          <Image
            src="/logo.svg"
            alt="NIKOFLIX"
            width={100}
            height={20}
            className="h-6 w-auto logo-img"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />

          <span className="logo-text text-red-600 text-2xl font-extrabold tracking-wide">
            NikoFlix
          </span>

        </Link>
        <nav>
          <button
            className={styles.btnOutline}
            onClick={() => router.push('/login')}
          >
            Sign In
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Unlimited Movies, Shows & More</h1>
          <p>Stream anywhere. Cancel anytime.</p>
          <button
            className={styles.btnPrimary}
            onClick={() => router.push('/browse')}
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <h2>🎥 Watch Anywhere</h2>
          <p>Enjoy movies and series on any device.</p>
        </div>
        <div className={styles.featureCard}>
          <h2>⚡ Fast Streaming</h2>
          <p>Powered by high-performance servers.</p>
        </div>
        <div className={styles.featureCard}>
          <h2>🤖 Smart Recommendations</h2>
          <p>AI-based content suggestions.</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <h2>Ready to watch?</h2>
        <button
          className={styles.btnPrimary}
          onClick={() => router.push('/browse')}
        >
          Join NikoFlix
        </button>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} NikoFlix. All rights reserved.</p>
      </footer>
    </main>
  );
}