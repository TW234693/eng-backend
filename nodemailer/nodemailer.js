const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "feast.234693@gmail.com",
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

async function sendActivationEmail(fullname, email, activationLink, locale) {
  console.log(fullname, email, activationLink);
  const inPolish = locale === "pl";
  const subject = inPolish
    ? "FeAST - Aktywacja konta"
    : "FeAST - Account activation";
  const heading = inPolish
    ? `Dziękujemy za utworzenie konta na platformie FeAST, ${fullname}!`
    : `Thank you ${fullname} for creating an account on the FeAST platform!`;
  const p1 = inPolish
    ? "Aby ukończyć rejestrację musisz aktywować swoje konto."
    : "To complete your registration you must activate the account.";
  const p2 = inPolish
    ? "Proszę kliknąć w poniższy link."
    : "Please click on the link below.";
  const anchor = inPolish ? "Aktywuj konto" : "Activate the acco`unt";

  const info = await transporter.sendMail({
    from: '"FeAST" <feast.234693@gmail.com>', // sender address
    to: email,
    subject: subject,
    html: `<div>
            <h3>${heading}</h3>
            <p>${p1}</p>
            <p>${p2}</p>
            <a href="${activationLink}">${anchor}</a>
        </div>`,
  });

  console.log("Message sent: %s", info.messageId);
}

module.exports = {
  sendActivationEmail,
};
