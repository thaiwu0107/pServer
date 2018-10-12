import * as _ from 'lodash';
import * as moment from 'moment';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameRedis } from '../../config/GameRedis';
import { MemberRedis } from '../../config/MemberRedis';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import Utils from '../../utils/Utils';

@provide('LoginRepository')
export default class LoginRepository extends BaseRepository {

    constructor() { super(); }

    public async normalLoginToLobby(account, password, platform, device, ip, browser, location): Promise<any> {
        const data = {
            c: 1,
            d: {
                account,
                password,
                platform,
                device,
                ip,
                browser,
                location
            }
        };
        const res = await this.apiManager.httpPost('192.168.30.160/gbe/api/gateway.php', data, {Connection: 'close'});
        if (res.body.s === true) {
            return res.body.d;
        }
        // const data = await this.apiManager.httpPost('127.0.0.1:3100/mock/normal',
        // {account, password, ip, platform, device});
        // if (_.toNumber(data.body.status) === 1) {
        //     return data.body.result;
        // }
        return 0;
    }

    public async quickLoginToLobby(id, ip, platform, device, browser, location): Promise<any> {
        const data = {
            c: 1,
            d: {
                no: id,
                platform,
                device,
                ip,
                browser,
                location
            }
        };
        const res = await this.apiManager.httpPost('192.168.30.160/gbe/api/gateway.php', data, {Connection: 'close'});
        if (res.body.s === true) {
            return res.body.d;
        }
        // const data = await this.apiManager.httpPost('127.0.0.1:3100/mock/quick', {id});
        // if (_.toNumber(data.body.status) === 1) {
        //     return data.body.result;
        // }
        return 0;
    }

    public async visitorLoginToLobby(platform, device, ip): Promise<any> {
        const data = await this.apiManager.httpPost('127.0.0.1:3100/mock/visitor', {platform, device, ip});
        if (_.toNumber(data.body.status) === 1) {
            return data.body.result;
        }
        return 0;
    }

    public async insertRedis(token, id, realname, nickname, time): Promise<any> {
        const key = MemberRedis.HASH_MEMBER_BARREL + Utils.findBarrel(_.toNumber(id));
        const data = {};
        data[token] = Utils.DBTimeFormat(moment(time).add(5, 'days').toDate());
        await this.redisManger.hmsetObject(key, data);
        return key;
    }

    public async checkTokenExist(key, token): Promise<any> {
        const tokenExist = await this.redisManger.hexists(key, token);
        if (_.toNumber(tokenExist) === 0) {
            return 0;
        }
        return 1;
    }

    public async initPlayer(nickName: string, gamePoint: string, memberId: number, diamond): Promise<any> {
        const pipeline = this.redisManger.pipeline();
        return pipeline
            .del(GameRedis.LIST_POKER + memberId, GameRedis.HASH_PLAYERINFO + memberId)
            .hmset(GameRedis.HASH_PLAYERINFO + memberId, {
                table: -1,
                sessionRecordID: -1,
                roundStatusID: -1,
                channelName: '',
                seat: -1,
                nickName,
                amount: gamePoint,
                handsAmount: -1,
                costTime: 0,
                diamond,
                bet: -1,
                action: Constant.STATUS_LOOK,
                countDown: -1,
                deskBetPool: -1,
                insurance: -1
            })
            .rpush(GameRedis.LIST_POKER + memberId, -1, -1)
            .exec();
    }
}
