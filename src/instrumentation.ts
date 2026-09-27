// Runs once at server startup (not during `next build`).
// Fail fast in production if AUTH_SECRET is missing or still the dev default,
// so the app can never run publicly with a known session-signing secret.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const secret = process.env.AUTH_SECRET;
    const isDefault =
      !secret || secret === "shore-academy-dev-secret-change-me-32b";
    if (process.env.NODE_ENV === "production" && isDefault) {
      throw new Error(
        "[shore-academy] FATAL: AUTH_SECRET is not set (or is the dev default). " +
          "Set AUTH_SECRET to a long random string before running in production."
      );
    }
  }
}
