import app from "./index"
import { initializeLeaveBalancesForYear } from "./utils/initializeLeveBalancesForYear";


const currentYear = new Date().getFullYear();
initializeLeaveBalancesForYear(currentYear)
  .then(() => console.log(`[Server] Leave balances initialized for ${currentYear}`))
  .catch((err) => console.error(err));


app.listen(8081, ()=>{
    console.log("server running on http://localhost:8081");
})