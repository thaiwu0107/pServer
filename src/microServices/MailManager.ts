import { injectable } from 'inversify';
import * as log4js from 'koa-log4';
import * as nodemailer from 'nodemailer';
import mailConfig = require('../config/config.mail');

const _log = log4js.getLogger('MailManager');

export default class MailManager {
    public transporter: any;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: mailConfig.default.gmail.user,
                pass: mailConfig.default.gmail.pass
            }
        });
    }
    public async sendMail(usermail, verycode) {
        const options = {
            from: mailConfig.default.gmail.user,
            to: usermail,
            cc: '',
            bcc: '',
            subject: mailConfig.default.gmail.subject,
            text: '',
            html: '<h3>' + mailConfig.default.gmail.title + '</h3> <p>' + mailConfig.default.gmail.content_top
                + '<B>' + verycode + '</B>' + mailConfig.default.gmail.context_middle + '</p><p>' +
                mailConfig.default.gmail.context_bottom + '</p><p>' + mailConfig.default.gmail.team + '</p>'
        };
        this.transporter.sendMail(options, (error, info) => {
            if (error) {
                throw error;
            }
            console.log('Mail already sent: ' + info.response);
        });
        return 1;
    }
}
