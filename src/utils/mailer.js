const nodemailer = require("nodemailer");
const crypto = require("crypto");
const ejs = require("ejs");
const path = require("path");

const sender = nodemailer.createTransport({
    service: "gmail", //smtp.gmail.com  //in place of service use host...
    secure: false, //true
    port: 25, //465
    auth: {
        user: "safiuwaheed2023@gmail.com",
        pass: "fyahqabttxaiejet",
    },
    tls: {
        rejectUnauthorized: false,
    },
});

const SendMail = (user) => {
    const { firstname, lastname, email, _id } = user;
    return new Promise((resolve, reject) => {
        crypto.randomBytes(32, (err, buffer) => {
            if (err) {
                reject(err);
            }
            const token = buffer.toString("hex");

            ejs.renderFile(
                path.resolve(__dirname, "../", "template/mail.ejs"),
                { firstname, lastname, email, _id, date: new Date().toDateString() },
                (err, template) => {
                    console.log("sending mail");
                    if (!err) {
                        console.log(" no error")
                        sender
                            .sendMail({
                                from: "'PLUTO Administrator' safiuwaheed2023@gmail.com",
                                subject: "Notification To Comfirm Email",
                                to: "waheedianho65@gmail.com",
                                html: template,
                            })
                            .then(() => {
                                console.log("email send succesfully");
                                resolve(true)
                            })
                            .catch((err) =>  console.log(err));
                    } else reject(err);

                }
            );
        });
    })
}


module.exports = SendMail