const nodemailer = require("nodemailer");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.name;
    this.from = "no-reply@insta.com";
    this.url = url;
  }

  newTransporter() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    const mailOptions = {
      to: this.to,
      from: this.from,
      subject: subject,
      html: template,
    };
    await this.newTransporter().sendMail(mailOptions);
  }

  async sendwelcome() {
    await this.send(
      "<h1>welcome to instagram</h1>",
      "you are succesfully sign up to owr site"
    );
  }
  async sendResetPasswordToken() {
    await this.send(
      `<h3><a href=${this.url}>link to reset Password</a></h3>`,
      "link to reset password"
    );
  }
};
