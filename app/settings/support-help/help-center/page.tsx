"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import styles from "./help-center.module.css";
import { supabase } from "../../../lib/supabase";

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
  | "search"
  | "home"
  | "shield"
  | "lock"
  | "document"
  | "creditCard"
  | "privacy"
  | "chevron"
  | "headset"
  | "warning"
  | "lightbulb"
  | "check"
  | "menu"
  | "close"
  | "arrow"
  | "user"
  | "logout";

function Icon({
  name,
  size = 18,
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
    ========================================================
    STANDARD PROPERTYSURE AI NOTIFICATION BELL
    ========================================================

    This is the same bell used on the Notifications page.
    ========================================================
    */
    bell: "🔔",

    search: "⌕",
    home: "⌂",
    shield: "♢",
    lock: "▣",
    document: "▤",
    creditCard: "▭",
    privacy: "♙",
    chevron: "›",
    headset: "♧",
    warning: "!",
    lightbulb: "♧",
    check: "✓",
    menu: "☰",
    close: "×",
    arrow: "→",
    user: "◯",
    logout: "↪",
  };

  return (
    <span
      className={`${styles.icon} ${className}`}
      style={{
        fontSize: `${size}px`,
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

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard" as IconName,
  },
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
HELP CATEGORIES
============================================================
*/

const categories = [
  {
    title: "Property Verification",

    description:
      "Learn how to verify properties and understand verification reports.",

    articles: "12 articles",

    icon: "home" as IconName,

    color: "blue",

    href:
      "/settings/support-help/help-center/property-verification",
  },

  {
    title: "Fraud Watch",

    description:
      "Understand fraud risk alerts, monitoring, and protecting yourself.",

    articles: "8 articles",

    icon: "shield" as IconName,

    color: "green",

    href:
      "/settings/support-help/help-center/fraud-watch",
  },

  {
    title: "Account & Security",

    description:
      "Manage your account, password, and security settings.",

    articles: "14 articles",

    icon: "lock" as IconName,

    color: "purple",

    href:
      "/settings/support-help/help-center/account-security",
  },

  {
    title: "Reports & History",

    description:
      "Generate, download, and understand your reports and verification history.",

    articles: "10 articles",

    icon: "document" as IconName,

    color: "yellow",

    href:
      "/settings/support-help/help-center/reports-history",
  },

  /*
  ==========================================================
  REPLACEMENT FOR ACCOUNT SETTINGS
  ==========================================================

  Account Settings was removed because the main Settings
  area already handles account preferences and settings.

  This category is now focused on helping a new user
  understand how to start using PropertySure AI.

  We are intentionally setting it to 7 articles.
  ==========================================================
  */

  {
    title: "Getting Started",

    description:
      "Learn the basics of PropertySure AI and how to get started.",

    articles: "7 articles",

    icon: "home" as IconName,

    color: "blue",

    href:
      "/settings/support-help/help-center/getting-started",
  },

  {
    title: "Payments & Subscriptions",

    description:
      "Manage your plan, billing, payments, and invoices.",

    articles: "9 articles",

    icon: "creditCard" as IconName,

    color: "pink",

    href:
      "/settings/support-help/help-center/payments",
  },

  {
    title: "Privacy & Data",

    description:
      "Learn how we protect your data and your privacy rights.",

    articles: "6 articles",

    icon: "privacy" as IconName,

    color: "cyan",

    href:
      "/settings/support-help/help-center/privacy-data",
  },
];


/*
============================================================
POPULAR ARTICLES
============================================================
*/

const popularArticles = [
  {
    title: "How do I verify a property?",

    href:
      "/settings/support-help/articles/how-to-verify-property",
  },

  {
    title: "How does Fraud Watch work?",

    href:
      "/settings/support-help/articles/how-fraud-watch-works",
  },

  {
    title:
      "How do I enable two-factor authentication?",

    href:
      "/settings/support-help/articles/enable-two-factor-authentication",
  },

  {
    title:
      "How do I update my account information?",

    href:
      "/settings/support-help/articles/update-account-information",
  },

  {
    title: "How do I export my data?",

    href:
      "/settings/support-help/articles/export-my-data",
  },
];


/*
============================================================
POPULAR SEARCHES
============================================================
*/

const popularSearches = [
  "verify property",
  "fraud watch",
  "2FA",
  "reports",
  "getting started",
];


/*
============================================================
ARTICLE ROW
============================================================
*/

function ArticleRow({
  title,
  href,
  onClick,
}: {
  title: string;
  href: string;
  onClick: (href: string) => void;
}) {
  return (
    <button
      type="button"
      className={styles.articleRow}
      onClick={() =>
        onClick(href)
      }
    >
      <span
        className={
          styles.articleIcon
        }
      >
        <Icon
          name="document"
          size={15}
        />
      </span>

      <span
        className={
          styles.articleTitle
        }
      >
        {title}
      </span>

      <span
        className={
          styles.articleChevron
        }
      >
        <Icon
          name="chevron"
          size={22}
        />
      </span>
    </button>
  );
}


/*
============================================================
CATEGORY CARD
============================================================
*/

function CategoryCard({
  title,
  description,
  articles,
  icon,
  color,
  href,
  onClick,
}: {
  title: string;
  description: string;
  articles: string;
  icon: IconName;
  color: string;
  href: string;
  onClick: (href: string) => void;
}) {
  return (
    <button
      type="button"
      className={
        styles.categoryCard
      }
      onClick={() =>
        onClick(href)
      }
    >
      <div
        className={`${styles.categoryIcon} ${styles[color]}`}
      >
        <Icon
          name={icon}
          size={24}
        />
      </div>

      <div
        className={
          styles.categoryTitle
        }
      >
        {title}
      </div>

      <div
        className={
          styles.categoryDescription
        }
      >
        {description}
      </div>

      <div
        className={
          styles.categoryFooter
        }
      >
        <span>
          {articles}
        </span>

        <Icon
          name="chevron"
          size={21}
        />
      </div>
    </button>
  );
}


/*
============================================================
HELP CENTER PAGE
============================================================
*/

export default function HelpCenterPage() {
  const router = useRouter();

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    user,
    setUser,
  ] = useState({
    fullName: "User",
    initial: "U",
    plan: "Free Plan",
  });


  /*
  ============================================================
  LOAD USER
  ============================================================
  */

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const {
          data: { user: authUser },
        } =
          await supabase.auth.getUser();

        if (!authUser) {
          router.replace("/signin");
          return;
        }

        if (!mounted) {
          return;
        }

        const metadata =
          authUser.user_metadata || {};

        const metadataName =
          metadata.full_name ||
          metadata.name ||
          metadata.display_name ||
          "";

        const email =
          authUser.email || "";

        const fallbackName = email
          ? email
              .split("@")[0]
              .replace(
                /[._-]+/g,
                " "
              )
              .replace(
                /\b\w/g,
                (letter: string) =>
                  letter.toUpperCase()
              )
          : "User";

        const fullName =
          String(metadataName).trim() ||
          fallbackName;

        const initial =
          fullName
            .trim()
            .charAt(0)
            .toUpperCase() ||
          "U";

        const plan =
          metadata.plan ||
          metadata.subscription_plan ||
          metadata.account_plan ||
          "Free Plan";

        setUser({
          fullName,
          initial,
          plan: String(plan),
        });
      } catch (error) {
        console.error(
          "Help Center user loading error:",
          error
        );
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

  const navigateTo = (
    href: string
  ) => {
    setMenuOpen(false);
    router.push(href);
  };


  /*
  ============================================================
  NOTIFICATIONS
  ============================================================
  */

  const openNotifications = () => {
    navigateTo(
      "/settings/notifications"
    );
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
  SIGN OUT
  ============================================================
  */

  const signOut = async () => {
    try {
      await supabase.auth.signOut();

      router.replace(
        "/signin"
      );
    } catch (error) {
      console.error(
        "Sign out error:",
        error
      );
    }
  };


  /*
  ============================================================
  SEARCH
  ============================================================
  */

  const filteredArticles =
    popularArticles.filter(
      (article) =>
        article.title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );


  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <main
      className={
        styles.page
      }
    >

      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside
        className={
          styles.sidebar
        }
      >
        <button
          type="button"
          className={
            styles.brandButton
          }
          onClick={() =>
            navigateTo(
              "/dashboard"
            )
          }
        >
          <div
            className={
              styles.brandName
            }
          >
            <span
              className={
                styles.brandLogoDiamond
              }
            >
              ◆
            </span>

            <span>
              PropertySure
              <strong>
                {" "}
                AI
              </strong>
            </span>
          </div>

          <div
            className={
              styles.brandSubtitle
            }
          >
            AI-Powered Property
            <br />
            Due Diligence
          </div>
        </button>


        <nav
          className={
            styles.sidebarNav
          }
        >
          {navItems.map(
            (item) => (
              <button
                key={
                  item.href
                }
                type="button"
                className={
                  styles.navItem
                }
                onClick={() =>
                  navigateTo(
                    item.href
                  )
                }
              >
                <span
                  className={
                    styles.navIcon
                  }
                >
                  <Icon
                    name={
                      item.icon
                    }
                    size={18}
                  />
                </span>

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
          className={
            styles.navItem
          }
          onClick={() =>
            navigateTo(
              "/account"
            )
          }
        >
          <span
            className={
              styles.navIcon
            }
          >
            <Icon
              name="account"
              size={18}
            />
          </span>

          <span>
            Account
          </span>
        </button>


        <button
          type="button"
          className={`${styles.navItem} ${styles.navActive}`}
          onClick={() =>
            navigateTo(
              "/settings"
            )
          }
        >
          <span
            className={
              styles.navIcon
            }
          >
            <Icon
              name="settings"
              size={18}
            />
          </span>

          <span>
            Settings
          </span>
        </button>


        <div
          className={
            styles.helpBox
          }
        >
          <div
            className={
              styles.helpTitle
            }
          >
            Need Help?
          </div>

          <div
            className={
              styles.helpText
            }
          >
            Our support team is
            ready to assist you.
          </div>

          <button
            type="button"
            className={
              styles.supportButton
            }
            onClick={() =>
              navigateTo(
                "/settings/support-help"
              )
            }
          >
            <Icon
              name="headset"
              size={15}
            />

            Contact Support
          </button>
        </div>


        <button
          type="button"
          className={
            styles.sidebarUser
          }
          onClick={() =>
            navigateTo(
              "/account"
            )
          }
        >
          <div
            className={
              styles.avatar
            }
          >
            {user.initial}
          </div>

          <div
            className={
              styles.userInfo
            }
          >
            <div
              className={
                styles.userName
              }
            >
              {user.fullName}
            </div>

            <div
              className={
                styles.userPlan
              }
            >
              {user.plan}
            </div>
          </div>

          <Icon
            name="chevron"
            size={21}
          />
        </button>
      </aside>


      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <header
        className={
          styles.mobileHeader
        }
      >
        <button
          type="button"
          className={
            styles.mobileMenuButton
          }
          onClick={() =>
            setMenuOpen(true)
          }
          aria-label="Open navigation"
        >
          <Icon
            name="menu"
            size={23}
          />
        </button>


        <button
          type="button"
          className={
            styles.mobileLogo
          }
          onClick={() =>
            navigateTo(
              "/dashboard"
            )
          }
        >
          <span>
            ◆
          </span>

          <span>
            PropertySure
            <strong>
              {" "}
              AI
            </strong>
          </span>
        </button>


        {/* ==================================================
            STANDARD MOBILE NOTIFICATION BELL
        ================================================== */}

        <button
          type="button"
          className={
            styles.mobileBell
          }
          onClick={
            openNotifications
          }
          aria-label="Notifications"
        >
          <Icon
            name="bell"
            size={20}
          />

          <span
            className={
              styles.notificationDot
            }
          />
        </button>
      </header>


      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      {menuOpen && (
        <div
          className={
            styles.mobileMenu
          }
        >
          <div
            className={
              styles.mobileMenuTop
            }
          >
            <div>
              <div
                className={
                  styles.mobileMenuBrand
                }
              >
                <span>
                  ◆
                </span>

                <span>
                  PropertySure
                  <strong>
                    {" "}
                    AI
                  </strong>
                </span>
              </div>

              <div
                className={
                  styles.mobileMenuSubtitle
                }
              >
                AI-Powered Property
                Due Diligence
              </div>
            </div>


            <button
              type="button"
              className={
                styles.closeButton
              }
              onClick={() =>
                setMenuOpen(
                  false
                )
              }
              aria-label="Close navigation"
            >
              <Icon
                name="close"
                size={28}
              />
            </button>
          </div>


          <nav
            className={
              styles.mobileMenuNav
            }
          >
            {navItems.map(
              (item) => (
                <button
                  key={
                    item.href
                  }
                  type="button"
                  className={
                    styles.mobileNavItem
                  }
                  onClick={() =>
                    navigateTo(
                      item.href
                    )
                  }
                >
                  <Icon
                    name={
                      item.icon
                    }
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
              styles.mobileAccountLabel
            }
          >
            ACCOUNT
          </div>


          <button
            type="button"
            className={
              styles.mobileNavItem
            }
            onClick={() =>
              navigateTo(
                "/account"
              )
            }
          >
            <Icon
              name="account"
              size={18}
            />

            <span>
              Account
            </span>
          </button>


          <button
            type="button"
            className={`${styles.mobileNavItem} ${styles.mobileActive}`}
            onClick={() =>
              navigateTo(
                "/settings"
              )
            }
          >
            <Icon
              name="settings"
              size={18}
            />

            <span>
              Settings
            </span>
          </button>


          <button
            type="button"
            className={`${styles.mobileNavItem} ${styles.mobileLogout}`}
            onClick={
              signOut
            }
          >
            <Icon
              name="logout"
              size={18}
            />

            <span>
              Sign Out
            </span>
          </button>
        </div>
      )}


      {/* =====================================================
          MAIN
      ===================================================== */}

      <section
        className={
          styles.main
        }
      >

        {/* ===================================================
            TOP BAR
        =================================================== */}

        <header
          className={
            styles.topBar
          }
        >
          <div
            className={
              styles.breadcrumbs
            }
          >
            <button
              type="button"
              onClick={() =>
                navigateTo(
                  "/settings"
                )
              }
            >
              Settings
            </button>

            <Icon
              name="chevron"
              size={17}
            />

            <button
              type="button"
              onClick={() =>
                navigateTo(
                  "/settings/support-help"
                )
              }
            >
              Support & Help
            </button>

            <Icon
              name="chevron"
              size={17}
            />

            <span>
              Help Center
            </span>
          </div>


          <div
            className={
              styles.topActions
            }
          >

            {/* =================================================
                STANDARD DESKTOP NOTIFICATION BELL
            ================================================= */}

            <button
              type="button"
              className={
                styles.topNotification
              }
              onClick={
                openNotifications
              }
              aria-label="Notifications"
            >
              <Icon
                name="bell"
                size={20}
              />

              <span
                className={
                  styles.topNotificationDot
                }
              />
            </button>


            <button
              type="button"
              className={
                styles.topAvatar
              }
              onClick={() =>
                navigateTo(
                  "/account"
                )
              }
            >
              {user.initial}
            </button>
          </div>
        </header>


        {/* ===================================================
            CONTENT
        =================================================== */}

        <div
          className={
            styles.content
          }
        >

          <div
            className={
              styles.contentHeader
            }
          >
            <h1>
              Help Center
            </h1>

            <p>
              Find answers, browse guides,
              and learn how to get the most
              out of PropertySure AI.
            </p>


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
              ‹ Back to Settings
            </button>
          </div>


          <div
            className={
              styles.layout
            }
          >

            {/* ===============================================
                LEFT / MAIN COLUMN
            =============================================== */}

            <div
              className={
                styles.primaryColumn
              }
            >

              {/* SEARCH */}

              <section
                className={
                  styles.searchCard
                }
              >
                <div
                  className={
                    styles.searchBox
                  }
                >
                  <Icon
                    name="search"
                    size={25}
                  />

                  <input
                    type="text"
                    value={
                      search
                    }
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event.target
                          .value
                      )
                    }
                    placeholder="Search for articles, guides, and topics..."
                    aria-label="Search Help Center"
                  />
                </div>


                <div
                  className={
                    styles.popularSearches
                  }
                >
                  <span>
                    Popular searches:
                  </span>

                  {popularSearches.map(
                    (item) => (
                      <button
                        type="button"
                        key={
                          item
                        }
                        onClick={() =>
                          setSearch(
                            item
                          )
                        }
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              </section>


              {/* CATEGORIES */}

              <section
                className={
                  styles.categorySection
                }
              >
                <h2>
                  Browse by Category
                </h2>

                <div
                  className={
                    styles.categoryGrid
                  }
                >
                  {categories.map(
                    (
                      category
                    ) => (
                      <CategoryCard
                        key={
                          category.title
                        }
                        {...category}
                        onClick={
                          navigateTo
                        }
                      />
                    )
                  )}
                </div>
              </section>
            </div>


            {/* ===============================================
                RIGHT COLUMN
            =============================================== */}

            <aside
              className={
                styles.rightColumn
              }
            >

              {/* POPULAR ARTICLES */}

              <section
                className={
                  styles.sideCard
                }
              >
                <div
                  className={
                    styles.sideCardHeader
                  }
                >
                  <h2>
                    Popular Articles
                  </h2>
                </div>


                <div
                  className={
                    styles.articleList
                  }
                >
                  {filteredArticles.length >
                  0 ? (
                    filteredArticles.map(
                      (
                        article
                      ) => (
                        <ArticleRow
                          key={
                            article.title
                          }
                          {...article}
                          onClick={
                            navigateTo
                          }
                        />
                      )
                    )
                  ) : (
                    <div
                      className={
                        styles.noResults
                      }
                    >
                      No matching articles
                      found.
                    </div>
                  )}
                </div>


                <button
                  type="button"
                  className={
                    styles.viewAll
                  }
                  onClick={() =>
                    navigateTo(
                      "/settings/support-help/articles"
                    )
                  }
                >
                  <span>
                    View all articles
                  </span>

                  <Icon
                    name="arrow"
                    size={17}
                  />
                </button>
              </section>


              {/* NEED MORE HELP */}

              <section
                className={
                  styles.sideCard
                }
              >
                <h2>
                  Need more help?
                </h2>

                <p
                  className={
                    styles.sideDescription
                  }
                >
                  Can't find what you're
                  looking for? Our support
                  team is here to help.
                </p>

                <button
                  type="button"
                  className={
                    styles.primarySupportButton
                  }
                  onClick={() =>
                    navigateTo(
                      "/settings/support-help/contact-support"
                    )
                  }
                >
                  <Icon
                    name="headset"
                    size={16}
                  />

                  Contact Support
                </button>

                <button
                  type="button"
                  className={
                    styles.secondarySupportButton
                  }
                  onClick={() =>
                    navigateTo(
                      "/settings/support-help/report-issue"
                    )
                  }
                >
                  <Icon
                    name="warning"
                    size={16}
                  />

                  Report an Issue
                </button>
              </section>


              {/* TIPS */}

              <section
                className={`${styles.sideCard} ${styles.tipsCard}`}
              >
                <div
                  className={
                    styles.tipsTitle
                  }
                >
                  <span
                    className={
                      styles.tipIcon
                    }
                  >
                    <Icon
                      name="lightbulb"
                      size={18}
                    />
                  </span>

                  <h2>
                    Help Center Tips
                  </h2>
                </div>


                <div
                  className={
                    styles.tipList
                  }
                >
                  <div>
                    <Icon
                      name="check"
                      size={14}
                    />

                    <span>
                      Use keywords for
                      faster results
                    </span>
                  </div>

                  <div>
                    <Icon
                      name="check"
                      size={14}
                    />

                    <span>
                      Check popular
                      articles first
                    </span>
                  </div>

                  <div>
                    <Icon
                      name="check"
                      size={14}
                    />

                    <span>
                      Browse by category
                    </span>
                  </div>

                  <div>
                    <Icon
                      name="check"
                      size={14}
                    />

                    <span>
                      Still need help?
                      Contact us
                    </span>
                  </div>
                </div>
              </section>

            </aside>
          </div>
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
            navigateTo(
              "/dashboard"
            )
          }
        >
          <Icon
            name="dashboard"
            size={20}
          />

          <span>
            Dashboard
          </span>
        </button>


        <button
          type="button"
          onClick={() =>
            navigateTo(
              "/verify"
            )
          }
        >
          <Icon
            name="verify"
            size={20}
          />

          <span>
            Verify
          </span>
        </button>


        <button
          type="button"
          onClick={() =>
            navigateTo(
              "/my-properties"
            )
          }
        >
          <Icon
            name="properties"
            size={20}
          />

          <span>
            Properties
          </span>
        </button>


        <button
          type="button"
          onClick={() =>
            navigateTo(
              "/reports"
            )
          }
        >
          <Icon
            name="reports"
            size={20}
          />

          <span>
            Reports
          </span>
        </button>


        <button
          type="button"
          className={
            styles.bottomActive
          }
          onClick={() =>
            navigateTo(
              "/account"
            )
          }
        >
          <Icon
            name="account"
            size={20}
          />

          <span>
            Account
          </span>
        </button>
      </nav>

    </main>
  );
}