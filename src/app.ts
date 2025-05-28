import AppPromise from "@config/express";
import winston from "@utils/winston";
import ENV from "@config/env";
import Router from "./router";
import main from "@/seeders/seed";

(async () => {
    const App = await AppPromise;
    await main();
    // Define a route
    App.use("/", Router);
    // Start the server
    if (ENV.NODE_ENV !== "test") {
        App.listen(ENV.PORT, () => {
            winston.info(`Server is running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
        });
    }

    App.on("SIGINT", () => {
        winston.error(`Server off, SIGINT`);
        process.exit();
    });
})();

export default AppPromise;
