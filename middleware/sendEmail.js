const nodemailer = require('nodemailer');



//here we are using mailtrap for testing purpose

exports.sendEmail = async (options) => {
    var transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "aa91667ee1b55c",
          pass: "5b240de4f26298"
        }
      });
    
    const mailOption = {
        from: process.env.SMTP_EMAIL,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };
    
  await transporter.sendMail(mailOption);
    
   
};