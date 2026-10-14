import { NextResponse } from "next/server";

import { supabaseServer } from "@/app/lib/ai/supabase-server";
import {
  approveKnowledgeDocument,
} from "@/app/lib/ai/knowledge-store";

/**
 * Securely approve an AI knowledge document.
 *
 * Only authenticated users with the "admin" role
 * in the admin_users table can approve knowledge.
 */

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  request: Request,
  context: RouteContext,
) {
  try {
    // --------------------------------------------------
    // 1. Validate Authorization header
    // --------------------------------------------------

    const authorization =
      request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
        },
        { status: 401 },
      );
    }

    const accessToken =
      authorization.substring("Bearer ".length).trim();

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication token is missing.",
        },
        { status: 401 },
      );
    }

    // --------------------------------------------------
    // 2. Validate the Supabase user
    // --------------------------------------------------

    const {
      data: { user },
      error: userError,
    } = await supabaseServer.auth.getUser(accessToken);

    if (userError || !user) {
      console.error(
        "Knowledge approval authentication error:",
        userError,
      );

      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired authentication token.",
        },
        { status: 401 },
      );
    }

    // --------------------------------------------------
    // 3. Verify that the user is an admin
    // --------------------------------------------------

    const { data: admin, error: adminError } =
      await supabaseServer
        .from("admin_users")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

    if (adminError) {
      console.error(
        "Knowledge approval admin check error:",
        adminError,
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to verify administrator access.",
        },
        { status: 500 },
      );
    }

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: "Administrator access required.",
        },
        { status: 403 },
      );
    }

    // --------------------------------------------------
    // 4. Validate knowledge document ID
    // --------------------------------------------------

    const { id } = await context.params;

    if (!id?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Knowledge document ID is required.",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // 5. Approve the knowledge document
    // --------------------------------------------------

    const knowledgeDocument =
      await approveKnowledgeDocument(id);

    // --------------------------------------------------
    // 6. Return success
    // --------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message:
          "Knowledge document approved successfully.",
        knowledgeDocument,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "PropertySure AI knowledge approval error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to approve knowledge document.",
      },
      { status: 500 },
    );
  }
}