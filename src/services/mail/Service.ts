import { sign } from 'jsonwebtoken';
import * as _ from 'lodash';
import 'reflect-metadata';
import config from '../../config/config.app';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import Repository from './Repository';
@provide('MailServer')
export default class MailServer extends BaseService {
    constructor(@inject('MailRepository') private repository: Repository) { super(); }

    public async sendMail(playerMail): Promise<any> {
        const verifyCode = await this.repository.getVerifyCode();
        console.log('verifyCode', verifyCode);
        await this.repository.insertVerifyCodeToRedis(playerMail, verifyCode);
        const res = await this.repository.sendOutMail(playerMail, verifyCode);
        if (res === 0) {
            throw new Exceptions(9999, 'mail sent error');
        } else {
            return res;
        }
        // if (res === 0) {
        //     throw new Exceptionss(8001, 'register fail');
        // } else {
        //     const result = await this.repository.normalLoginToLobby(account, password, ip, platform, device);
        //     const time = await this.repository.getDBCurrentTime();
        //     const token = await sign({
        //         id: result.id,
        //         nickName: result.nickname,
        //         realName: result.realname,
        //         lastLoginTime: time
        //     }, config.jwt.privateKey, {
        //         expiresIn: config.jwt.expired
        //     });
        //     result.token = token;
        //     result.key = await this.repository.insertRedis(token, result.id, result.realname, result.nickname, time);
        //     return result;
        // }
    }
    // 修改信箱
    public async modifyEmail(memberNo, email, verycode): Promise<any> {
        // 驗證信箱
        const res = await this.repository.verification(email, verycode);
        if (res === 0) {
            throw new Exceptions(9999, 'mail verification error');
        } else {
            const result = await this.repository.modifyEmail(memberNo, email);  // 驗證成功才執行修改信箱
            if (result === 0) {
                throw new Exceptions(9001, 'API server error');
            } else {
                return result;
            }
        }
    }

}
