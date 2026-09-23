import app from "./app";
import { logger } from "./lib/logger";
import { seedAllCases } from "./routes/admin";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Auto-seed investigation cases on startup
  try {
    const result = await seedAllCases(false);
    if (result.casesSeeded > 0) {
      logger.info(result, "Auto-seeded investigation cases");
    }
  } catch (err) {
    logger.warn({ err }, "Auto-seed failed (non-fatal)");
  }
});
