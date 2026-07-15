process.env.DEMO_MODE = "true";
process.env.NEXT_PUBLIC_SITE_URL = "http://127.0.0.1:3000";
process.env.NEXT_TELEMETRY_DISABLED = "1";
process.argv = [process.argv[0], "next", "start", "--hostname", "127.0.0.1"];
await import("../node_modules/next/dist/bin/next");
