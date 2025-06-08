import printf from "@/scripts/printf";
import sgMail from "@sendgrid/mail";
import ENV from "./env";

sgMail.setApiKey(ENV.SENDGRID_API_KEY!);

export const sendPasswordResetEmail = async (email: string, token: string) => {
    const resetLink = `${ENV.FRONTEND_URL}/update-password`;

    const msg = {
        to: email,
        from: ENV.EMAIL_SENDER!,
        subject: "Password Reset Request",
        html: `
      <p>Here is your temporary password: <strong>${token}</strong></p>
      <p>Click below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
    `,
    };

    try {
        await sgMail.send(msg);
        console.log("Email sent");
    } catch (error) {
        printf.error(`Error caught in SEND GRID: ${JSON.stringify(error)}`);
        throw new Error("Failed to send email");
    }
};
