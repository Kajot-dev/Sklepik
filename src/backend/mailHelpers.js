const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'witty.shop.noreply@gmail.com',
        pass: 'zRAV7_qguFS7FLR'
    }
});

function sendMail({ to, html, subject }) {
    return transporter.sendMail({
        from: "witty.shop.noreply@gmail.com",
        to: to,
        subject: subject,
        html: html
    });
}

function sendActivationMail({ mail, nick, activationlink }) {
    return sendMail({
        to: mail,
        subject: "Aktywacja konta na witty-shop.herokuapp.com",
        html: "<h1>Witaj " + nick + "!</h1>\n" +
        'Poniżej znajdziesz link atywacyjny do konta na <a href="witty-shop.herokuapp.com" target="_blank">Witty-shop</a><br><br>' +
        'LINK: <a href="witty-shop.herokuapp.com' + activationlink + '"><strong>AKTYWUJ KONTO</strong></a><br><br>' +
        'Jeżeli nie zakładałeś/aś konta zignoruj ten mejl.'
    });
}

module.exports ={ sendMail, sendActivationMail };