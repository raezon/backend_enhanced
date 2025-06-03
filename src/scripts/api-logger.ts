import { Application, Express } from "express";
import expressListEndpoints from "express-list-endpoints";
import chalk from "chalk";

const methodColors: Record<string, chalk.Chalk> = {
    GET: chalk.greenBright,
    POST: chalk.blueBright,
    PUT: chalk.yellowBright,
    DELETE: chalk.redBright,
    PATCH: chalk.magentaBright,
    OPTIONS: chalk.cyanBright,
    HEAD: chalk.whiteBright,
    // Add more HTTP methods if needed
};

const apiLogger = (app: Express|Application, PORT: number) => {
    const endpoints = expressListEndpoints(app);

    // Extract unique tags from `/api/:tag/...`
    const tags = Array.from(
        new Set(
            endpoints
                .map((e) => e.path.split("/")[2]) // 0:/, 1:api, 2:tag
                .filter((tag) => tag && !tag.startsWith(":")) // remove dynamic segments
        )
    );

    console.log("\n========= Welcome To ALLWA =========\n");
    console.log(chalk.blue(`- Server is running on port:`), PORT);
    console.log(chalk.red(`~> http://localhost:${PORT}/ <~`));
    console.log(chalk.gray(`~> http://localhost:${PORT}/docs <~`));
    console.log("\n====================================");

    let total = 0;

    tags.forEach((tag) => {
        console.log(chalk.cyan(`\n📁 Tag: ${tag}\n`));

        const filteredEndpoints = endpoints.filter((e) => e.path.startsWith(`/api/${tag}`));

        if (filteredEndpoints.length === 0) {
            console.log(chalk.red("No endpoints found for this tag."));
            return;
        }

        filteredEndpoints.forEach((endpoint) => {
            const methods = endpoint.methods.map((method) => {
                const colorFn = methodColors[method.toUpperCase()] || chalk.gray;
                return colorFn(method.padEnd(6));
            });
            console.log(`  ${methods.join(", ")}  ${chalk.hex("#d35400")(endpoint.path)}`);
            total += endpoint.methods.length;
        });
    });

    console.log("\n====================================");
    console.log(chalk.yellow(`- Total endpoints: ${total}`));
    console.log("====================================\n");
};

export default apiLogger;
