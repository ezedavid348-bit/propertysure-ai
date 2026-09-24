"use client";

import { useRouter } from "next/navigation";
import styles from "./about.module.css";

export default function AboutPage() {
  const router = useRouter();

  const navigate = (path: string) => {
    router.push(path);
  };

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
            <span className={styles.brandDiamond}>◆</span>

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
            <span className={styles.backArrow}>←</span>
            <span>Back to Home</span>
          </button>
        </div>
      </div>

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              ABOUT PROPERTYSURE AI
            </p>

            <h1>
              Making property
              <br />
              decisions <span>clearer.</span>
            </h1>

            <p className={styles.heroDescription}>
              PropertySure AI is a technology platform built to
              help people understand property documents,
              property information, location signals and
              potential risks before they make a real estate
              decision.
            </p>

            <div className={styles.heroMeta}>
              <span>AI</span>
              <i />
              <span>PROPERTY VERIFICATION</span>
              <i />
              <span>DUE DILIGENCE</span>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.visualGlow} />

            <div className={styles.identityCard}>
              <div className={styles.identityTop}>
                <span>PROPERTYSURE AI</span>

                <span className={styles.identityStatus}>
                  ● SYSTEM
                </span>
              </div>

              <div className={styles.identityCore}>
                <span className={styles.identityDiamond}>
                  ◆
                </span>

                <strong>
                  PropertySure <em>AI</em>
                </strong>

                <p>
                  Property intelligence
                  <br />
                  before commitment.
                </p>
              </div>

              <div className={styles.identityBottom}>
                <span>DOCUMENTS</span>
                <span>PROPERTY</span>
                <span>LOCATION</span>
                <span>RISK</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          OUR PURPOSE
      ===================================================== */}
      <section className={styles.purposeSection}>
        <div className={styles.sectionLabel}>
          <span>01</span>
          OUR PURPOSE
        </div>

        <div className={styles.purposeContent}>
          <h2>
            Real estate decisions
            <br />
            should begin with
            <span> clarity.</span>
          </h2>

          <p>
            Property transactions can involve large amounts of
            money, complex documentation and information spread
            across different sources. PropertySure AI is being
            built to bring that information into a clearer
            verification experience.
          </p>

          <p>
            Instead of treating a property transaction as a
            simple document upload, PropertySure AI approaches
            verification as a broader due-diligence process.
            Documents, property information, location signals
            and identified risks can be considered together.
          </p>
        </div>
      </section>

      {/* =====================================================
          WHAT WE DO
      ===================================================== */}
      <section className={styles.whatSection}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>WHAT WE DO</p>

          <h2>
            One verification
            <br />
            experience. Multiple signals.
          </h2>

          <p>
            PropertySure AI is designed around the idea that
            property verification should not depend on a single
            document or a single signal.
          </p>
        </div>

        <div className={styles.signalGrid}>
          <article className={styles.signalCard}>
            <span className={styles.cardNumber}>01</span>

            <div className={styles.cardIcon}>▣</div>

            <h3>Documents</h3>

            <p>
              Analyze property documentation and surface
              information that may require further attention.
            </p>
          </article>

          <article className={styles.signalCard}>
            <span className={styles.cardNumber}>02</span>

            <div className={styles.cardIcon}>⌂</div>

            <h3>Property</h3>

            <p>
              Organize property identity and transaction
              information into a clearer verification context.
            </p>
          </article>

          <article className={styles.signalCard}>
            <span className={styles.cardNumber}>03</span>

            <div className={styles.cardIcon}>⌖</div>

            <h3>Location</h3>

            <p>
              Incorporate property location and GPS-related
              signals into the broader verification process.
            </p>
          </article>

          <article className={styles.signalCard}>
            <span className={styles.cardNumber}>04</span>

            <div className={styles.cardIcon}>◈</div>

            <h3>Risk</h3>

            <p>
              Bring potential inconsistencies, concerns and
              verification signals together for review.
            </p>
          </article>
        </div>
      </section>

      {/* =====================================================
          HOW WE THINK
      ===================================================== */}
      <section className={styles.principlesSection}>
        <div className={styles.principlesInner}>
          <div className={styles.principlesVisual}>
            <div className={styles.principlesFrame}>
              <div className={styles.frameHeader}>
                <span>VERIFICATION MODEL</span>
                <span>01 — 04</span>
              </div>

              <div className={styles.frameBody}>
                <div className={styles.frameNode}>
                  <span>01</span>
                  <strong>Documents</strong>
                </div>

                <div className={styles.frameConnector} />

                <div className={styles.frameNode}>
                  <span>02</span>
                  <strong>Property</strong>
                </div>

                <div className={styles.frameConnector} />

                <div className={styles.frameNode}>
                  <span>03</span>
                  <strong>Location</strong>
                </div>

                <div className={styles.frameConnector} />

                <div className={styles.frameNode}>
                  <span>04</span>
                  <strong>Risk</strong>
                </div>
              </div>

              <div className={styles.frameFooter}>
                <span>AI-ASSISTED ANALYSIS</span>
                <span>PROPERTY DUE DILIGENCE</span>
              </div>
            </div>
          </div>

          <div className={styles.principlesCopy}>
            <p className={styles.eyebrow}>HOW WE THINK</p>

            <h2>
              Verification is
              <br />
              more than a
              <span> document.</span>
            </h2>

            <p>
              A property can have several documents, different
              sources of information and location-specific
              considerations. Our approach is designed to help
              bring these signals together rather than treating
              them independently.
            </p>

            <p>
              PropertySure AI is designed to assist due diligence,
              not replace professional judgment. When deeper
              investigation is necessary, the platform can
              provide a clearer starting point for the people
              responsible for making the final decision.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHO IT IS FOR
      ===================================================== */}
      <section className={styles.peopleSection}>
        <div className={styles.peopleHeader}>
          <p className={styles.eyebrow}>BUILT FOR REAL PEOPLE</p>

          <h2>
            Designed around
            <br />
            real property decisions.
          </h2>
        </div>

        <div className={styles.peopleGrid}>
          <article>
            <span>01</span>

            <h3>Home Buyers</h3>

            <p>
              Understand property information more clearly
              before committing significant funds.
            </p>
          </article>

          <article>
            <span>02</span>

            <h3>Investors</h3>

            <p>
              Add a structured verification layer to property
              investment research and decision-making.
            </p>
          </article>

          <article>
            <span>03</span>

            <h3>Diaspora Buyers</h3>

            <p>
              Gain a clearer way to begin property due diligence
              when investing from outside the country.
            </p>
          </article>

          <article>
            <span>04</span>

            <h3>Professionals</h3>

            <p>
              Support property verification workflows with
              organized information and AI-assisted analysis.
            </p>
          </article>
        </div>
      </section>

      {/* =====================================================
          RESPONSIBLE TECHNOLOGY
      ===================================================== */}
      <section className={styles.responsibilitySection}>
        <div className={styles.responsibilityInner}>
          <div>
            <p className={styles.eyebrow}>
              RESPONSIBLE TECHNOLOGY
            </p>

            <h2>
              AI should help
              <br />
              people see
              <span> clearly.</span>
            </h2>
          </div>

          <div className={styles.responsibilityCopy}>
            <p>
              PropertySure AI is designed as a decision-support
              technology. Its role is to analyze information,
              identify signals and organize findings so that
              users can investigate them more effectively.
            </p>

            <p>
              A verification result should therefore be treated
              as part of due diligence rather than as a substitute
              for legal, surveying, engineering or government
              verification where those are required.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          VISION
      ===================================================== */}
      <section className={styles.visionSection}>
        <div className={styles.visionInner}>
          <div className={styles.visionCopy}>
            <p className={styles.eyebrow}>
              THE LONG-TERM VISION
            </p>

            <h2>
              Building a more
              <br />
              trusted property
              <span> ecosystem.</span>
            </h2>

            <p>
              PropertySure AI begins with property verification,
              but the larger vision is to build technology that
              makes important property information more
              transparent, structured and easier to understand.
            </p>

            <p>
              As the platform evolves, AI, location intelligence,
              blockchain-based verification and verifiable
              credentials can work together to create a stronger
              foundation for digital property due diligence.
            </p>
          </div>

          <div className={styles.visionCard}>
            <div className={styles.visionCardTop}>
              <span>PROPERTYSURE AI</span>
              <span>LONG-TERM ARCHITECTURE</span>
            </div>

            <div className={styles.visionLayers}>
              <div>
                <span>01</span>
                <strong>AI ANALYSIS</strong>
              </div>

              <div>
                <span>02</span>
                <strong>LOCATION INTELLIGENCE</strong>
              </div>

              <div>
                <span>03</span>
                <strong>VERIFIABLE RECORDS</strong>
              </div>

              <div>
                <span>04</span>
                <strong>TRUST INFRASTRUCTURE</strong>
              </div>
            </div>

            <div className={styles.visionCardBottom}>
              INFORMATION → VERIFICATION → CONFIDENCE
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <button
            type="button"
            className={styles.footerBrand}
            onClick={() => navigate("/")}
          >
            <span className={styles.footerDiamond}>◆</span>

            <span className={styles.footerBrandText}>
              PropertySure <strong>AI</strong>
            </span>
          </button>

          <nav
            className={styles.footerLinks}
            aria-label="Footer navigation"
          >
            <button onClick={() => navigate("/")}>
              Home
            </button>

            <button onClick={() => navigate("/verify")}>
              Verify
            </button>

            <button onClick={() => navigate("/pricing")}>
              Pricing
            </button>

            <button onClick={() => navigate("/about")}>
              About
            </button>

            <button onClick={() => navigate("/contact")}>
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