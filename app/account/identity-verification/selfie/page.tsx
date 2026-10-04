"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import AppShell from "../../../AppShell/AppShell";
import LoadingScreen from "../../../AppShell/LoadingScreen";

/* ============================================================
   TYPES
============================================================ */

type IconName =
  | "camera"
  | "sun"
  | "glasses"
  | "face"
  | "phone";

type SelfieRequirementIcon =
  | "sun"
  | "glasses"
  | "face"
  | "phone";

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
    camera: "◎",
    sun: "☀",
    glasses: "◉",
    face: "♙",
    phone: "▯",
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
   MAIN PAGE
============================================================ */

export default function SelfieVerificationPage() {
  const router = useRouter();

  /* ----------------------------------------------------------
     SHARED PAGE LOADING
  ---------------------------------------------------------- */

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        setLoading(false);
      }, 800);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /* ----------------------------------------------------------
     CAMERA REFERENCES
  ---------------------------------------------------------- */

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  /* ----------------------------------------------------------
     CAMERA STATE
  ---------------------------------------------------------- */

  const [cameraActive, setCameraActive] =
    useState(false);

  const [capturedSelfie, setCapturedSelfie] =
    useState<string | null>(null);

  const [cameraError, setCameraError] =
    useState("");

  const [startingCamera, setStartingCamera] =
    useState(false);

  /* ----------------------------------------------------------
     LOAD PREVIOUSLY CAPTURED SELFIE
  ---------------------------------------------------------- */

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    try {
      const storedSelfie =
        sessionStorage.getItem(
          "propertysure_kyc_selfie_data"
        );

      if (storedSelfie) {
        setCapturedSelfie(
          storedSelfie
        );
      }
    } catch {
      // Ignore sessionStorage errors.
    }
  }, []);

  /* ----------------------------------------------------------
     STOP CAMERA
  ---------------------------------------------------------- */

  const stopCamera = () => {
    const stream =
      streamRef.current;

    if (stream) {
      stream
        .getTracks()
        .forEach(
          (track) => {
            track.stop();
          }
        );

      streamRef.current = null;
    }

    const video =
      videoRef.current;

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
      const stream =
        streamRef.current;

      if (stream) {
        stream
          .getTracks()
          .forEach(
            (track) => {
              track.stop();
            }
          );
      }

      streamRef.current = null;

      const video =
        videoRef.current;

      if (video) {
        video.pause();
        video.srcObject = null;
      }
    };
  }, []);

  /* ----------------------------------------------------------
     START CAMERA

     The camera is only started after the user presses
     "Take Selfie".
  ---------------------------------------------------------- */

  const startCamera =
    async () => {
      if (startingCamera) {
        return;
      }

      setCameraError("");
      setStartingCamera(true);

      try {
        if (
          typeof window ===
            "undefined" ||
          typeof navigator ===
            "undefined"
        ) {
          throw new Error(
            "BROWSER_UNAVAILABLE"
          );
        }

        if (
          !navigator.mediaDevices ||
          typeof navigator
            .mediaDevices
            .getUserMedia !==
            "function"
        ) {
          throw new Error(
            "CAMERA_UNSUPPORTED"
          );
        }

        /*
         * Make absolutely sure an old stream
         * is not still active.
         */

        if (
          streamRef.current
        ) {
          streamRef.current
            .getTracks()
            .forEach(
              (track) => {
                track.stop();
              }
            );

          streamRef.current = null;
        }

        /*
         * Use the front-facing camera.
         *
         * Avoid forcing an exact camera resolution
         * for better iPhone/Safari compatibility.
         */

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
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
            }
          );

        streamRef.current =
          stream;

        const video =
          videoRef.current;

        if (!video) {
          stream
            .getTracks()
            .forEach(
              (track) => {
                track.stop();
              }
            );

          streamRef.current =
            null;

          throw new Error(
            "VIDEO_ELEMENT_UNAVAILABLE"
          );
        }

        /*
         * iPhone/Safari compatibility.
         */

        video.setAttribute(
          "playsinline",
          "true"
        );

        video.setAttribute(
          "webkit-playsinline",
          "true"
        );

        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;

        video.srcObject =
          stream;

        /*
         * Wait until Safari knows the
         * camera dimensions.
         */

        await new Promise<void>(
          (resolve) => {
            if (
              video.readyState >=
                2 &&
              video.videoWidth >
                0 &&
              video.videoHeight >
                0
            ) {
              resolve();
              return;
            }

            const handleLoadedMetadata =
              () => {
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
          }
        );

        try {
          await video.play();
        } catch {
          /*
           * Try once more for Safari.
           */

          try {
            video.muted = true;
            video.playsInline = true;

            await video.play();
          } catch {
            throw new Error(
              "VIDEO_PLAY_FAILED"
            );
          }
        }

        setCapturedSelfie(
          null
        );

        setCameraActive(
          true
        );
      } catch (error) {
        /*
         * Make sure no partially-created
         * camera stream remains.
         */

        if (
          streamRef.current
        ) {
          streamRef.current
            .getTracks()
            .forEach(
              (track) => {
                track.stop();
              }
            );

          streamRef.current = null;
        }

        if (
          videoRef.current
        ) {
          videoRef.current.pause();
          videoRef.current.srcObject =
            null;
        }

        setCameraActive(
          false
        );

        const errorCode =
          error instanceof Error
            ? error.message
            : "";

        if (
          errorCode ===
          "CAMERA_UNSUPPORTED"
        ) {
          setCameraError(
            "Camera access is not supported on this device or browser."
          );
        } else if (
          errorCode ===
          "VIDEO_ELEMENT_UNAVAILABLE"
        ) {
          setCameraError(
            "The camera could not be opened. Please refresh the page and try again."
          );
        } else if (
          errorCode ===
          "VIDEO_PLAY_FAILED"
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
        setStartingCamera(
          false
        );
      }
    };

  /* ----------------------------------------------------------
     CAPTURE SELFIE
  ---------------------------------------------------------- */

  const captureSelfie =
    () => {
      const video =
        videoRef.current;

      const canvas =
        canvasRef.current;

      if (
        !video ||
        !canvas
      ) {
        setCameraError(
          "The camera is not ready yet. Please try again."
        );

        return;
      }

      if (
        video.videoWidth ===
          0 ||
        video.videoHeight ===
          0
      ) {
        setCameraError(
          "The camera is not ready yet. Please wait a moment and try again."
        );

        return;
      }

      const size =
        Math.min(
          video.videoWidth,
          video.videoHeight
        );

      canvas.width =
        size;

      canvas.height =
        size;

      const context =
        canvas.getContext(
          "2d"
        );

      if (!context) {
        setCameraError(
          "Unable to capture the selfie. Please try again."
        );

        return;
      }

      const sourceX =
        (video.videoWidth -
          size) /
        2;

      const sourceY =
        (video.videoHeight -
          size) /
        2;

      context.clearRect(
        0,
        0,
        size,
        size
      );

      context.save();

      /*
       * Mirror the selfie so the captured image
       * behaves naturally like the front camera.
       */

      context.translate(
        size,
        0
      );

      context.scale(
        -1,
        1
      );

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

      const imageData =
        canvas.toDataURL(
          "image/jpeg",
          0.88
        );

      setCapturedSelfie(
        imageData
      );

      /*
       * Store selfie for the next verification step.
       */

      try {
        sessionStorage.setItem(
          "propertysure_kyc_selfie_data",
          imageData
        );
      } catch {
        /*
         * If storage fails, the image still
         * remains in React state.
         */
      }

      stopCamera();
      setCameraError("");
    };

  /* ----------------------------------------------------------
     RETAKE
  ---------------------------------------------------------- */

  const handleRetake =
    async () => {
      try {
        sessionStorage.removeItem(
          "propertysure_kyc_selfie_data"
        );
      } catch {
        // Ignore storage errors.
      }

      setCapturedSelfie(
        null
      );

      setCameraError("");

      /*
       * Start camera again after the
       * previous stream is completely stopped.
       */

      await startCamera();
    };

  /* ----------------------------------------------------------
     CONTINUE
  ---------------------------------------------------------- */

  const handleContinue =
    () => {
      if (
        !capturedSelfie
      ) {
        return;
      }

      router.push(
        "/account/identity-verification/review"
      );
    };

  /* ==========================================================
     SHARED LOADING SCREEN
  ========================================================== */

  if (loading) {
    return (
      <LoadingScreen />
    );
  }

  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <AppShell
      activePath="/account"
      headerPath="/account"
    >
      <main
        className={
          styles.page
        }
      >
        <section
          className={
            styles.main
          }
        >
          <div
            className={
              styles.content
            }
          >
            {/* ==================================================
                INTRO
            ================================================== */}

            <div
              className={
                styles.pageIntro
              }
            >
              <h1>
                Identity Verification
              </h1>

              <p>
                Complete the steps below to verify your
                identity and secure your account.
              </p>

              <button
                type="button"
                className={
                  styles.backLink
                }
                onClick={() =>
                  router.push(
                    "/account/identity-verification/information-confirmation"
                  )
                }
              >
                <span
                  className={
                    styles.backArrow
                  }
                >
                  ←
                </span>

                <span>
                  Back to Information Confirmation
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

            <div
              className={
                styles.steps
              }
            >
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

                <StepLine
                  active
                />
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

                <StepLine
                  active
                />
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

                <StepLine
                  active
                />
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
              {/* =================================================
                  CARD HEADER
              ================================================= */}

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
                <h3>
                  Make sure:
                </h3>

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
                    controls={
                      false
                    }
                    disablePictureInPicture
                    aria-label="Selfie camera preview"
                  />
                ) : capturedSelfie ? (
                  <img
                    src={
                      capturedSelfie
                    }
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

              {/* =================================================
                  CAMERA ERROR
              ================================================= */}

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

              {/* =================================================
                  HIDDEN CANVAS
              ================================================= */}

              <canvas
                ref={canvasRef}
                className={
                  styles.hiddenCanvas
                }
              />
            </section>
          </div>
        </section>
      </main>
    </AppShell>
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
          <span>
            ✓
          </span>
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
  icon: SelfieRequirementIcon;
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