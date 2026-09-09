"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Info,
} from "lucide-react";

import AppShell from "../AppShell/AppShell";
import { supabase } from "../lib/supabase";

import styles from "./sign-out.module.css";

export default function SignOutPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [isSigningOut, setIsSigningOut] =
    useState(false);

  /*
  ============================================================
  INITIAL PAGE LOADING
  ============================================================

  The page uses the same PropertySure AI loading screen
  used throughout the application.

  The loading screen is intentionally shown before the
  confirmation page appears.
  ============================================================
  */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /*
  ============================================================
  SIGN OUT
  ============================================================

  This is the ONLY place where the actual Supabase
  sign-out should happen.

  AppShell only navigates the user to /sign-out.
  ============================================================
  */

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      const { error } =
        await supabase.auth.signOut();

      if (error) {
        console.error(
          "Sign out error:",
          error
        );

        setIsSigningOut(false);

        return;
      }

      /*
      ========================================================
      REDIRECT TO SIGN IN
      ========================================================
      */

      window.location.replace(
        "/signin"
      );
    } catch (error) {
      console.error(
        "Sign out error:",
        error
      );

      setIsSigningOut(false);
    }
  };

  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  const goToActiveSessions = () => {
    if (isSigningOut) {
      return;
    }

    router.push(
      "/settings/security"
    );
  };

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loading) {
    return (
      <main
        className={
          styles.loadingPage
        }
      >
        <div
          className={
            styles.loadingBrand
          }
        >
          <span
            className={
              styles.loadingDiamond
            }
          />

          <span>
            PropertySure
            <strong> AI</strong>
          </span>
        </div>

        <div
          className={
            styles.loadingIndicator
          }
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
        </div>

        <p
          className={
            styles.loadingText
          }
        >
          Loading...
        </p>
      </main>
    );
  }

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <AppShell
      activePath="/sign-out"
      headerPath="/sign-out"
    >
      <div
        className={
          styles["signout-page"]
        }
      >

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <main
          className={
            styles["signout-main"]
          }
        >

          {/* =================================================
              PAGE HEADING
          ================================================= */}

          <div
            className={
              styles["signout-heading"]
            }
          >

            <h1>
              Sign Out
            </h1>

            <p>
              Sign out of your PropertySure AI
              account on this device.
            </p>

          </div>


          {/* =================================================
              SIGN OUT CARD
          ================================================= */}

          <section
            className={
              styles["signout-card"]
            }
          >

            <div
              className={
                styles["signout-card-icon"]
              }
            >
              <LogOut
                size={27}
                strokeWidth={2}
              />
            </div>


            <h2>
              Are you sure you want to sign out?
            </h2>


            <p
              className={
                styles[
                  "signout-card-description"
                ]
              }
            >
              You will be signed out of your
              account on this device.
              <br />
              Any unsaved changes may be lost.
            </p>


            {/* ==============================================
                ACTIONS
            ============================================== */}

            <div
              className={
                styles["signout-actions"]
              }
            >

              {/* SIGN OUT */}

              <button
                type="button"
                className={
                  styles["signout-button"]
                }
                onClick={
                  handleSignOut
                }
                disabled={
                  isSigningOut
                }
              >
                <LogOut
                  size={17}
                  strokeWidth={2.2}
                />

                <span>
                  {isSigningOut
                    ? "Signing Out..."
                    : "Sign Out"}
                </span>
              </button>


              {/* CANCEL */}

              <button
                type="button"
                className={
                  styles["cancel-button"]
                }
                onClick={() =>
                  router.back()
                }
                disabled={
                  isSigningOut
                }
              >
                Cancel
              </button>

            </div>

          </section>


          {/* =================================================
              ACTIVE SESSIONS NOTICE
          ================================================= */}

          <section
            className={
              styles["sessions-notice"]
            }
          >

            <div
              className={
                styles["sessions-icon"]
              }
            >
              <Info
                size={20}
                strokeWidth={2.2}
              />
            </div>


            <div
              className={
                styles["sessions-content"]
              }
            >

              <h3>
                Signed in on multiple devices?
              </h3>


              <p>
                You can manage your active
                sessions and sign out from other
                devices in the Active Sessions page.
              </p>


              <button
                type="button"
                className={
                  styles["sessions-link"]
                }
                onClick={
                  goToActiveSessions
                }
                disabled={
                  isSigningOut
                }
              >
                View Active Sessions

                <span>
                  ›
                </span>
              </button>

            </div>

          </section>

        </main>

      </div>
    </AppShell>
  );
}