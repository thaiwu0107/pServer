import * as _ from 'lodash';
import 'reflect-metadata';
import { MemberRedis } from '../../config/MemberRedis';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import Utils from '../../utils/Utils';

@provide('MailRepository')
export default class MailRepository extends BaseRepository {
    constructor() { super(); }

    // 產生驗證碼
    public async getVerifyCode() {
        const code = Math.random().toString(36).slice(-5);
        return code;
    }

    // 寄出mail
    public async sendOutMail(playerMail, verifyCode) {
        const res = await this.mailManager.sendMail(playerMail, verifyCode);
        if (res === 1) {
            return res;
        }
        return 0;
    }

    // 新增Redis
    public async insertVerifyCodeToRedis(mail, verifyCode): Promise<any> {
        const key = MemberRedis.HASH_MEMBER_MAIL + mail;
        const pipeline = this.redisManger.pipeline();
        return pipeline
            .del(key)
            .append(key, verifyCode)
            .expire(key, 300)
            .exec();
    }
    // 驗證碼驗證
    public async verification(email, verycode): Promise<any> {
        const key = MemberRedis.HASH_MEMBER_MAIL + email;
        const code = await this.redisManger.get(key);
        console.log(code);
        if (code === verycode) {
            await this.redisManger.del(key);
            return 1;
        }
        return 0;
    }
    // 修改信箱
    public async modifyEmail(no, email): Promise<any> {
        const data = {
            c: 6,
            d: {
                no,
                email
            }
        };
        const res = await this.apiManager.httpPost('192.168.30.160/gbe/api/gateway.php', data, {Connection: 'close'});
        if (res.body.s) {
            return 'success';
        }
        // const data = await this.apiManager.httpPost(
        //     '127.0.0.1:3100/mock/modifyemail',
        //     {memberNo, mail}
        // );
        // if (data.body.status) {
        //     return data.body.status;
        // }
        return 0;
    }
}
