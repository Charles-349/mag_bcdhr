import cron from "node-cron";
import { runLeaveYearRollover } from "../leaveRollover/leaveRollover.service";

// Runs every year on Jan 1st at 00:05
cron.schedule("5 0 1 1 *", async () => {
  console.log("Year-end leave rollover cron started");
  await runLeaveYearRollover();
});
