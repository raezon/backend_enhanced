import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendPasswordResetEmail = async (email: string, token: string) => {
    const resetLink = `${process.env.FRONTEND_URL}/update-password?token=${token}`;

    const msg = {
        to: email,
        from: process.env.EMAIL_SENDER!,
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
        console.error("SendGrid error:", error);
        throw new Error("Failed to send email");
    }
};
