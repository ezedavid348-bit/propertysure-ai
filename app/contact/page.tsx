"use client";

import { useRouter } from "next/navigation";
import styles from "./contact.module.css";

export default function ContactPage() {
  const router = useRouter();

  function navigate(path: string) {
    router.push(path);
  }

  return (
    <main className={styles.page}>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <button
            type="button"
            className={styles.brand}
            onClick={() => navigate("/")}
            aria-label="PropertySure AI home"
          >
            <span className={styles.brandDiamond}>
              ◆
            </span>

            <span className={styles.brandText}>
              PropertySure <strong>AI</strong>
            </span>
          </button>
        </div>
      </header>

      {/* =====================================================
          BACK TO HOME
      ===================================================== */}

      <div className={styles.backRow}>
        <div className={styles.backRowInner}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/")}
            aria-label="Back to PropertySure AI home"
          >
            <span className={styles.backArrow}>
              ←
            </span>

            <span>Back to Home</span>
          </button>
        </div>
      </div>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className={styles.content}>
        {/* HERO */}

        <section className={styles.hero}>
          <p className={styles.eyebrow}>
            GET IN TOUCH
          </p>

          <h1>
            Let’s talk about
            <br />
            <span>your property.</span>
          </h1>

          <p className={styles.heroText}>
            Whether you need support, have a business
            enquiry, want to discuss a partnership, or
            have questions about PropertySure AI, our
            team is here to help.
          </p>
        </section>

        {/* =================================================
            CONTACT GRID
        ================================================= */}

        <section className={styles.contactGrid}>
          {/* EMAIL */}

          <a
            href="mailto:support@propertysure.ai"
            className={styles.contactCard}
          >
            <div className={styles.cardIcon}>
              @
            </div>

            <div className={styles.cardContent}>
              <span className={styles.cardLabel}>
                EMAIL
              </span>

              <h2>
                support@propertysure.ai
              </h2>

              <p>
                Send us your enquiry and our team
                will get back to you.
              </p>

              <span className={styles.cardAction}>
                Send an email →
              </span>
            </div>
          </a>

          {/* PHONE */}

          <a
            href="tel:+2348065624091"
            className={styles.contactCard}
          >
            <div className={styles.cardIcon}>
              ☎
            </div>

            <div className={styles.cardContent}>
              <span className={styles.cardLabel}>
                PHONE
              </span>

              <h2>
                +234 806 562 4091
              </h2>

              <p>
                Contact us directly for support
                and business enquiries.
              </p>

              <span className={styles.cardAction}>
                Call PropertySure AI →
              </span>
            </div>
          </a>

          {/* BUSINESS HOURS */}

          <div className={styles.contactCard}>
            <div className={styles.cardIcon}>
              ◷
            </div>

            <div className={styles.cardContent}>
              <span className={styles.cardLabel}>
                BUSINESS HOURS
              </span>

              <h2>
                Monday – Friday
              </h2>

              <p>
                Our current business hours are
                9:00 AM – 5:00 PM.
              </p>

              <span className={styles.cardActionStatic}>
                9:00 AM – 5:00 PM
              </span>
            </div>
          </div>
        </section>

        {/* =================================================
            ADDRESS / ENQUIRY
        ================================================= */}

        <section className={styles.lowerGrid}>
          {/* BUSINESS ADDRESS */}

          <article className={styles.addressCard}>
            <div className={styles.sectionTop}>
              <div className={styles.sectionIcon}>
                ◇
              </div>

              <div>
                <span className={styles.cardLabel}>
                  BUSINESS ADDRESS
                </span>

                <h2>
                  Visit PropertySure AI
                </h2>
              </div>
            </div>

            <div className={styles.address}>
              <p>
                Shop 28/29, Block 16
                <br />
                Dutse P.E. Model Market
                <br />
                Kubwa, Abuja
                <br />
                Federal Capital Territory,
                Nigeria
              </p>
            </div>

            <div className={styles.temporaryNote}>
              <span>●</span>

              <p>
                Current business address. This
                information may change as our
                operations expand.
              </p>
            </div>
          </article>

          {/* BUSINESS ENQUIRIES */}

          <article className={styles.enquiryCard}>
            <span className={styles.cardLabel}>
              BUSINESS ENQUIRIES
            </span>

            <h2>
              Have something
              <br />
              <span>to discuss?</span>
            </h2>

            <p>
              For partnerships, investor enquiries,
              business opportunities, support, or
              other questions, reach us directly
              through our official email.
            </p>

            <a
              href="mailto:support@propertysure.ai"
              className={styles.primaryButton}
            >
              Email PropertySure AI
              <span>→</span>
            </a>
          </article>
        </section>

        {/* =================================================
            QUICK CONTACT STRIP
        ================================================= */}

        <section className={styles.quickStrip}>
          <div className={styles.quickItem}>
            <span>SUPPORT</span>

            <strong>
              support@propertysure.ai
            </strong>
          </div>

          <div className={styles.quickDivider} />

          <div className={styles.quickItem}>
            <span>PHONE</span>

            <strong>
              +234 806 562 4091
            </strong>
          </div>

          <div className={styles.quickDivider} />

          <div className={styles.quickItem}>
            <span>HOURS</span>

            <strong>
              Mon – Fri · 9:00 AM – 5:00 PM
            </strong>
          </div>
        </section>
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <button
            type="button"
            className={styles.footerBrand}
            onClick={() => navigate("/")}
            aria-label="PropertySure AI home"
          >
            <span className={styles.footerDiamond}>
              ◆
            </span>

            <span className={styles.footerBrandText}>
              PropertySure <strong>AI</strong>
            </span>
          </button>

          <nav
            className={styles.footerLinks}
            aria-label="Footer navigation"
          >
            <button
              type="button"
              onClick={() => navigate("/")}
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => navigate("/verify")}
            >
              Verify
            </button>

            <button
              type="button"
              onClick={() => navigate("/pricing")}
            >
              Pricing
            </button>

            <button
              type="button"
              onClick={() => navigate("/about")}
            >
              About
            </button>

            <button
              type="button"
              onClick={() => navigate("/contact")}
            >
              Contact
            </button>
          </nav>

          <span className={styles.footerCopy}>
            © {new Date().getFullYear()} PropertySure AI
          </span>
        </div>
      </footer>
    </main>
  );
}