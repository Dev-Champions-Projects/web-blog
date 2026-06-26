import { CronJob } from "cron";
import https from "https";

const job = new CronJob("*/5 * * * *", () => {
    https
        .get(`${process.env.BASE_URL}/api/health`, (res) => {
            if (res.statusCode === 200) {
                console.log("Ping successful");
            } else {
                console.log("Ping failed", res.statusCode);
            }
        })
        .on("error", (e) => console.error("Error while sending request", e));
});

export default job;
