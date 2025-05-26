import AppPromise from "@config/express";
import winston from "@utils/winston";
import cluster from "node:cluster";
import ENV from "@config/env";
import Router from "./router";
import os from "node:os";

const MAX_INSTANCES: number = 16;

if (cluster.isPrimary) {
    const numCPUs = os.cpus().length;
    const numInstances: number = Math.min(numCPUs, MAX_INSTANCES);
    winston.info(`Master process is running. Forking for ${numInstances} instances...`);

    // Fork workers
    for (let i = 0; i < numInstances; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker) => {
        winston.info(`Worker ${worker.process.pid} died. Forking a new worker...`);
        cluster.fork();
    });
} else {
    (async () => {
        const App = await AppPromise;

        App.use("/", Router);

        App.listen(ENV.PORT, () => {
            winston.info(`Server is running in ${ENV.NODE_ENV} mode on port ${ENV.PORT}`);
        });

        App.on("SIGINT", () => {
            winston.error(`Server off, SIGINT`);
            process.exit();
        });
    })();
}
