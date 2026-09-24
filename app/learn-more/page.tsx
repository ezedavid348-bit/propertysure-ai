"use client";

import { useRouter } from "next/navigation";
import styles from "./learn-more.module.css";

export default function LearnMorePage() {
  const router = useRouter();

  const navigate = (path: string) => {
    router.push(path);
  };

  return (
    <main className={styles.page}>
      {/* =====================================================
          HEADER
          SAME PROPERTYSURE AI BRANDING AS APP SHELL
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
          BELOW HEADER — LEFT ALIGNED
      ===================================================== */}
      <div className={styles.backRow}>
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

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>
              UNDERSTANDING PROPERTY VERIFICATION
            </div>

            <h1>
              A clearer way to
              <br />
              <span>understand property.</span>
            </h1>

            <p className={styles.heroDescription}>
              PropertySure AI is designed to help buyers, investors,
              diaspora clients and property professionals examine
              property documents, property information and potential
              risk signals before important real estate decisions are made.
            </p>

            <div className={styles.heroMeta}>
              <span>DOCUMENTS</span>
              <i />
              <span>PROPERTY</span>
              <i />
              <span>LOCATION</span>
              <i />
              <span>RISK</span>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.visualGlow} />

            <div className={styles.systemCard}>
              <div className={styles.systemCardTop}>
                <div>
                  <span className={styles.cardEyebrow}>
                    PROPERTY VERIFICATION
                  </span>

                  <strong>Verification Intelligence</strong>
                </div>

                <span className={styles.liveIndicator}>
                  <i />
                  AI-ASSISTED
                </span>
              </div>

              <div className={styles.systemCore}>
                <div className={styles.coreCircle}>
                  <span>AI</span>
                  <strong>VERIFY</strong>
                </div>

                <div className={styles.coreLine} />

                <div className={styles.signalStack}>
                  <div>
                    <span>01</span>
                    <strong>Documents</strong>
                  </div>

                  <div>
                    <span>02</span>
                    <strong>Property</strong>
                  </div>

                  <div>
                    <span>03</span>
                    <strong>Location</strong>
                  </div>

                  <div>
                    <span>04</span>
                    <strong>Risk</strong>
                  </div>
                </div>
              </div>

              <div className={styles.systemFooter}>
                <span>Structured verification workflow</span>
                <span>01 — 04</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          INTRODUCTION
      ===================================================== */}
      <section className={styles.introduction}>
        <div className={styles.introLabel}>
          <span>01</span>
          THE PROBLEM
        </div>

        <div className={styles.introContent}>
          <h2>
            Property transactions involve
            <br />
            more than a single document.
          </h2>

          <p>
            A property decision can involve certificates, deeds, survey
            information, allocation documents, property details, location
            information and other supporting evidence.
          </p>

          <p>
            The challenge is not simply finding a document. It is
            understanding the information within the available documents
            and recognizing where additional attention may be required.
          </p>
        </div>
      </section>

      {/* =====================================================
          FOUR PILLARS
      ===================================================== */}
      <section className={styles.pillarsSection}>
        <div className={styles.sectionIntro}>
          <div className={styles.eyebrow}>
            THE PROPERTYSURE APPROACH
          </div>

          <h2>
            Bring the important pieces
            <br />
            into one verification experience.
          </h2>

          <p>
            PropertySure AI is designed around four connected areas of
            property verification.
          </p>
        </div>

        <div className={styles.pillarGrid}>
          <article className={styles.pillarCard}>
            <span className={styles.pillarNumber}>01</span>

            <div className={styles.pillarIcon}>▣</div>

            <h3>Documents</h3>

            <p>
              Examine information contained in submitted property
              documents and organize relevant details for review.
            </p>

            <span className={styles.pillarLine} />
          </article>

          <article className={styles.pillarCard}>
            <span className={styles.pillarNumber}>02</span>

            <div className={styles.pillarIcon}>⌂</div>

            <h3>Property</h3>

            <p>
              Bring important property information together so it can
              be considered alongside the submitted documentation.
            </p>

            <span className={styles.pillarLine} />
          </article>

          <article className={styles.pillarCard}>
            <span className={styles.pillarNumber}>03</span>

            <div className={styles.pillarIcon}>◎</div>

            <h3>Location</h3>

            <p>
              Where supported by the selected service, location signals
              can form part of the broader verification picture.
            </p>

            <span className={styles.pillarLine} />
          </article>

          <article className={styles.pillarCard}>
            <span className={styles.pillarNumber}>04</span>

            <div className={styles.pillarIcon}>△</div>

            <h3>Risk</h3>

            <p>
              Surface findings and signals that may deserve additional
              investigation before a transaction proceeds.
            </p>

            <span className={styles.pillarLine} />
          </article>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}
      <section className={styles.workflowSection}>
        <div className={styles.workflowHeader}>
          <div>
            <div className={styles.eyebrow}>HOW IT WORKS</div>

            <h2>
              From property documents
              <br />
              to structured insight.
            </h2>
          </div>

          <p>
            The platform is designed to turn a collection of property
            information into a clearer verification workflow.
          </p>
        </div>

        <div className={styles.workflow}>
          <div className={styles.workflowLine} />

          <div className={styles.workflowStep}>
            <div className={styles.workflowDot}>01</div>

            <div>
              <span>INPUT</span>
              <h3>Upload</h3>

              <p>
                Submit the property documents and information required
                for the selected verification service.
              </p>
            </div>
          </div>

          <div className={styles.workflowStep}>
            <div className={styles.workflowDot}>02</div>

            <div>
              <span>INTELLIGENCE</span>
              <h3>Analyze</h3>

              <p>
                AI-assisted processing examines available information
                and identifies relevant findings.
              </p>
            </div>
          </div>

          <div className={styles.workflowStep}>
            <div className={styles.workflowDot}>03</div>

            <div>
              <span>ASSESSMENT</span>
              <h3>Review</h3>

              <p>
                Relevant information and potential risk signals are
                organized for a structured review.
              </p>
            </div>
          </div>

          <div className={styles.workflowStep}>
            <div className={styles.workflowDot}>04</div>

            <div>
              <span>CLARITY</span>
              <h3>Understand</h3>

              <p>
                The resulting information helps users understand what
                was examined and what may require further attention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          VISUAL EXPLANATION
      ===================================================== */}
      <section className={styles.insightSection}>
        <div className={styles.insightVisual}>
          <div className={styles.insightWindow}>
            <div className={styles.windowTop}>
              <span>PROPERTY ANALYSIS</span>

              <div>
                <i />
                <i />
                <i />
              </div>
            </div>

            <div className={styles.analysisLayout}>
              <div className={styles.analysisMain}>
                <span>VERIFICATION LAYER</span>

                <h3>
                  Connecting property
                  <br />
                  information.
                </h3>

                <div className={styles.analysisGraph}>
                  <div className={styles.graphNode}>
                    <span>DOC</span>
                  </div>

                  <div className={styles.graphConnector} />

                  <div className={styles.graphNode}>
                    <span>AI</span>
                  </div>

                  <div className={styles.graphConnector} />

                  <div className={styles.graphNode}>
                    <span>RISK</span>
                  </div>
                </div>
              </div>

              <div className={styles.analysisSide}>
                <div>
                  <span>DOCUMENTS</span>
                  <strong>Analyzed</strong>
                </div>

                <div>
                  <span>PROPERTY</span>
                  <strong>Reviewed</strong>
                </div>

                <div>
                  <span>LOCATION</span>
                  <strong>Supported</strong>
                </div>

                <div>
                  <span>FINDINGS</span>
                  <strong>Structured</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.insightCopy}>
          <div className={styles.eyebrow}>
            FROM INFORMATION TO CLARITY
          </div>

          <h2>
            The goal is not simply
            <br />
            to process documents.
          </h2>

          <p>
            PropertySure AI is being designed to help users understand
            the information surrounding a property before making a
            significant decision.
          </p>

          <p>
            That means bringing relevant information together, organizing
            findings and making areas that require further investigation
            easier to identify.
          </p>
        </div>
      </section>

      {/* =====================================================
          AUDIENCE
      ===================================================== */}
      <section className={styles.audienceSection}>
        <div className={styles.sectionIntro}>
          <div className={styles.eyebrow}>
            DESIGNED FOR THE PROPERTY JOURNEY
          </div>

          <h2>
            One verification layer.
            <br />
            Multiple types of users.
          </h2>
        </div>

        <div className={styles.audienceGrid}>
          <article className={styles.audienceCard}>
            <span>01</span>
            <h3>Home Buyers</h3>

            <p>
              A clearer way to examine available property information
              before committing to a purchase.
            </p>
          </article>

          <article className={styles.audienceCard}>
            <span>02</span>
            <h3>Investors</h3>

            <p>
              A structured verification layer for evaluating property
              information before deploying capital.
            </p>
          </article>

          <article className={styles.audienceCard}>
            <span>03</span>
            <h3>Diaspora Buyers</h3>

            <p>
              Greater visibility into property information when making
              decisions from outside the property's location.
            </p>
          </article>

          <article className={styles.audienceCard}>
            <span>04</span>
            <h3>Property Professionals</h3>

            <p>
              A digital verification layer that can support property
              workflows and client due diligence.
            </p>
          </article>
        </div>
      </section>

      {/* =====================================================
          TRUST / DUE DILIGENCE
      ===================================================== */}
      <section className={styles.trustSection}>
        <div className={styles.trustHeader}>
          <div className={styles.eyebrow}>
            A RESPONSIBLE APPROACH
          </div>

          <h2>
            Verification is a layer of
            <br />
            due diligence — not a replacement for it.
          </h2>
        </div>

        <div className={styles.trustGrid}>
          <div className={styles.trustStatement}>
            <span>PROPERTYSURE AI</span>

            <p>
              AI-assisted verification can help identify information
              that deserves attention.
            </p>
          </div>

          <div className={styles.trustArrow}>+</div>

          <div className={styles.trustStatement}>
            <span>PROFESSIONAL DUE DILIGENCE</span>

            <p>
              Lawyers, surveyors, engineers, government searches and
              physical inspections may still be appropriate depending
              on the transaction.
            </p>
          </div>

          <div className={styles.trustArrow}>=</div>

          <div className={styles.trustStatement}>
            <span>BETTER-INFORMED DECISIONS</span>

            <p>
              A broader information base for people making important
              property decisions.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          LONG-TERM VISION
      ===================================================== */}
      <section className={styles.visionSection}>
        <div className={styles.visionInner}>
          <div className={styles.visionCopy}>
            <div className={styles.eyebrow}>
              THE LONG-TERM VISION
            </div>

            <h2>
              Building toward a more
              <br />
              trusted property ecosystem.
            </h2>

            <p>
              PropertySure AI is being built with a broader vision:
              create technology that makes property information easier
              to examine, understand and verify.
            </p>

            <p>
              The platform can evolve from document-focused verification
              into a wider digital trust infrastructure for property
              transactions and the people who depend on them.
            </p>
          </div>

          <div className={styles.visionArchitecture}>
            <div className={styles.architectureTop}>
              <span>PROPERTY TRUST LAYER</span>
              <i />
            </div>

            <div className={styles.architectureRows}>
              <div>
                <span>01</span>
                <strong>AI VERIFICATION</strong>
              </div>

              <div>
                <span>02</span>
                <strong>PROPERTY DATA</strong>
              </div>

              <div>
                <span>03</span>
                <strong>LOCATION SIGNALS</strong>
              </div>

              <div>
                <span>04</span>
                <strong>VERIFIABLE RECORDS</strong>
              </div>
            </div>

            <div className={styles.architectureBottom}>
              Designed as an evolving verification infrastructure
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL MESSAGE
      ===================================================== */}
      <section className={styles.finalSection}>
        <div className={styles.finalInner}>
          <div className={styles.eyebrow}>
            PROPERTYSURE AI
          </div>

          <h2>
            Before trust becomes a
            <br />
            transaction, it needs evidence.
          </h2>

          <p>
            PropertySure AI is designed to help people move from
            uncertainty toward a clearer understanding of the property
            information in front of them.
          </p>

          <div className={styles.finalMeta}>
            <span>AI-ASSISTED</span>
            <i />
            <span>PROPERTY VERIFICATION</span>
            <i />
            <span>BUILT FOR TRUST</span>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER / BOTTOM NAVIGATION
          SAME BRANDING FAMILY AS APP SHELL
      ===================================================== */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <button
            type="button"
            className={styles.footerBrand}
            onClick={() => navigate("/")}
            aria-label="PropertySure AI home"
          >
            <span className={styles.footerBrandDiamond}>
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