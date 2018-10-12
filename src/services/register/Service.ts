import * as geoip from 'geoip-lite';
import { sign } from 'jsonwebtoken';
import * as _ from 'lodash';
import 'reflect-metadata';
import config from '../../config/config.app';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import Utils from '../../utils/Utils';
import Repository from './Repository';
@provide('RegisterServer')
export default class RegisterServer extends BaseService {
    constructor(@inject('RegisterRepository') private repository: Repository) { super(); }

    public async register(account, verycode, password, platform, device, ip, browser): Promise<any> {
        const verify = await this.repository.verification(account, verycode);
        if (verify === 0) {
            throw new Exceptions(8002, 'verification fail');
        }
        const geo = geoip.lookup('118.163.216.85');
        // const geo = geoip.lookup(ip);
        const location = geo.country;
        const res = await this.repository.register(account, password, platform, device, ip, browser, location);
        if (res === 0) {
            throw new Exceptions(8001, 'register fail');
        } else {
            const result = await this.repository.normalLoginToLobby(account, password, platform, device,
                ip, browser, location);
            const time = await this.repository.getDBCurrentTime();
            const token = await sign({
                id: Utils.Encryption_AES_ECB_128(_.toString(result.no)),
                nickName: result.nickname,
                realName: result.realname,
                lastLoginTime: time
            }, config.jwt.privateKey, {
                expiresIn: config.jwt.expired
            });
            const key = await this.repository.insertRedis(token, _.toNumber(result.no), time);
            return {account, token, key};
        }
    }
}
