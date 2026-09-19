"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabase";
import styles from "./landing.module.css";

export default function Home() {
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navigate = (path: string) => {
    closeMenu();
    router.push(path);
  };

  const handleVerifyProperty = async () => {
    if (isCheckingAuth) return;

    setIsCheckingAuth(true);
    closeMenu();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.push("/verify");
      } else {
        router.push("/signin");
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      router.push("/signin");
    } finally {
      setIsCheckingAuth(false);
    }
  };

  return (
    <main className={styles.page}>
      {/* =====================================================
          FULL-SCREEN VIDEO BACKGROUND
      ===================================================== */}
      <div className={styles.videoLayer} aria-hidden="true">
        <video
          className={styles.backgroundVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/videos/propertysure-hero-poster.jpg"
        >
          <source
            src="/videos/propertysure-hero.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Cinematic overlays */}
      <div className={styles.overlay} />
      <div className={styles.edgeGradient} />

      {/* =====================================================
          HEADER / NAVIGATION
      ===================================================== */}
      <header className={styles.header}>
        <div className={styles.navbar}>
          {/* PropertySure AI branding */}
          <button
            type="button"
            className={styles.brand}
            onClick={() => navigate("/")}
            aria-label="PropertySure AI home"
          >
            <span className={styles.brandLogo}>
              <span className={styles.brandDiamond} />
            </span>

            <span className={styles.brandName}>
              PropertySure <span>AI</span>
            </span>
          </button>

          {/* Desktop navigation */}
          <nav
            className={styles.desktopNav}
            aria-label="Main navigation"
          >
            <button
              type="button"
              className={`${styles.navLink} ${styles.activeNavLink}`}
              onClick={() => navigate("/")}
            >
              Home
            </button>

            <button
              type="button"
              className={styles.navLink}
              onClick={() => navigate("/verify")}
            >
              Verify
            </button>

            <button
              type="button"
              className={styles.navLink}
              onClick={() => navigate("/pricing")}
            >
              Pricing
            </button>

            <button
              type="button"
              className={styles.navLink}
              onClick={() => navigate("/about")}
            >
              About
            </button>

            <button
              type="button"
              className={styles.navLink}
              onClick={() => navigate("/contact")}
            >
              Contact
            </button>
          </nav>

          {/* Desktop actions */}
          <div className={styles.desktopActions}>
            <button
              type="button"
              className={styles.signInButton}
              onClick={() => navigate("/signin")}
            >
              Sign In
            </button>

            <button
              type="button"
              className={styles.getStartedButton}
              onClick={() => navigate("/signup")}
            >
              Get Started
              <span className={styles.buttonArrow}>→</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className={`${styles.menuButton} ${
              isMenuOpen ? styles.menuButtonOpen : ""
            }`}
            onClick={() => setIsMenuOpen((value) => !value)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* =====================================================
            MOBILE MENU
        ===================================================== */}
        {isMenuOpen && (
          <>
            <button
              type="button"
              className={styles.mobileBackdrop}
              onClick={closeMenu}
              aria-label="Close navigation"
            />

            <nav
              className={styles.mobileMenu}
              aria-label="Mobile navigation"
            >
              <div className={styles.mobileMenuLinks}>
                <button
                  type="button"
                  className={`${styles.mobileNavLink} ${styles.mobileActive}`}
                  onClick={() => navigate("/")}
                >
                  Home
                </button>

                <button
                  type="button"
                  className={styles.mobileNavLink}
                  onClick={() => navigate("/verify")}
                >
                  Verify
                </button>

                <button
                  type="button"
                  className={styles.mobileNavLink}
                  onClick={() => navigate("/pricing")}
                >
                  Pricing
                </button>

                <button
                  type="button"
                  className={styles.mobileNavLink}
                  onClick={() => navigate("/about")}
                >
                  About
                </button>

                <button
                  type="button"
                  className={styles.mobileNavLink}
                  onClick={() => navigate("/contact")}
                >
                  Contact
                </button>
              </div>

              <div className={styles.mobileDivider} />

              <div className={styles.mobileActions}>
                <button
                  type="button"
                  className={styles.mobileSignIn}
                  onClick={() => navigate("/signin")}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  className={styles.mobileGetStarted}
                  onClick={() => navigate("/signup")}
                >
                  Get Started
                  <span>→</span>
                </button>
              </div>
            </nav>
          </>
        )}
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>
            AI PROPERTY VERIFICATION
          </p>

          <h1 className={styles.title}>
            Verify Property
            <br />
            Documents Before You Invest.
          </h1>

          <p className={styles.description}>
            AI-powered property verification designed to help
            identify document risks before you make a payment.
          </p>

          <div className={styles.heroActions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleVerifyProperty}
              disabled={isCheckingAuth}
            >
              <span>
                {isCheckingAuth
                  ? "Checking..."
                  : "Verify Property"}
              </span>

              {!isCheckingAuth && (
                <span className={styles.primaryArrow}>→</span>
              )}
            </button>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => navigate("/about")}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          BOTTOM META
      ===================================================== */}
      <div className={styles.bottomMeta}>
        <span>AI-POWERED</span>
        <i />
        <span>PROPERTY VERIFICATION</span>
        <i />
        <span>BUILT FOR CONFIDENCE</span>
      </div>
    </main>
  );
}