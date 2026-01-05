import cron from "node-cron";
import { initializeLeaveBalancesForYear } from "../utils/initializeLeveBalancesForYear";

// Scheduled a job to run at midnight on Jan 1 every year
cron.schedule("0 0 1 1 *", async () => {
  try {
    const year = new Date().getFullYear();
    console.log(`[${new Date().toISOString()}] Running yearly leave balance initializer for ${year}`);
    await initializeLeaveBalancesForYear(year);
    console.log(`[${new Date().toISOString()}] Leave balances initialized for ${year}`);
  } catch (error) {
    console.error("Error initializing leave balances:", error);
  }
});
