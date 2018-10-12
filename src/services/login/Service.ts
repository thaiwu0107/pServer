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

@provide('LoginServer')
export default class Service extends BaseService {
    constructor(@inject('LoginRepository') private repository: Repository) { super(); }

    public async normalLoginCheck(account, password, ip, platform, device, browser): Promise<any> {
        const geo = geoip.lookup('118.163.216.85');
        // const geo = geoip.lookup(ip);
        const location = geo.country;
        const res = await this.repository.normalLoginToLobby(account, password, platform, device,
            ip, browser, location);
        const time = await this.repository.getDBCurrentTime();
        if (res === 0) {
            throw new Exceptions(8001, 'login fail');
        } else {
            const token = await sign({
                id: Utils.Encryption_AES_ECB_128(_.toString(res.no)),
                nickName: res.nickname,
                realName: res.realname,
                lastLoginTime: time
            }, config.jwt.privateKey, {
                expiresIn: config.jwt.expired
            });
            const key = await this.repository.insertRedis(token, res.no, res.realname, res.nickname, time);
            await this.repository.initPlayer(res.nickname, res.chip, _.toNumber(res.no), res.diamond);
            return {account, key, token};
        }
    }

    public async quickLoginCheck(id, key, token, ip, platform, device, browser): Promise<any> {
        const geo = geoip.lookup('118.163.216.85');
        // const geo = geoip.lookup(ip);
        const location = geo.country;
        const tokenExist = await this.repository.checkTokenExist(key, token);
        if (tokenExist === 0) {
            throw new Exceptions(8075, 'token not exist');
        }
        const res = await this.repository.quickLoginToLobby(id, ip, platform, device, browser, location);
        if (res === 0) {
            throw new Exceptions(8001, 'login fail');
        }
        // 初始化玩家 (暱稱、籌碼、玩家編號、鑽石)
        await this.repository.initPlayer(res.nickname, res.point, res.no, res.diamond);
        return {
            msssage: 'success'
        };
    }

    public async visitorLoginCheck(platform, device, ip): Promise<any> {
        const res = await this.repository.visitorLoginToLobby(platform, device, ip);
        const time = await this.repository.getDBCurrentTime();
        if (res === 0) {
            throw new Exceptions(8001, 'login fail');
        } else {
            const token = await sign({
                id: res.id,
                nickName: res.nickname,
                realName: res.realname,
                lastLoginTime: time
            }, config.jwt.privateKey, {
                expiresIn: config.jwt.expired
            });
            res.token = token;
            res.key = await this.repository.insertRedis(token, res.id, res.realname, res.nickname, time);
            await this.repository.initPlayer(res.nickname, res.chip, res.id, res.diamond);
            return res;
        }
    }
}
