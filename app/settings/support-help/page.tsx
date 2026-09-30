"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import AppShell from "../../AppShell/AppShell";
import LoadingScreen from "../../AppShell/LoadingScreen";
import styles from "./support-help.module.css";
import { supabase } from "../../lib/supabase";

/*
============================================================
ICON SYSTEM
============================================================
*/

type IconName =
  | "book"
  | "support"
  | "issue"
  | "feature"
  | "document"
  | "arrow"
  | "email"
  | "chat"
  | "phone"
  | "shield";

function Icon({
  name,
  size,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const icons: Record<IconName, string> = {
    book: "▤",
    support: "♧",
    issue: "!",
    feature: "♧",
    document: "▤",
    arrow: "›",
    email: "✉",
    chat: "▢",
    phone: "⌕",
    shield: "◇",
  };

  return (
    <span
      className={`${styles.icon} ${className}`}
      style={{
        fontSize: size
          ? `${size}px`
          : undefined,
      }}
      aria-hidden="true"
    >
      {icons[name]}
    </span>
  );
}

/*
============================================================
POPULAR QUESTIONS
============================================================
These are intentionally different from the full Help Center
article library. They are short, practical FAQ-style questions.
============================================================
*/

const popularQuestions = [
  {
    question:
      "What documents do I need to complete a property due diligence verification?",
    answer:
      "The required documents depend on the property and verification package. Common documents include the Certificate of Occupancy, Deed of Assignment, Survey Plan, Allocation Letter, and other relevant ownership or development documents.",
  },
  {
    question:
      "Do I need a subscription before I can verify a property?",
    answer:
      "You can review the available verification plans before starting. The plan you select determines the level of verification, checks, and report included for your property.",
  },
  {
    question:
      "Can I verify a property before making payment to the seller?",
    answer:
      "Yes. Property due diligence can be performed before you commit to a property purchase. The purpose is to help you identify ownership, documentation, and other relevant risks before proceeding.",
  },
  {
    question:
      "How long does a property verification normally take?",
    answer:
      "The time depends on the verification package, the property location, the documents provided, and any external searches required. Your dashboard will show the status of an active verification.",
  },
  {
    question:
      "Can I verify a Nigerian property if I am outside Nigeria?",
    answer:
      "Yes. PropertySure AI is designed to support remote property due diligence, allowing users outside Nigeria to submit property information and documents for verification without needing to be physically present.",
  },
];

/*
============================================================
PAGE
============================================================
*/

export default function SupportHelpPage() {
  const router = useRouter();

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [openQuestion, setOpenQuestion] =
    useState<number | null>(null);

  /*
  ============================================================
  LOAD USER
  ============================================================
  */

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        setLoadingUser(true);

        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error(
            "Could not load authenticated user:",
            error
          );

          return;
        }

        if (!authUser) {
          router.replace("/signin");
          return;
        }
      } catch (error) {
        console.error(
          "Support page user loading error:",
          error
        );
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, [router]);

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  const navigateTo = (path: string) => {
    router.push(path);
  };

  /*
  ============================================================
  BACK TO SETTINGS
  ============================================================
  */

  const backToSettings = () => {
    router.push("/settings");
  };

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loadingUser) {
    return <LoadingScreen />;
  }

  /*
  ============================================================
  PAGE
  ============================================================
  */

  return (
    <AppShell
      activePath="/settings"
      headerPath="/settings"
    >
      <main className={styles.page}>
        <section className={styles.main}>
          <div className={styles.mainInner}>
            {/* =================================================
                HEADER
            ================================================= */}

            <header
              className={styles.pageHeader}
            >
              <div>
                <div
                  className={
                    styles.eyebrow
                  }
                >
                  SUPPORT CENTER
                </div>

                <h1>
                  Support & Help
                </h1>

                <p>
                  We're here to help.
                  Find answers or get in
                  touch with our support
                  team.
                </p>
              </div>

              {/* =================================================
                  STANDARD BACK BUTTON
              ================================================= */}

              <button
                type="button"
                className={
                  styles.backButton
                }
                onClick={
                  backToSettings
                }
              >
                <span
                  className={
                    styles.backArrow
                  }
                  aria-hidden="true"
                >
                  ←
                </span>

                <span>
                  Back to Settings
                </span>
              </button>
            </header>

            {/* =================================================
                HOW CAN WE HELP
            ================================================= */}

            <section
              className={styles.helpCard}
            >
              <div
                className={
                  styles.sectionHeading
                }
              >
                <div>
                  <span
                    className={
                      styles.sectionEyebrow
                    }
                  >
                    SUPPORT OPTIONS
                  </span>

                  <h2>
                    How can we help you?
                  </h2>

                  <p>
                    Choose an option below
                    to get the assistance
                    you need.
                  </p>
                </div>
              </div>

              <div
                className={styles.helpGrid}
              >
                {/* =================================================
                    HELP CENTER
                ================================================= */}

                <button
                  type="button"
                  className={
                    styles.helpOption
                  }
                  onClick={() =>
                    navigateTo(
                      "/settings/support-help/help-center"
                    )
                  }
                >
                  <div
                    className={
                      styles.helpOptionTop
                    }
                  >
                    <div
                      className={`${styles.helpIcon} ${styles.blue}`}
                    >
                      <Icon
                        name="book"
                        size={25}
                      />
                    </div>

                    <span
                      className={
                        styles.cardArrow
                      }
                    >
                      →
                    </span>
                  </div>

                  <div
                    className={
                      styles.helpOptionBody
                    }
                  >
                    <strong>
                      Help Center
                    </strong>

                    <span>
                      Browse our knowledge
                      base and find
                      answers to common
                      questions.
                    </span>
                  </div>

                  <div
                    className={
                      styles.cardAction
                    }
                  >
                    Explore Help Center
                  </div>
                </button>

                {/* =================================================
                    CONTACT SUPPORT
                ================================================= */}

                <button
                  type="button"
                  className={
                    styles.helpOption
                  }
                  onClick={() =>
                    navigateTo(
                      "/settings/support-help/contact-support"
                    )
                  }
                >
                  <div
                    className={
                      styles.helpOptionTop
                    }
                  >
                    <div
                      className={`${styles.helpIcon} ${styles.green}`}
                    >
                      <Icon
                        name="support"
                        size={25}
                      />
                    </div>

                    <span
                      className={
                        styles.cardArrow
                      }
                    >
                      →
                    </span>
                  </div>

                  <div
                    className={
                      styles.helpOptionBody
                    }
                  >
                    <strong>
                      Contact Support
                    </strong>

                    <span>
                      Get direct assistance
                      from the PropertySure
                      support team.
                    </span>
                  </div>

                  <div
                    className={
                      styles.cardAction
                    }
                  >
                    Contact Our Team
                  </div>
                </button>

                {/* =================================================
                    REPORT ISSUE
                ================================================= */}

                <button
                  type="button"
                  className={
                    styles.helpOption
                  }
                  onClick={() =>
                    navigateTo(
                      "/settings/support-help/report-issue"
                    )
                  }
                >
                  <div
                    className={
                      styles.helpOptionTop
                    }
                  >
                    <div
                      className={`${styles.helpIcon} ${styles.yellow}`}
                    >
                      <Icon
                        name="issue"
                        size={25}
                      />
                    </div>

                    <span
                      className={
                        styles.cardArrow
                      }
                    >
                      →
                    </span>
                  </div>

                  <div
                    className={
                      styles.helpOptionBody
                    }
                  >
                    <strong>
                      Report an Issue
                    </strong>

                    <span>
                      Tell us about a bug,
                      technical problem, or
                      unexpected behavior.
                    </span>
                  </div>

                  <div
                    className={
                      styles.cardAction
                    }
                  >
                    Report a Problem
                  </div>
                </button>

                {/* =================================================
                    FEATURE REQUEST
                ================================================= */}

                <button
                  type="button"
                  className={
                    styles.helpOption
                  }
                  onClick={() =>
                    navigateTo(
                      "/settings/support-help/feature-request"
                    )
                  }
                >
                  <div
                    className={
                      styles.helpOptionTop
                    }
                  >
                    <div
                      className={`${styles.helpIcon} ${styles.purple}`}
                    >
                      <Icon
                        name="feature"
                        size={25}
                      />
                    </div>

                    <span
                      className={
                        styles.cardArrow
                      }
                    >
                      →
                    </span>
                  </div>

                  <div
                    className={
                      styles.helpOptionBody
                    }
                  >
                    <strong>
                      Feature Requests
                    </strong>

                    <span>
                      Suggest a new feature
                      or improvement for
                      PropertySure AI.
                    </span>
                  </div>

                  <div
                    className={
                      styles.cardAction
                    }
                  >
                    Suggest a Feature
                  </div>
                </button>
              </div>
            </section>

            {/* =================================================
                LOWER GRID
            ================================================= */}

            <div
              className={styles.lowerGrid}
            >
              {/* ===============================================
                  POPULAR QUESTIONS
              =============================================== */}

              <section
                className={
                  styles.topicsCard
                }
              >
                <div
                  className={
                    styles.cardHeader
                  }
                >
                  <div>
                    <span
                      className={
                        styles.sectionEyebrow
                      }
                    >
                      QUICK ANSWERS
                    </span>

                    <h2>
                      Popular Questions
                    </h2>

                    <p>
                      Answers to some of the
                      questions users ask most
                      often.
                    </p>
                  </div>
                </div>

                <div
                  className={
                    styles.topicList
                  }
                >
                  {popularQuestions.map(
                    (
                      question,
                      index
                    ) => {
                      const isOpen =
                        openQuestion ===
                        index;

                      return (
                        <div
                          key={
                            question.question
                          }
                          className={
                            styles.topicItemWrap
                          }
                        >
                          <button
                            type="button"
                            className={`${styles.topicItem} ${
                              isOpen
                                ? styles.topicItemOpen
                                : ""
                            }`}
                            onClick={() =>
                              setOpenQuestion(
                                isOpen
                                  ? null
                                  : index
                              )
                            }
                            aria-expanded={
                              isOpen
                            }
                          >
                            <span
                              className={
                                styles.topicIcon
                              }
                            >
                              <Icon
                                name="document"
                                size={14}
                              />
                            </span>

                            <span
                              className={
                                styles.topicTitle
                              }
                            >
                              {
                                question.question
                              }
                            </span>

                            <span
                              className={
                                styles.topicToggle
                              }
                            >
                              {isOpen
                                ? "−"
                                : "+"}
                            </span>
                          </button>

                          {isOpen && (
                            <div
                              className={
                                styles.topicAnswer
                              }
                            >
                              {
                                question.answer
                              }
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>

                <button
                  type="button"
                  className={
                    styles.viewArticles
                  }
                  onClick={() =>
                    navigateTo(
                      "/settings/support-help/help-center"
                    )
                  }
                >
                  Browse the full Help Center
                  <span>→</span>
                </button>
              </section>

              {/* ===============================================
                  CONTACT INFORMATION
              =============================================== */}

              <section
                className={
                  styles.contactCard
                }
              >
                <h2>
                  Contact Information
                </h2>

                <div
                  className={
                    styles.contactItem
                  }
                >
                  <div
                    className={`${styles.contactIcon} ${styles.blue}`}
                  >
                    <Icon
                      name="email"
                      size={18}
                    />
                  </div>

                  <div>
                    <strong>
                      Email Support
                    </strong>

                    <span>
                      Contact our support
                      team through your
                      registered account.
                    </span>

                    <small>
                      We typically reply
                      within 24 hours.
                    </small>
                  </div>
                </div>

                <div
                  className={
                    styles.contactItem
                  }
                >
                  <div
                    className={`${styles.contactIcon} ${styles.blue}`}
                  >
                    <Icon
                      name="chat"
                      size={18}
                    />
                  </div>

                  <div>
                    <strong>
                      Live Chat
                    </strong>

                    <span>
                      Get assistance directly
                      from our support team.
                    </span>

                    <small>
                      Availability will be
                      shown when live chat is
                      enabled.
                    </small>
                  </div>
                </div>

                <div
                  className={
                    styles.contactItem
                  }
                >
                  <div
                    className={`${styles.contactIcon} ${styles.blue}`}
                  >
                    <Icon
                      name="phone"
                      size={18}
                    />
                  </div>

                  <div>
                    <strong>
                      Phone Support
                    </strong>

                    <span>
                      Phone support will be
                      available for eligible
                      customers.
                    </span>

                    <small>
                      Support hours will be
                      displayed here.
                    </small>
                  </div>
                </div>

                <button
                  type="button"
                  className={
                    styles.chatButton
                  }
                  onClick={() =>
                    navigateTo(
                      "/settings/support-help/contact-support"
                    )
                  }
                >
                  <Icon
                    name="chat"
                    size={16}
                  />

                  Start Live Chat
                </button>
              </section>
            </div>

            {/* =================================================
                SATISFACTION BANNER
            ================================================= */}

            <section
              className={
                styles.satisfaction
              }
            >
              <div
                className={
                  styles.satisfactionIcon
                }
              >
                <Icon
                  name="shield"
                  size={25}
                />
              </div>

              <div>
                <strong>
                  Your satisfaction is our
                  priority
                </strong>

                <p>
                  We're committed to
                  providing fast, friendly,
                  and effective support.
                </p>
              </div>
            </section>
          </div>
        </section>
      </main>
    </AppShell>
  );
}