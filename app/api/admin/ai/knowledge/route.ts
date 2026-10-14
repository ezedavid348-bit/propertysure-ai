import { NextResponse } from "next/server";

import { supabaseServer } from "@/app/lib/ai/supabase-server";

export async function GET(request: Request) {
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
    // 2. Validate Supabase user
    // --------------------------------------------------

    const {
      data: { user },
      error: userError,
    } = await supabaseServer.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired authentication token.",
        },
        { status: 401 },
      );
    }

    // --------------------------------------------------
    // 3. Verify admin role
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
        "AI knowledge admin check error:",
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
    // 4. Load knowledge documents
    // --------------------------------------------------

    const { data: documents, error: documentsError } =
      await supabaseServer
        .from("ai_knowledge_documents")
        .select(
          "id, title, document_type, source_type, approval_status, content, metadata, created_at",
        )
        .order("created_at", {
          ascending: false,
        });

    if (documentsError) {
      console.error(
        "AI knowledge documents loading error:",
        documentsError,
      );

      return NextResponse.json(
        {
          success: false,
          error: "Failed to load AI knowledge documents.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        documents: documents || [],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "AI knowledge listing error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load AI knowledge.",
      },
      { status: 500 },
    );
  }
}
