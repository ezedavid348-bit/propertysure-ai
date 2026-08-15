"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function SignUpPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const passwordStrength = useMemo(() => {
    if (!password) {
      return {
        label: "Enter a password",
        score: 0,
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) {
      return {
        label: "Weak",
        score: 1,
      };
    }

    if (score === 2) {
      return {
        label: "Fair",
        score: 2,
      };
    }

    if (score === 3) {
      return {
        label: "Good",
        score: 3,
      };
    }

    return {
      label: "Strong",
      score: 4,
    };
  }, [password]);

  const handleSignUp = async () => {
    setError("");
    setSuccess("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please create a password.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    if (!agreedToTerms) {
      setError(
        "Please agree to the Terms of Service and Privacy Policy."
      );
      return;
    }

    try {
      setLoading(true);

     const { data, error: signUpError } = await supabase.auth.signUp({
  email: email.trim().toLowerCase(),
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/dashboard`,
    data: {
      full_name: fullName.trim(),
      phone: phone.trim(),
    },
  },
});

      if (signUpError) {
        throw signUpError;
      }

      /*
       * If email confirmation is enabled in Supabase,
       * the user may need to confirm their email before
       * they can access the dashboard.
       */
      if (data.user && !data.session) {
        setSuccess(
          "Your account has been created. Please check your email to confirm your account."
        );
        return;
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err?.message ||
          "We couldn't create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError("");
    setSuccess("");

    if (!agreedToTerms) {
      setError(
        "Please agree to the Terms of Service and Privacy Policy before continuing with Google."
      );
      return;
    }

    try {
      setGoogleLoading(true);

      const { error: googleError } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
          },
        });

      if (googleError) {
        throw googleError;
      }
    } catch (err: any) {
      setError(
        err?.message ||
          "Google sign-up could not be started. Please try again."
      );
      setGoogleLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 10%, rgba(15,70,130,0.28), transparent 35%), radial-gradient(circle at 90% 30%, rgba(0,119,255,0.12), transparent 30%), #020914",
        color: "#FFFFFF",
        fontFamily:
          "Inter, Arial, Helvetica, sans-serif",
        padding: "28px",
        boxSizing: "border-box",
      }}
    >
      {/* ================= TOP BRAND ================= */}

      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto 35px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            border: "2px solid #1497FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#1497FF",
            fontSize: "24px",
            boxShadow: "0 0 25px rgba(20,151,255,0.22)",
          }}
        >
          🏠
        </div>

        <div
          style={{
            fontSize: "28px",
            fontWeight: 800,
            letterSpacing: "-0.7px",
          }}
        >
          PropertySure{" "}
          <span style={{ color: "#159BFF" }}>AI</span>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}

      <section
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns:
            "minmax(280px, 0.85fr) minmax(400px, 1.15fr)",
          gap: "50px",
          alignItems: "center",
        }}
      >
        {/* ================= LEFT SIDE ================= */}

        <div
          style={{
            padding: "10px 10px 10px 0",
          }}
        >
          <div
            style={{
              color: "#159BFF",
              fontSize: "15px",
              fontWeight: 800,
              letterSpacing: "2px",
              marginBottom: "18px",
            }}
          >
            PROPERTY VERIFICATION
          </div>

          <h1
            style={{
              fontSize: "clamp(40px, 5vw, 62px)",
              lineHeight: 1.04,
              margin: 0,
              letterSpacing: "-2px",
              fontWeight: 800,
            }}
          >
            Create your
            <br />
            <span style={{ color: "#159BFF" }}>
              PropertySure AI
            </span>
            <br />
            account
          </h1>

          <div
            style={{
              width: "80px",
              height: "4px",
              background:
                "linear-gradient(90deg,#159BFF,#006EFF)",
              borderRadius: "10px",
              margin: "28px 0",
            }}
          />

          <p
            style={{
              color: "#AEBCCE",
              fontSize: "18px",
              lineHeight: 1.75,
              maxWidth: "470px",
              marginBottom: "35px",
            }}
          >
            Join PropertySure AI and verify property
            documents with greater confidence before
            making important property decisions.
          </p>

          {/* Benefit 1 */}

          <Benefit
            icon="🛡️"
            title="AI-Powered Verification"
            text="Detect suspicious alterations, inconsistencies and potential fraud."
          />

          {/* Benefit 2 */}

          <Benefit
            icon="🔒"
            title="Secure & Private"
            text="Your account and verification information are handled securely."
          />

          {/* Benefit 3 */}

          <Benefit
            icon="⚡"
            title="Fast & Reliable"
            text="Get property verification results without unnecessary delays."
          />

          {/* Illustration */}

          <div
            style={{
              marginTop: "30px",
              width: "100%",
              maxWidth: "330px",
              height: "190px",
              borderRadius: "28px",
              background:
                "radial-gradient(circle at 50% 30%, rgba(0,140,255,0.25), transparent 55%), rgba(8,25,48,0.75)",
              border:
                "1px solid rgba(30,148,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                fontSize: "85px",
                filter:
                  "drop-shadow(0 0 25px rgba(0,130,255,0.8))",
              }}
            >
              🛡️
            </div>

            <div
              style={{
                position: "absolute",
                bottom: "18px",
                color: "#7EBFFF",
                fontSize: "13px",
                letterSpacing: "1px",
              }}
            >
              SECURE PROPERTY VERIFICATION
            </div>
          </div>

          {/* Trust */}

          <div
            style={{
              marginTop: "25px",
              padding: "18px",
              maxWidth: "330px",
              borderRadius: "16px",
              background:
                "rgba(255,255,255,0.025)",
              border:
                "1px solid rgba(255,255,255,0.08)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: "#FFC107",
                fontSize: "20px",
                letterSpacing: "4px",
              }}
            >
              ★★★★★
            </div>

            <div
              style={{
                color: "#B6C2D2",
                marginTop: "8px",
                fontSize: "14px",
              }}
            >
              Built for Property Buyers & Investors
            </div>
          </div>
        </div>

        {/* ================= SIGNUP CARD ================= */}

        <div
          style={{
            background:
              "linear-gradient(145deg, rgba(12,28,49,0.92), rgba(5,17,31,0.96))",
            border:
              "1px solid rgba(70,160,255,0.55)",
            borderRadius: "24px",
            padding: "42px",
            boxShadow:
              "0 30px 90px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
            backdropFilter: "blur(20px)",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: "38px",
              margin: "0 0 10px",
              letterSpacing: "-1px",
            }}
          >
            Create Your Account
          </h2>

          <p
            style={{
              textAlign: "center",
              color: "#AAB8C9",
              fontSize: "16px",
              lineHeight: 1.6,
              marginBottom: "30px",
            }}
          >
            Sign up to start verifying property documents
            securely.
          </p>

          {/* Google */}

          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            style={{
              width: "100%",
              padding: "15px",
              background: "#FFFFFF",
              color: "#101828",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: 700,
              cursor:
                googleLoading || loading
                  ? "not-allowed"
                  : "pointer",
              opacity:
                googleLoading || loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            <span
              style={{
                fontSize: "20px",
                fontWeight: 800,
              }}
            >
              G
            </span>

            {googleLoading
              ? "Connecting to Google..."
              : "Continue with Google"}
          </button>

          {/* Divider */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              margin: "28px 0",
              color: "#718096",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background:
                  "rgba(255,255,255,0.12)",
              }}
            />

            <span>OR</span>

            <div
              style={{
                flex: 1,
                height: "1px",
                background:
                  "rgba(255,255,255,0.12)",
              }}
            />
          </div>

          {/* Error */}

          {error && (
            <div
              style={{
                background:
                  "rgba(239,68,68,0.10)",
                border:
                  "1px solid rgba(239,68,68,0.35)",
                color: "#FF8A8A",
                padding: "13px 15px",
                borderRadius: "10px",
                marginBottom: "20px",
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          {/* Success */}

          {success && (
            <div
              style={{
                background:
                  "rgba(34,197,94,0.10)",
                border:
                  "1px solid rgba(34,197,94,0.35)",
                color: "#72E6A0",
                padding: "13px 15px",
                borderRadius: "10px",
                marginBottom: "20px",
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              {success}
            </div>
          )}

          {/* Full Name */}

          <InputField
            label="Full Name"
            placeholder="Enter your full name"
            value={fullName}
            onChange={setFullName}
            icon="👤"
          />

          {/* Phone */}

          <label
            style={{
              display: "block",
              color: "#FFFFFF",
              fontWeight: 600,
              marginBottom: "9px",
              fontSize: "14px",
            }}
          >
            Phone Number
          </label>

          <div
            style={{
              display: "flex",
              marginBottom: "20px",
              border:
                "1px solid rgba(90,130,170,0.55)",
              borderRadius: "11px",
              overflow: "hidden",
              background:
                "rgba(7,20,35,0.9)",
            }}
          >
            <div
              style={{
                width: "100px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                borderRight:
                  "1px solid rgba(90,130,170,0.4)",
                color: "#D8E4F2",
                fontSize: "14px",
              }}
            >
              🇳🇬 +234
            </div>

            <input
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              placeholder="Enter your phone number"
              style={inputStyle}
            />
          </div>

          {/* Email */}

          <InputField
            label="Email Address"
            placeholder="Enter your email address"
            value={email}
            onChange={setEmail}
            icon="✉"
            type="email"
          />

          {/* Password */}

          <label
            style={{
              display: "block",
              color: "#FFFFFF",
              fontWeight: 600,
              marginBottom: "9px",
              fontSize: "14px",
            }}
          >
            Password
          </label>

          <div style={passwordWrapperStyle}>
            <span style={passwordIconStyle}>
              🔒
            </span>

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Create a strong password"
              style={passwordInputStyle}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              style={eyeButtonStyle}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          {/* Password strength */}

          <div style={{ marginBottom: "22px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                marginBottom: "7px",
              }}
            >
              <span style={{ color: "#8EA0B5" }}>
                Password strength
              </span>

              <span
                style={{
                  color:
                    passwordStrength.score <= 1
                      ? "#FF5C5C"
                      : passwordStrength.score === 2
                      ? "#F5B942"
                      : passwordStrength.score === 3
                      ? "#55C878"
                      : "#20D98B",
                  fontWeight: 700,
                }}
              >
                {passwordStrength.label}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(4, 1fr)",
                gap: "5px",
              }}
            >
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  style={{
                    height: "4px",
                    borderRadius: "10px",
                    background:
                      bar <= passwordStrength.score
                        ? "#159BFF"
                        : "rgba(255,255,255,0.12)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Confirm Password */}

          <label
            style={{
              display: "block",
              color: "#FFFFFF",
              fontWeight: 600,
              marginBottom: "9px",
              fontSize: "14px",
            }}
          >
            Confirm Password
          </label>

          <div
            style={{
              ...passwordWrapperStyle,
              marginBottom: "24px",
            }}
          >
            <span style={passwordIconStyle}>
              🔒
            </span>

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm your password"
              style={passwordInputStyle}
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  !showConfirmPassword
                )
              }
              style={eyeButtonStyle}
            >
              {showConfirmPassword ? "🙈" : "👁"}
            </button>
          </div>

          {/* Terms */}

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              color: "#B5C2D2",
              fontSize: "13px",
              lineHeight: 1.5,
              marginBottom: "25px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) =>
                setAgreedToTerms(e.target.checked)
              }
              style={{
                width: "18px",
                height: "18px",
                marginTop: "1px",
                accentColor: "#159BFF",
                cursor: "pointer",
              }}
            />

            <span>
              I agree to the{" "}
              <span
                style={{
                  color: "#159BFF",
                  cursor: "pointer",
                }}
              >
                Terms of Service
              </span>{" "}
              and{" "}
              <span
                style={{
                  color: "#159BFF",
                  cursor: "pointer",
                }}
              >
                Privacy Policy
              </span>
              .
            </span>
          </label>

          {/* Create Account */}

          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading || googleLoading}
            style={{
              width: "100%",
              padding: "16px",
              border: "none",
              borderRadius: "12px",
              background:
                "linear-gradient(135deg,#159BFF,#005FE8)",
              color: "#FFFFFF",
              fontSize: "18px",
              fontWeight: 800,
              cursor:
                loading || googleLoading
                  ? "not-allowed"
                  : "pointer",
              opacity:
                loading || googleLoading ? 0.7 : 1,
              boxShadow:
                "0 12px 30px rgba(0,110,255,0.25)",
            }}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

          {/* Sign In */}

          <p
            style={{
              textAlign: "center",
              color: "#9FAFC2",
              marginTop: "28px",
              marginBottom: 0,
              fontSize: "14px",
            }}
          >
            Already have an account?{" "}
            <span
              onClick={() => router.push("/signin")}
              style={{
                color: "#159BFF",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Sign In
            </span>
          </p>
        </div>
      </section>

      {/* ================= BOTTOM BENEFITS ================= */}

      <section
        style={{
          maxWidth: "1180px",
          margin: "50px auto 0",
          padding: "22px",
          borderRadius: "20px",
          border:
            "1px solid rgba(70,160,255,0.25)",
          background:
            "rgba(8,24,43,0.65)",
          display: "grid",
          gridTemplateColumns:
            "repeat(4, 1fr)",
          gap: "20px",
        }}
      >
        <BottomBenefit
          icon="🛡️"
          title="Fraud Protection"
          text="Protect yourself from property scams."
        />

        <BottomBenefit
          icon="◷"
          title="Save Time"
          text="Get verification results faster."
        />

        <BottomBenefit
          icon="✓"
          title="Trusted Reports"
          text="Reliable reports for better decisions."
        />

        <BottomBenefit
          icon="◎"
          title="Access Anywhere"
          text="Verify properties from anywhere."
        />
      </section>

      {/* ================= RESPONSIVE NOTE ================= */}

      <style jsx>{`
        @media (max-width: 850px) {
          main {
            padding: 18px !important;
          }

          section {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 600px) {
          section {
            padding: 0 !important;
          }

          h1 {
            font-size: 42px !important;
          }

          h2 {
            font-size: 30px !important;
          }

          section:last-of-type {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 430px) {
          section:last-of-type {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   REUSABLE INPUT
========================================================= */

function InputField({
  label,
  placeholder,
  value,
  onChange,
  icon,
  type = "text",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: string;
  type?: string;
}) {
  return (
    <>
      <label
        style={{
          display: "block",
          color: "#FFFFFF",
          fontWeight: 600,
          marginBottom: "9px",
          fontSize: "14px",
        }}
      >
        {label}
      </label>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          border:
            "1px solid rgba(90,130,170,0.55)",
          borderRadius: "11px",
          background:
            "rgba(7,20,35,0.9)",
          marginBottom: "20px",
        }}
      >
        <span
          style={{
            width: "48px",
            textAlign: "center",
            color: "#91A6BD",
            fontSize: "17px",
          }}
        >
          {icon}
        </span>

        <input
          type={type}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          style={inputStyle}
        />
      </div>
    </>
  );
}

/* =========================================================
   BENEFIT
========================================================= */

function Benefit({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "15px",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          width: "52px",
          height: "52px",
          flexShrink: 0,
          borderRadius: "13px",
          background:
            "rgba(20,130,255,0.10)",
          border:
            "1px solid rgba(20,150,255,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "23px",
          boxShadow:
            "0 8px 25px rgba(0,100,255,0.10)",
        }}
      >
        {icon}
      </div>

      <div>
        <h3
          style={{
            margin: "2px 0 5px",
            fontSize: "17px",
          }}
        >
          {title}
        </h3>

        <p
          style={{
            margin: 0,
            color: "#8FA2B8",
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   BOTTOM BENEFIT
========================================================= */

function BottomBenefit({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "12px",
          border:
            "1px solid rgba(20,150,255,0.35)",
          color: "#159BFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "19px",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: "14px",
            marginBottom: "3px",
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: "#8193A9",
            fontSize: "12px",
            lineHeight: 1.4,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const inputStyle = {
  width: "100%",
  minWidth: 0,
  padding: "15px 14px",
  border: "none",
  outline: "none",
  background: "transparent",
  color: "#FFFFFF",
  fontSize: "15px",
  boxSizing: "border-box" as const,
};

const passwordWrapperStyle = {
  display: "flex",
  alignItems: "center",
  border:
    "1px solid rgba(90,130,170,0.55)",
  borderRadius: "11px",
  background:
    "rgba(7,20,35,0.9)",
  marginBottom: "8px",
  overflow: "hidden",
};

const passwordInputStyle = {
  width: "100%",
  minWidth: 0,
  padding: "15px 8px",
  border: "none",
  outline: "none",
  background: "transparent",
  color: "#FFFFFF",
  fontSize: "15px",
  boxSizing: "border-box" as const,
};

const passwordIconStyle = {
  width: "48px",
  textAlign: "center" as const,
  color: "#91A6BD",
  fontSize: "16px",
  flexShrink: 0,
};

const eyeButtonStyle = {
  width: "48px",
  flexShrink: 0,
  height: "48px",
  border: "none",
  background: "transparent",
  color: "#8EA0B5",
  cursor: "pointer",
  fontSize: "16px",
};