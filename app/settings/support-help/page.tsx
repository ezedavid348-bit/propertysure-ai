"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import styles from "./support-help.module.css";
import { supabase } from "../../lib/supabase";

/*
============================================================
ICON SYSTEM
============================================================
*/

type IconName =
  | "dashboard"
  | "verify"
  | "properties"
  | "history"
  | "fraud"
  | "reports"
  | "account"
  | "settings"
  | "bell"
  | "general"
  | "security"
  | "notifications"
  | "appearance"
  | "language"
  | "privacy"
  | "help"
  | "logout"
  | "book"
  | "support"
  | "issue"
  | "feature"
  | "document"
  | "arrow"
  | "email"
  | "chat"
  | "phone"
  | "shield"
  | "menu";

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
    dashboard: "▦",
    verify: "⇧",
    properties: "⌂",
    history: "◷",
    fraud: "◈",
    reports: "▤",
    account: "◯",
    settings: "⚙",

    /*
     * PropertySure AI standard notification icon.
     * Its colour and sizing are controlled by CSS.
     */
    bell: "♧",

    general: "▦",
    security: "◇",
    notifications: "●",
    appearance: "◌",
    language: "◎",
    privacy: "▤",
    help: "?",
    logout: "↪",

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

    menu: "☰",
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
NAVIGATION
============================================================
*/

const primaryNavigation = [
  {
    label: "Verify Property",
    href: "/verify",
    icon: "verify" as IconName,
  },
  {
    label: "My Properties",
    href: "/my-properties",
    icon: "properties" as IconName,
  },
  {
    label: "Verification History",
    href: "/verification-history",
    icon: "history" as IconName,
  },
  {
    label: "Fraud Watch",
    href: "/fraud-watch",
    icon: "fraud" as IconName,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "reports" as IconName,
  },
];

/*
============================================================
POPULAR TOPICS
============================================================
*/

const popularTopics = [
  {
    title: "How do I verify a property?",
    href: "/settings/support-help/how-to-verify",
  },
  {
    title: "How does Fraud Watch work?",
    href: "/settings/support-help/fraud-watch",
  },
  {
    title: "How do I enable two-factor authentication?",
    href: "/settings/support-help/two-factor-authentication",
  },
  {
    title: "How do I update my account information?",
    href: "/settings/support-help/account-information",
  },
  {
    title: "How do I export my data?",
    href: "/settings/support-help/export-data",
  },
];

/*
============================================================
PAGE
============================================================
*/

export default function SupportHelpPage() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [loadingUser, setLoadingUser] =
    useState(true);

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
    setMenuOpen(false);
    router.push(path);
  };

  /*
  ============================================================
  STANDARD BACK BUTTON
  ============================================================
  */

  const backToSettings = () => {
    navigateTo("/settings");
  };

  /*
  ============================================================
  STANDARD NOTIFICATIONS
  ============================================================
  */

  const openNotifications = () => {
    navigateTo("/settings/notifications");
  };

  /*
  ============================================================
  SIGN OUT
  ============================================================
  */

  const signOut = async () => {
    try {
      await supabase.auth.signOut();

      router.replace("/signin");
    } catch (error) {
      console.error(
        "Sign out error:",
        error
      );
    }
  };

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loadingUser) {
    return (
      <main className={styles.loading}>
        <div
          className={styles.loadingBrand}
        >
          <span>◆</span>

          <div>
            PropertySure
            <strong> AI</strong>
          </div>
        </div>

        <div
          className={styles.loadingText}
        >
          Loading support...
        </div>
      </main>
    );
  }

  /*
  ============================================================
  PAGE
  ============================================================
  */

  return (
    <main className={styles.page}>
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className={styles.sidebar}>
        <button
          type="button"
          className={styles.brand}
          onClick={() =>
            navigateTo("/dashboard")
          }
        >
          <span
            className={styles.brandDiamond}
          >
            ◆
          </span>

          <span>
            PropertySure
            <strong> AI</strong>
          </span>
        </button>

        <nav
          className={styles.primaryNav}
        >
          {primaryNavigation.map(
            (item) => (
              <button
                key={item.href}
                type="button"
                className={styles.navItem}
                onClick={() =>
                  navigateTo(
                    item.href
                  )
                }
              >
                <Icon
                  name={item.icon}
                  size={18}
                />

                <span>
                  {item.label}
                </span>
              </button>
            )
          )}
        </nav>

        <div
          className={
            styles.accountLabel
          }
        >
          ACCOUNT
        </div>

        <button
          type="button"
          className={styles.navItem}
          onClick={() =>
            navigateTo("/account")
          }
        >
          <Icon
            name="account"
            size={18}
          />

          <span>Account</span>
        </button>

        <button
          type="button"
          className={`${styles.navItem} ${styles.settingsActive}`}
          onClick={() =>
            navigateTo("/settings")
          }
        >
          <Icon
            name="settings"
            size={18}
          />

          <span>Settings</span>
        </button>

        <div
          className={
            styles.sidebarHelp
          }
        >
          <strong>
            Need Help?
          </strong>

          <p>
            Our support team is ready
            to assist you.
          </p>

          <button
            type="button"
            onClick={() =>
              navigateTo(
                "/settings/support-help/contact"
              )
            }
          >
            <Icon
              name="support"
              size={16}
            />

            Contact Support
          </button>
        </div>

        <div
          className={styles.weather}
        >
          <span>☀</span>

          <div>
            <strong>
              77°F
            </strong>

            <small>
              Mostly clear
            </small>
          </div>
        </div>
      </aside>

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header
        className={styles.mobileHeader}
      >
        <button
          type="button"
          className={styles.mobileMenuButton}
          onClick={() =>
            setMenuOpen(true)
          }
          aria-label="Open menu"
        >
          <Icon
            name="menu"
            size={23}
          />
        </button>

        <button
          type="button"
          className={styles.mobileBrand}
          onClick={() =>
            navigateTo("/dashboard")
          }
        >
          <span>◆</span>

          <div>
            PropertySure
            <strong> AI</strong>
          </div>
        </button>

        {/* =================================================
            STANDARD MOBILE NOTIFICATION BELL
        ================================================= */}

        <button
          type="button"
          className={styles.topBell}
          onClick={openNotifications}
          aria-label="Notifications"
        >
          <Icon
            name="bell"
            size={20}
          />

          <span
            className={
              styles.topBellDot
            }
          />
        </button>
      </header>

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      {menuOpen && (
        <div
          className={styles.mobileMenu}
        >
          <div
            className={
              styles.mobileMenuTop
            }
          >
            <button
              type="button"
              onClick={() =>
                navigateTo(
                  "/dashboard"
                )
              }
            >
              ◆ PropertySure
              <strong> AI</strong>
            </button>

            <button
              type="button"
              className={
                styles.mobileClose
              }
              onClick={() =>
                setMenuOpen(false)
              }
            >
              ×
            </button>
          </div>

          {primaryNavigation.map(
            (item) => (
              <button
                key={item.href}
                type="button"
                className={
                  styles.mobileMenuItem
                }
                onClick={() =>
                  navigateTo(
                    item.href
                  )
                }
              >
                <Icon
                  name={item.icon}
                  size={18}
                />

                {item.label}
              </button>
            )
          )}

          <div
            className={
              styles.mobileMenuAccount
            }
          >
            ACCOUNT
          </div>

          <button
            type="button"
            className={
              styles.mobileMenuItem
            }
            onClick={() =>
              navigateTo("/account")
            }
          >
            <Icon
              name="account"
              size={18}
            />

            Account
          </button>

          <button
            type="button"
            className={`${styles.mobileMenuItem} ${styles.mobileMenuActive}`}
            onClick={() =>
              navigateTo("/settings")
            }
          >
            <Icon
              name="settings"
              size={18}
            />

            Settings
          </button>

          <button
            type="button"
            className={`${styles.mobileMenuItem} ${styles.mobileLogout}`}
            onClick={signOut}
          >
            <Icon
              name="logout"
              size={18}
            />

            Sign Out
          </button>
        </div>
      )}

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <section
        className={styles.main}
      >
        <div
          className={styles.mainInner}
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <header
            className={styles.pageHeader}
          >
            <h1>
              Support & Help
            </h1>

            <p>
              We're here to help.
              Find answers or get in
              touch with our support
              team.
            </p>

            {/* =================================================
                STANDARD BACK BUTTON
            ================================================= */}

            <button
              type="button"
              className={styles.backButton}
              onClick={backToSettings}
            >
              ‹ Back to Settings
            </button>
          </header>

          {/* =================================================
              HOW CAN WE HELP
          ================================================= */}

          <section
            className={styles.helpCard}
          >
            <h2>
              How can we help you?
            </h2>

            <div
              className={styles.helpGrid}
            >
              {/* =================================================
                  HELP CENTER
              ================================================= */}

              <button
                type="button"
                className={styles.helpOption}
                onClick={() =>
                  navigateTo(
                    "/settings/support-help/help-center"
                  )
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

                <strong>
                  Help Center
                </strong>

                <span>
                  Browse articles and
                  find solutions
                </span>
              </button>

              {/* =================================================
                  CONTACT SUPPORT
              ================================================= */}

              <button
                type="button"
                className={styles.helpOption}
                onClick={() =>
                  navigateTo(
                    "/settings/support-help/contact"
                  )
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

                <strong>
                  Contact Support
                </strong>

                <span>
                  Get help from our
                  support team
                </span>
              </button>

              {/* =================================================
                  REPORT ISSUE
              ================================================= */}

              <button
                type="button"
                className={styles.helpOption}
                onClick={() =>
                  navigateTo(
                    "/settings/support-help/report-issue"
                  )
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

                <strong>
                  Report an Issue
                </strong>

                <span>
                  Report a bug or
                  unexpected behavior
                </span>
              </button>

              {/* =================================================
                  FEATURE REQUEST
              ================================================= */}

              <button
                type="button"
                className={styles.helpOption}
                onClick={() =>
                  navigateTo(
                    "/settings/support-help/feature-request"
                  )
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

                <strong>
                  Feature Request
                </strong>

                <span>
                  Suggest features and
                  improvements
                </span>
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
                POPULAR TOPICS
            =============================================== */}

            <section
              className={styles.topicsCard}
            >
              <h2>
                Popular Topics
              </h2>

              <div
                className={styles.topicList}
              >
                {popularTopics.map(
                  (topic) => (
                    <button
                      key={topic.href}
                      type="button"
                      className={
                        styles.topicItem
                      }
                      onClick={() =>
                        navigateTo(
                          topic.href
                        )
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
                        {topic.title}
                      </span>

                      <Icon
                        name="arrow"
                        size={20}
                        className={
                          styles.topicArrow
                        }
                      />
                    </button>
                  )
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
                View all articles
              </button>
            </section>

            {/* ===============================================
                CONTACT INFORMATION
            =============================================== */}

            <section
              className={styles.contactCard}
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
                    "/settings/support-help/contact"
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

      {/* =====================================================
          MOBILE BOTTOM NAV
      ===================================================== */}

      <nav
        className={
          styles.mobileBottomNav
        }
      >
        <button
          type="button"
          onClick={() =>
            navigateTo("/dashboard")
          }
        >
          <Icon
            name="dashboard"
            size={19}
          />

          <span>
            Dashboard
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo("/verify")
          }
        >
          <Icon
            name="verify"
            size={19}
          />

          <span>
            Verify
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo("/my-properties")
          }
        >
          <Icon
            name="properties"
            size={19}
          />

          <span>
            Properties
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo("/reports")
          }
        >
          <Icon
            name="reports"
            size={19}
          />

          <span>
            Reports
          </span>
        </button>

        <button
          type="button"
          className={
            styles.activeBottom
          }
          onClick={() =>
            navigateTo("/settings")
          }
        >
          <Icon
            name="settings"
            size={19}
          />

          <span>
            Settings
          </span>
        </button>
      </nav>
    </main>
  );
}