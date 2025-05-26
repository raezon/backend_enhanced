import nodemailer, { Transporter, SendMailOptions, SentMessageInfo } from "nodemailer";
import ENV from "@config/env";

class SMTP {
    private static instance: SMTP;
    private transporter: Transporter;

    private constructor() {
        this.transporter = nodemailer.createTransport({
            service: ENV.SMTP.SERVICE,
            auth: {
                user: ENV.SMTP.USER,
                pass: ENV.SMTP.PASS,
            },
        });

        Object.freeze(this);
    }

    static getInstance(): SMTP {
        if (!SMTP.instance) {
            SMTP.instance = new SMTP();
        }
        return SMTP.instance;
    }

    sendMail(to: string, subject: string, text: string, html?: string): Promise<SentMessageInfo> {
        const mailOptions: SendMailOptions = {
            from: ENV.SMTP.USER,
            to,
            subject,
            text,
            html,
        };

        return this.transporter.sendMail(mailOptions);
    }
}

const smtpInstance: SMTP = SMTP.getInstance();
Object.freeze(smtpInstance);

export default smtpInstance;
