const nodemailer = require("nodemailer");
const {
    config
} = require("./database");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '', //no password on a public repo :)
        pass: ''
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
        'LINK: <a href="https://witty-shop.herokuapp.com' + activationlink + '"><strong>AKTYWUJ KONTO</strong></a><br><br>' +
        'Jeżeli uruchomiłeś/aś stronę na localhost, skorzystaj z <a href="localhost:8000' + activationlink + '"><strong>localhost:8000' + activationlink + '</strong></a><br><br>' +
        'Jeżeli nie zakładałeś/aś konta zignoruj ten mejl.'
    });
}

module.exports = { sendMail, sendActivationMail };