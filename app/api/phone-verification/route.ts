import { NextResponse } from "next/server";

/*
 * ============================================================
 * ROB﻿ASE PHONE VERIFICATION API
 * ============================================================
 *
 * This route keeps the Robase API key on the server.
 *
 * Supported actions:
 *
 * POST { action: "send", phone: "+234..." }
 *
 * POST { action: "verify", otpId: "...", code: "123456" }
 *
 * The browser NEVER receives the Robase API key.
 * ============================================================
 */

const ROBASE_API_URL =
  "https://api.robase.dev";

type RequestBody =
  | {
      action: "send";
      phone: string;
    }
  | {
      action: "verify";
      otpId: string;
      code: string;
    };

/*
 * ============================================================
 * NORMALIZE NIGERIAN PHONE NUMBER
 * ============================================================
 */

function normalizeNigeriaPhone(
  value: string
) {
  const digits =
    value.replace(/\D/g, "");

  if (
    digits.startsWith("234")
  ) {
    return `+${digits}`;
  }

  if (
    digits.startsWith("0")
  ) {
    return `+234${digits.slice(1)}`;
  }

  return `+234${digits}`;
}

/*
 * ============================================================
 * VALIDATE NIGERIAN PHONE NUMBER
 * ============================================================
 */

function isValidNigeriaPhone(
  value: string
) {
  const digits =
    value.replace(/\D/g, "");

  let localNumber =
    digits;

  if (
    localNumber.startsWith(
      "234"
    )
  ) {
    localNumber =
      localNumber.slice(3);
  }

  if (
    localNumber.startsWith("0")
  ) {
    localNumber =
      localNumber.slice(1);
  }

  return (
    localNumber.length ===
    10
  );
}

/*
 * ============================================================
 * POST
 * ============================================================
 */

export async function POST(
  request: Request
) {
  try {
    /*
     * ========================================================
     * 1. CHECK ROB﻿ASE API KEY
     * ========================================================
     */

    const apiKey =
      process.env.ROBASE_API_KEY;

    if (!apiKey) {
      console.error(
        "ROBASE_API_KEY is missing."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Robase API configuration is missing on the server.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * ========================================================
     * 2. READ REQUEST
     * ========================================================
     */

    const body =
      (await request.json()) as RequestBody;

    /*
     * ========================================================
     * 3. SEND OTP
     * ========================================================
     */

    if (
      body.action ===
      "send"
    ) {
      if (
        !body.phone ||
        typeof body.phone !==
          "string"
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Phone number is required.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        !isValidNigeriaPhone(
          body.phone
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Please provide a valid Nigerian phone number.",
          },
          {
            status: 400,
          }
        );
      }

      const phone =
        normalizeNigeriaPhone(
          body.phone
        );

      /*
       * Robase generates the OTP and sends it to the phone.
       *
       * 6 digits
       * 10 minute expiry
       */

      const response =
        await fetch(
          `${ROBASE_API_URL}/v1/otp/send`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${apiKey}`,

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              phone_number:
                phone,

              code_length:
                6,

              ttl_seconds:
                600,
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok
      ) {
        console.error(
          "ROBASE OTP SEND ERROR:",
          result
        );

        return NextResponse.json(
          {
            success: false,

            error:
              result?.message ||
              result?.error ||
              "Robase could not send the verification code.",
          },
          {
            status:
              response.status >=
                400 &&
              response.status <
                600
                ? response.status
                : 502,
          }
        );
      }

      /*
       * Robase returns the OTP identifier.
       *
       * We need this ID later when the user enters
       * the 6-digit code.
       */

      const otpId =
        result?.otp_id ||
        result?.id;

      if (!otpId) {
        console.error(
          "ROBASE OTP SEND RESPONSE DID NOT CONTAIN OTP ID:",
          result
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Robase sent the request but did not return an OTP ID.",
          },
          {
            status: 502,
          }
        );
      }

      return NextResponse.json({
        success: true,

        otpId,

        phone,

        message:
          "A 6-digit verification code has been sent to your phone.",
      });
    }

    /*
     * ========================================================
     * 4. VERIFY OTP
     * ========================================================
     */

    if (
      body.action ===
      "verify"
    ) {
      if (
        !body.otpId ||
        typeof body.otpId !==
          "string"
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "OTP verification ID is required.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        !body.code ||
        typeof body.code !==
          "string"
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Verification code is required.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        !/^\d{6}$/.test(
          body.code
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Please enter the 6-digit verification code.",
          },
          {
            status: 400,
          }
        );
      }

      /*
       * Ask Robase to verify the code.
       */

      const response =
        await fetch(
          `${ROBASE_API_URL}/v1/otp/verify`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${apiKey}`,

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              otp_id:
                body.otpId,

              code:
                body.code,
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok
      ) {
        console.error(
          "ROBASE OTP VERIFY ERROR:",
          result
        );

        return NextResponse.json(
          {
            success: false,

            error:
              result?.message ||
              result?.error ||
              "The verification code could not be verified.",
          },
          {
            status:
              response.status >=
                400 &&
              response.status <
                600
                ? response.status
                : 502,
          }
        );
      }

      /*
       * Robase confirms the OTP.
       */

      if (
        result?.verified ===
          false ||
        result?.status ===
          "failed"
      ) {
        return NextResponse.json(
          {
            success: false,

            error:
              "Invalid or expired verification code.",
          },
          {
            status: 400,
          }
        );
      }

      return NextResponse.json({
        success: true,

        verified: true,

        message:
          "Your phone number has been verified successfully.",
      });
    }

    /*
     * ========================================================
     * 5. UNKNOWN ACTION
     * ========================================================
     */

    return NextResponse.json(
      {
        success: false,

        error:
          "Invalid phone verification action.",
      },
      {
        status: 400,
      }
    );
  } catch (
    error
  ) {
    console.error(
      "PROPERTY SURE AI ROB﻿ASE PHONE VERIFICATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "Phone verification service is temporarily unavailable. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}