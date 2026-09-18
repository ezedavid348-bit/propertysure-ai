import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Supabase server configuration is missing.",
        },
        { status: 500 }
      );
    }

    const authorization =
      request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const accessToken =
      authorization.replace("Bearer ", "");

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the currently logged-in user
    const {
      data: { user },
      error: userError,
    } =
      await supabaseAdmin.auth.getUser(
        accessToken
      );

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid authentication.",
        },
        { status: 401 }
      );
    }

    // Confirm that the user is an administrator
    const { data: admin, error: adminError } =
      await supabaseAdmin
        .from("admin_users")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

    if (adminError) {
      console.error(
        "Admin access check failed:",
        adminError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to verify administrator access.",
        },
        { status: 500 }
      );
    }

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Administrator access required.",
        },
        { status: 403 }
      );
    }

    // Retrieve registered users from Supabase Auth
    const allUsers = [];

    let page = 1;

    const perPage = 1000;

    while (true) {
      const {
        data,
        error: listError,
      } =
        await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage,
        });

      if (listError) {
        console.error(
          "Unable to list users:",
          listError
        );

        return NextResponse.json(
          {
            success: false,
            error: listError.message,
          },
          { status: 500 }
        );
      }

      const pageUsers = data.users || [];

      allUsers.push(
        ...pageUsers.map((authUser) => ({
          id: authUser.id,

          email: authUser.email ?? null,

          created_at: authUser.created_at,

          last_sign_in_at:
            authUser.last_sign_in_at ?? null,

          email_confirmed_at:
            authUser.email_confirmed_at ?? null,
        }))
      );

      // Stop when the current page contains fewer
      // users than the requested page size.
      if (pageUsers.length < perPage) {
        break;
      }

      page += 1;
    }

    return NextResponse.json({
      success: true,
      users: allUsers,
    });
  } catch (error) {
    console.error(
      "Unexpected admin users API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to load users.",
      },
      { status: 500 }
    );
  }
}