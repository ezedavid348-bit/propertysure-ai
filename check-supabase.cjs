const fs = require("node:fs");
const { createClient } = require("@supabase/supabase-js");

async function main() {
  const envText = fs.readFileSync(".env.local", "utf8");

  const env = {};

  for (const line of envText.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;

    let value = match[2].trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[match[1]] = value;
  }

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey =
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serverKey = env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("=== PropertySure AI Testing Diagnostic ===");

  console.log("URL configured:", Boolean(url));
  console.log("Publishable key configured:", Boolean(publicKey));
  console.log("Server key configured:", Boolean(serverKey));

  if (!url || !publicKey || !serverKey) {
    console.log("RESULT: Missing configuration.");
    return;
  }

  const options = {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  };

  for (const [name, key] of [
    ["Publishable", publicKey],
    ["Server", serverKey],
  ]) {
    try {
      const client = createClient(url, key, options);

      const { error } = await client
        .from("admin_users")
        .select("user_id")
        .limit(1);

      if (error) {
        console.log(
          name + " connection:",
          "FAILED",
          "HTTP " + (error.code || "unknown"),
          error.message
        );
      } else {
        console.log(name + " connection: SUCCESS");
      }
    } catch (error) {
      console.log(
        name + " connection: FAILED",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  console.log("Diagnostic completed.");
}

main().catch(() => {
  console.log("Diagnostic failed. Check your environment file.");
});
