const nodemailer = require("nodemailer");
const { options } = require("../app");


const sendEmail = async(options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Efi Tsakiridou <efoula86@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions, 
    function(err, info){
      if(err){
        console.log(err)
      }else {
        console.log(info)
}});
};

module.exports = sendEmail
