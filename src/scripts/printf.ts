import chalk from "chalk";

const printf = {
    error: (msg: string) => {
        console.log(chalk.bgRed.white.bold(" [ERROR] ") + " " + chalk.red(msg));
    },
    info: (msg: string) => {
        console.log(chalk.bgBlue.white.bold(" [INFO] ") + " " + chalk.blue(msg));
    },
    success: (msg: string) => {
        console.log(chalk.bgGreen.white.bold(" [SUCCESS] ") + " " + chalk.green(msg));
    },
    debug: (msg: string) => {
        console.log(chalk.bgMagenta.white.bold(" [DEBUG] ") + " " + chalk.magenta(msg));
    },
    warning: (msg: string) => {
        console.log(chalk.bgYellow.white.bold(" [WARNING] ") + " " + chalk.yellow(msg));
    },
};

export default printf;
