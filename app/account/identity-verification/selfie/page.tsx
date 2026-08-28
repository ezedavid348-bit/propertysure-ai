"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

/* ============================================================
   TYPES
============================================================ */

type IconName =
  | "dashboard"
  | "verify"
  | "properties"
  | "reports"
  | "account"
  | "settings"
  | "bell"
  | "menu"
  | "arrow"
  | "camera"
  | "sun"
  | "glasses"
  | "face"
  | "phone"
  | "lock"
  | "check";

/* ============================================================
   ICON
============================================================ */

function Icon({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
  const icons: Record<IconName, string> = {
    dashboard: "▦",
    verify: "⇧",
    properties: "⌂",
    reports: "▤",
    account: "◯",
    settings: "⚙",
    bell: "🔔",
    menu: "☰",
    arrow: "←",
    camera: "◎",
    sun: "☀",
    glasses: "◉",
    face: "♙",
    phone: "▯",
    lock: "♧",
    check: "✓",
  };

  return (
    <span
      className={styles.icon}
      style={{
        fontSize: `${size}px`,
      }}
      aria-hidden="true"
    >
      {icons[name]}
    </span>
  );
}

/* ============================================================
   NAVIGATION
============================================================ */

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
    label: "Reports",
    href: "/reports",
    icon: "reports" as IconName,
  },
];

/* ============================================================
   MAIN PAGE
============================================================ */

export default function SelfieVerificationPage() {
  const router = useRouter();

  /* ----------------------------------------------------------
     NAVIGATION
  ---------------------------------------------------------- */

  const [menuOpen, setMenuOpen] = useState(false);

  /* ----------------------------------------------------------
     CAMERA REFERENCES
  ---------------------------------------------------------- */

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /* ----------------------------------------------------------
     CAMERA STATE
  ---------------------------------------------------------- */

  const [cameraActive, setCameraActive] = useState(false);
  const [capturedSelfie, setCapturedSelfie] =
    useState<string | null>(null);

  const [cameraError, setCameraError] = useState("");
  const [startingCamera, setStartingCamera] = useState(false);

  /* ----------------------------------------------------------
     LOAD PREVIOUSLY CAPTURED SELFIE
  ---------------------------------------------------------- */

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const storedSelfie = sessionStorage.getItem(
        "propertysure_kyc_selfie_data"
      );

      if (storedSelfie) {
        setCapturedSelfie(storedSelfie);
      }
    } catch {
      // Ignore sessionStorage errors.
    }
  }, []);

  /* ----------------------------------------------------------
     STOP CAMERA
  ---------------------------------------------------------- */

  const stopCamera = () => {
    const stream = streamRef.current;

    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    const video = videoRef.current;

    if (video) {
      video.pause();
      video.srcObject = null;
    }

    setCameraActive(false);
  };

  /* ----------------------------------------------------------
     CLEAN UP CAMERA
  ---------------------------------------------------------- */

  useEffect(() => {
    return () => {
      const stream = streamRef.current;

      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      }

      streamRef.current = null;

      const video = videoRef.current;

      if (video) {
        video.pause();
        video.srcObject = null;
      }
    };
  }, []);

  /* ----------------------------------------------------------
     NAVIGATION
  ---------------------------------------------------------- */

  const navigateTo = (path: string) => {
    setMenuOpen(false);
    router.push(path);
  };

  /* ----------------------------------------------------------
     START CAMERA
     
     IMPORTANT:
     The camera is only started after the user presses the
     "Take Selfie" button.
     
     This is safer for iPhone/Safari and prevents the camera
     from unexpectedly taking over the page.
  ---------------------------------------------------------- */

  const startCamera = async () => {
    if (startingCamera) {
      return;
    }

    setCameraError("");
    setStartingCamera(true);

    try {
      if (
        typeof window === "undefined" ||
        typeof navigator === "undefined"
      ) {
        throw new Error("BROWSER_UNAVAILABLE");
      }

      if (
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== "function"
      ) {
        throw new Error("CAMERA_UNSUPPORTED");
      }

      /*
       * Make absolutely sure an old stream is not still active.
       */
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });

        streamRef.current = null;
      }

      /*
       * Use the front-facing camera.
       *
       * We deliberately avoid forcing an exact 720x720 camera
       * resolution because some iPhone/Safari combinations
       * behave badly when an exact resolution is requested.
       */
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: {
              ideal: "user",
            },
            width: {
              ideal: 640,
            },
            height: {
              ideal: 640,
            },
          },
        });

      streamRef.current = stream;

      const video = videoRef.current;

      if (!video) {
        stream.getTracks().forEach((track) => {
          track.stop();
        });

        streamRef.current = null;

        throw new Error("VIDEO_ELEMENT_UNAVAILABLE");
      }

      /*
       * iPhone/Safari compatibility.
       */
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");

      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;

      video.srcObject = stream;

      /*
       * Wait until Safari knows the dimensions of the camera
       * stream before showing the camera state.
       */
      await new Promise<void>((resolve) => {
        if (
          video.readyState >= 2 &&
          video.videoWidth > 0 &&
          video.videoHeight > 0
        ) {
          resolve();
          return;
        }

        const handleLoadedMetadata = () => {
          video.removeEventListener(
            "loadedmetadata",
            handleLoadedMetadata
          );

          resolve();
        };

        video.addEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
      });

      try {
        await video.play();
      } catch {
        /*
         * If Safari refuses the first play attempt, try once
         * again after the stream has been attached.
         */
        try {
          video.muted = true;
          video.playsInline = true;
          await video.play();
        } catch {
          throw new Error("VIDEO_PLAY_FAILED");
        }
      }

      setCapturedSelfie(null);
      setCameraActive(true);
    } catch (error) {
      /*
       * Make sure no partially-created camera stream remains.
       */
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });

        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }

      setCameraActive(false);

      const errorCode =
        error instanceof Error
          ? error.message
          : "";

      if (errorCode === "CAMERA_UNSUPPORTED") {
        setCameraError(
          "Camera access is not supported on this device or browser."
        );
      } else if (
        errorCode === "VIDEO_ELEMENT_UNAVAILABLE"
      ) {
        setCameraError(
          "The camera could not be opened. Please refresh the page and try again."
        );
      } else if (
        errorCode === "VIDEO_PLAY_FAILED"
      ) {
        setCameraError(
          "The camera could not start. Please tap Take Selfie again."
        );
      } else {
        setCameraError(
          "Camera access was denied or unavailable. Please allow camera permission and try again."
        );
      }
    } finally {
      setStartingCamera(false);
    }
  };

  /* ----------------------------------------------------------
     CAPTURE SELFIE
  ---------------------------------------------------------- */

  const captureSelfie = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setCameraError(
        "The camera is not ready yet. Please try again."
      );

      return;
    }

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setCameraError(
        "The camera is not ready yet. Please wait a moment and try again."
      );

      return;
    }

    const size = Math.min(
      video.videoWidth,
      video.videoHeight
    );

    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError(
        "Unable to capture the selfie. Please try again."
      );

      return;
    }

    const sourceX =
      (video.videoWidth - size) / 2;

    const sourceY =
      (video.videoHeight - size) / 2;

    context.clearRect(
      0,
      0,
      size,
      size
    );

    context.save();

    /*
     * Mirror the selfie so the captured image behaves
     * naturally like the front-facing camera preview.
     */
    context.translate(size, 0);
    context.scale(-1, 1);

    context.drawImage(
      video,
      sourceX,
      sourceY,
      size,
      size,
      0,
      0,
      size,
      size
    );

    context.restore();

    const imageData = canvas.toDataURL(
      "image/jpeg",
      0.88
    );

    setCapturedSelfie(imageData);

    /*
     * Store the selfie for the next verification step.
     */
    try {
      sessionStorage.setItem(
        "propertysure_kyc_selfie_data",
        imageData
      );
    } catch {
      /*
       * If storage fails, the image still remains in React
       * state for the current page.
       */
    }

    stopCamera();
    setCameraError("");
  };

  /* ----------------------------------------------------------
     RETAKE
  ---------------------------------------------------------- */

  const handleRetake = async () => {
    try {
      sessionStorage.removeItem(
        "propertysure_kyc_selfie_data"
      );
    } catch {
      // Ignore storage errors.
    }

    setCapturedSelfie(null);
    setCameraError("");

    /*
     * Start the camera again after the previous stream has
     * been completely stopped.
     */
    await startCamera();
  };

  /* ----------------------------------------------------------
     CONTINUE
  ---------------------------------------------------------- */

  const handleContinue = () => {
    if (!capturedSelfie) {
      return;
    }

    router.push(
      "/account/identity-verification/review"
    );
  };

  return (
    <main className={styles.page}>
      {/* ======================================================
          MOBILE HEADER
      ====================================================== */}

      <header className={styles.mobileHeader}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation"
        >
          <Icon name="menu" size={23} />
        </button>

        <button
          type="button"
          className={styles.mobileLogoButton}
          onClick={() =>
            navigateTo("/dashboard")
          }
          aria-label="PropertySure AI Dashboard"
        >
          <span
            className={
              styles.mobileLogoDiamond
            }
          >
            ◆
          </span>

          <span
            className={
              styles.mobileBrandName
            }
          >
            PropertySure
            <strong> AI</strong>
          </span>
        </button>

        <button
          type="button"
          className={styles.mobileBell}
          onClick={() =>
            navigateTo(
              "/account/notifications"
            )
          }
          aria-label="Notifications"
        >
          <Icon name="bell" size={17} />

          <span
            className={
              styles.mobileNotificationDot
            }
          />
        </button>
      </header>

      {/* ======================================================
          MOBILE MENU
      ====================================================== */}

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <div
            className={
              styles.mobileMenuHeader
            }
          >
            <button
              type="button"
              className={
                styles.mobileMenuLogo
              }
              onClick={() =>
                navigateTo(
                  "/dashboard"
                )
              }
            >
              <span>◆</span>

              <div>
                PropertySure
                <strong> AI</strong>
              </div>
            </button>

            <button
              type="button"
              className={
                styles.closeMenu
              }
              onClick={() =>
                setMenuOpen(false)
              }
              aria-label="Close navigation"
            >
              ×
            </button>
          </div>

          <div
            className={
              styles.mobileMenuSubtitle
            }
          >
            AI-Powered Property Due
            Diligence
          </div>

          <nav
            className={
              styles.mobileMenuNav
            }
          >
            {navItems.map((item) => (
              <button
                key={item.href}
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
                <span
                  className={
                    styles.navIcon
                  }
                >
                  <Icon
                    name={item.icon}
                    size={18}
                  />
                </span>

                <span>
                  {item.label}
                </span>
              </button>
            ))}
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
              navigateTo("/account")
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

            <span>Account</span>
          </button>

          <button
            type="button"
            className={
              styles.mobileNavItem
            }
            onClick={() =>
              navigateTo("/settings")
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

            <span>Settings</span>
          </button>
        </div>
      )}

      {/* ======================================================
          MAIN
      ====================================================== */}

      <section className={styles.main}>
        <div className={styles.content}>
          {/* ==================================================
              INTRO
          ================================================== */}

          <div className={styles.pageIntro}>
            <h1>Identity Verification</h1>

            <p>
              Complete the steps below to verify your
              identity and secure your account.
            </p>

            <button
              type="button"
              className={styles.backLink}
              onClick={() =>
                router.push("/account")
              }
            >
              <Icon
                name="arrow"
                size={18}
              />

              <span>
                Back to Account
              </span>
            </button>

            <div
              className={
                styles.statusBadge
              }
            >
              <span
                className={
                  styles.statusDiamond
                }
              >
                ◇
              </span>

              <span>
                Not Verified
              </span>
            </div>
          </div>

          {/* ==================================================
              FIVE STEP PROGRESS
          ================================================== */}

          <div className={styles.steps}>
            <StepItem>
              <Step
                completed
                number={1}
                label={
                  <>
                    Identity
                    <br />
                    Document
                  </>
                }
              />

              <StepLine active />
            </StepItem>

            <StepItem>
              <Step
                completed
                number={2}
                label={
                  <>
                    Document
                    <br />
                    Upload
                  </>
                }
              />

              <StepLine active />
            </StepItem>

            <StepItem>
              <Step
                completed
                number={3}
                label={
                  <>
                    Information
                    <br />
                    Confirmation
                  </>
                }
              />

              <StepLine active />
            </StepItem>

            <StepItem>
              <Step
                active
                number={4}
                label={
                  <>
                    Selfie
                    <br />
                    Verification
                  </>
                }
              />

              <StepLine />
            </StepItem>

            <StepItem last>
              <Step
                number={5}
                label={
                  <>
                    Review &
                    <br />
                    Submit
                  </>
                }
              />
            </StepItem>
          </div>

          {/* ==================================================
              VERIFICATION CARD
          ================================================== */}

          <section
            className={
              styles.verificationCard
            }
          >
            {/* CARD HEADER */}

            <div
              className={
                styles.cardHeader
              }
            >
              <div
                className={
                  styles.cardHeaderIcon
                }
              >
                <SelfieHeaderIcon />
              </div>

              <div
                className={
                  styles.cardHeaderText
                }
              >
                <h2>
                  Step 4: Selfie Verification
                </h2>

                <p>
                  Take a clear selfie to verify that you are
                  the owner of this identity.
                </p>
              </div>
            </div>

            <div
              className={
                styles.divider
              }
            />

            {/* =================================================
                REQUIREMENTS
            ================================================= */}

            <div
              className={
                styles.requirementsBox
              }
            >
              <h3>Make sure:</h3>

              <div
                className={
                  styles.requirementsGrid
                }
              >
                <SelfieRequirement
                  icon="sun"
                  text={
                    <>
                      You are in a
                      <br />
                      well-lit area
                    </>
                  }
                />

                <SelfieRequirement
                  icon="glasses"
                  text={
                    <>
                      Remove hats,
                      <br />
                      glasses, and
                      <br />
                      face coverings
                    </>
                  }
                />

                <SelfieRequirement
                  icon="face"
                  text={
                    <>
                      Your face is
                      <br />
                      clearly visible
                    </>
                  }
                />

                <SelfieRequirement
                  icon="phone"
                  text={
                    <>
                      Hold your phone
                      <br />
                      at eye level
                    </>
                  }
                />
              </div>
            </div>

            {/* =================================================
                SELFIE CAMERA AREA
            ================================================= */}

            <div
              className={`${styles.selfieArea} ${
                cameraActive
                  ? styles.selfieAreaCamera
                  : ""
              } ${
                capturedSelfie
                  ? styles.selfieAreaCaptured
                  : ""
              }`}
            >
              {cameraActive ? (
                <video
                  ref={videoRef}
                  className={
                    styles.cameraVideo
                  }
                  autoPlay
                  muted
                  playsInline
                  controls={false}
                  disablePictureInPicture
                  aria-label="Selfie camera preview"
                />
              ) : capturedSelfie ? (
                <img
                  src={capturedSelfie}
                  alt="Captured selfie"
                  className={
                    styles.selfiePreview
                  }
                />
              ) : (
                <div
                  className={
                    styles.selfiePlaceholder
                  }
                >
                  <div
                    className={
                      styles.cameraIcon
                    }
                  >
                    <CameraIcon />
                  </div>

                  <h3>
                    Take a Selfie
                  </h3>

                  <p>
                    Position your face in the center
                    <br />
                    of the circle
                  </p>
                </div>
              )}
            </div>

            {/* CAMERA ERROR */}

            {cameraError && (
              <div
                className={
                  styles.cameraError
                }
                role="alert"
              >
                {cameraError}
              </div>
            )}

            {/* =================================================
                SECURITY
            ================================================= */}

            <div
              className={
                styles.securityBox
              }
            >
              <div
                className={
                  styles.securityLock
                }
              >
                <LockIcon />
              </div>

              <p>
                Your selfie is encrypted and used only for
                identity verification.
                <br />
                We never share your data with third parties.
              </p>
            </div>

            {/* =================================================
                ACTION
            ================================================= */}

            <div
              className={
                styles.actionRow
              }
            >
              {!cameraActive &&
                !capturedSelfie && (
                  <button
                    type="button"
                    className={
                      styles.takeSelfieButton
                    }
                    onClick={
                      startCamera
                    }
                    disabled={
                      startingCamera
                    }
                  >
                    <CameraButtonIcon />

                    <span>
                      {startingCamera
                        ? "Opening Camera..."
                        : "Take Selfie"}
                    </span>
                  </button>
                )}

              {cameraActive && (
                <button
                  type="button"
                  className={
                    styles.takeSelfieButton
                  }
                  onClick={
                    captureSelfie
                  }
                >
                  <CameraButtonIcon />

                  <span>
                    Capture Selfie
                  </span>
                </button>
              )}

              {capturedSelfie &&
                !cameraActive && (
                  <div
                    className={
                      styles.capturedActions
                    }
                  >
                    <button
                      type="button"
                      className={
                        styles.retakeButton
                      }
                      onClick={
                        handleRetake
                      }
                    >
                      Retake Selfie
                    </button>

                    <button
                      type="button"
                      className={
                        styles.takeSelfieButton
                      }
                      onClick={
                        handleContinue
                      }
                    >
                      <span>
                        Continue
                      </span>

                      <span
                        className={
                          styles.continueArrow
                        }
                      >
                        →
                      </span>
                    </button>
                  </div>
                )}
            </div>

            <canvas
              ref={canvasRef}
              className={
                styles.hiddenCanvas
              }
            />
          </section>
        </div>
      </section>

      {/* ======================================================
          MOBILE BOTTOM NAV
      ====================================================== */}

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
            size={20}
          />

          <span>Dashboard</span>
        </button>

        <button
          type="button"
          className={
            styles.activeBottom
          }
          onClick={() =>
            navigateTo("/verify")
          }
        >
          <Icon
            name="verify"
            size={20}
          />

          <span>Verify</span>
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

          <span>Properties</span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo("/reports")
          }
        >
          <Icon
            name="reports"
            size={20}
          />

          <span>Reports</span>
        </button>

        <button
          type="button"
          onClick={() =>
            navigateTo("/account")
          }
        >
          <Icon
            name="account"
            size={20}
          />

          <span>Account</span>
        </button>
      </nav>
    </main>
  );
}

/* ============================================================
   STEP ITEM
============================================================ */

function StepItem({
  children,
  last = false,
}: {
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`${styles.stepItem} ${
        last
          ? styles.stepItemLast
          : ""
      }`}
    >
      {children}
    </div>
  );
}

/* ============================================================
   STEP
============================================================ */

function Step({
  number,
  label,
  active = false,
  completed = false,
}: {
  number: number;
  label: ReactNode;
  active?: boolean;
  completed?: boolean;
}) {
  return (
    <div
      className={`${styles.step} ${
        active
          ? styles.stepActive
          : ""
      }`}
    >
      <div
        className={`${styles.stepCircle} ${
          active
            ? styles.stepCircleActive
            : ""
        } ${
          completed
            ? styles.stepCircleCompleted
            : ""
        }`}
      >
        {completed ? (
          <span>✓</span>
        ) : (
          number
        )}
      </div>

      <div
        className={
          styles.stepLabel
        }
      >
        {label}
      </div>
    </div>
  );
}

/* ============================================================
   STEP LINE
============================================================ */

function StepLine({
  active = false,
}: {
  active?: boolean;
}) {
  return (
    <div
      className={`${styles.stepLine} ${
        active
          ? styles.stepLineActive
          : ""
      }`}
    />
  );
}

/* ============================================================
   SELFIE REQUIREMENT
============================================================ */

function SelfieRequirement({
  icon,
  text,
}: {
  icon:
    | "sun"
    | "glasses"
    | "face"
    | "phone";
  text: ReactNode;
}) {
  return (
    <div
      className={
        styles.selfieRequirement
      }
    >
      <div
        className={
          styles.requirementIcon
        }
      >
        <Icon
          name={icon}
          size={22}
        />
      </div>

      <div
        className={
          styles.requirementText
        }
      >
        {text}
      </div>
    </div>
  );
}

/* ============================================================
   SELFIE HEADER ICON
============================================================ */

function SelfieHeaderIcon() {
  return (
    <svg
      width="35"
      height="35"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle
        cx="9"
        cy="7"
        r="3"
      />

      <path
        d="M3 20v-1a6 6 0 016-6h1"
      />

      <rect
        x="14"
        y="13"
        width="7"
        height="6"
        rx="1.5"
      />

      <circle
        cx="17.5"
        cy="16"
        r="1.4"
      />

      <path
        d="M15.5 13l.8-1.3h2.4l.8 1.3"
      />
    </svg>
  );
}

/* ============================================================
   CAMERA ICON
============================================================ */

function CameraIcon() {
  return (
    <svg
      width="39"
      height="39"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 8h3l1.5-2h7L17 8h3v10H4z" />

      <circle
        cx="12"
        cy="13"
        r="3.2"
      />
    </svg>
  );
}

/* ============================================================
   CAMERA BUTTON ICON
============================================================ */

function CameraButtonIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 8h3l1.5-2h7L17 8h3v10H4z" />

      <circle
        cx="12"
        cy="13"
        r="3"
      />
    </svg>
  );
}

/* ============================================================
   LOCK ICON
============================================================ */

function LockIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
      />

      <path d="M8 10V7a4 4 0 018 0v3" />
    </svg>
  );
}