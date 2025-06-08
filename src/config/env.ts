import dotenv from "dotenv";
import Joi from "joi";

// in case of testing environment, we will use the mock env variables
(() => {
    if (process.env.NODE_ENV === "test") {
        dotenv.config({ path: ".env.test" });
    } else {
        dotenv.config({ path: ".env" });
    }
})();

const envSchemaObject = Joi.object({
    PORT: Joi.number().default(3000),
    NODE_ENV: Joi.string().valid("development", "production", "test").default("development"),
    DATABASE_URL: Joi.string().uri().required(),
    RATE_LIMIT_DATABASE_URL: Joi.string().uri().required(),
    JWT_SECRET: Joi.string().required(),
    SMTP_SERVICE: Joi.string().required(),
    SMTP_USER: Joi.string().required(),
    SMTP_PASS: Joi.string().required(),
    TOKEN_HIDEOUT: Joi.string().required(),
    AUTH_BEARER: Joi.string().required(),
    REFRESH_HIDEOUT: Joi.string().required(),
    REFRESH_BEARER: Joi.string().required(),
    SENDGRID_API_KEY: Joi.string().required(),
    FRONTEND_URL: Joi.string().uri().required(),
    EMAIL_SENDER: Joi.string().email().required(),
}).unknown(true);

const { error, value } = envSchemaObject.validate(process.env, {
    abortEarly: false,
});

if (error) {
    console.error("Error in the ENV validation");
    (error.details as { message: string }[]).forEach((detail: { message: string }) => {
        console.error(`  - ${detail.message}`);
    });
    process.exit(1);
}

const ENV = {
    PORT: value.PORT,
    NODE_ENV: value.NODE_ENV,
    DATABASE_URL: value.DATABASE_URL,
    JWT_SECRET: value.JWT_SECRET,
    SMTP: {
        SERVICE: value.SMTP_SERVICE,
        USER: value.SMTP_USER,
        PASS: value.SMTP_PASS,
    },
    REDIS: {
        RATE_LIMIT_DATABASE_URL: value.RATE_LIMIT_DATABASE_URL,
    },
    TOKEN_HIDEOUT: value.TOKEN_HIDEOUT,
    AUTH_BEARER: value.AUTH_BEARER,
    REFRESH_HIDEOUT: value.REFRESH_HIDEOUT,
    REFRESH_BEARER: value.REFRESH_BEARER,
    SENDGRID_API_KEY: value.SENDGRID_API_KEY,
    FRONTEND_URL: value.FRONTEND_URL,
    EMAIL_SENDER: value.EMAIL_SENDER,
};

export default ENV;
