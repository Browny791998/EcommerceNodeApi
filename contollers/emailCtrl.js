const nodemailer = require('nodemailer');

const sendEmail = async (data) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.MAIL_ID,
            pass: process.env.MP,
        },
    });

    await transporter.sendMail({
        from: `"Ecommerce" <${process.env.MAIL_ID}>`,
        to: data.to,
        subject: data.subject,
        text: data.text,
        html: data.html,
    });
};

module.exports = sendEmail;