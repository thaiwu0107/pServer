import * as _ from 'lodash';
import * as moment from 'moment';
import 'reflect-metadata';
import { MemberRedis } from '../../config/MemberRedis';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import Utils from '../../utils/Utils';
@provide('ForgetRepository')
export default class ForgetRepository extends BaseRepository {
    constructor() { super(); }

    // 驗證碼驗證
    public async verification(account, verycode): Promise<any> {
        const key = MemberRedis.HASH_MEMBER_MAIL + account;
        const code = await this.redisManger.get(key);
        if (code === verycode) {
            await this.redisManger.del(key);
            return 1;
        }
        return 0;
    }

    // 忘記密碼 API
    public async forget(account, password): Promise<any> {
        const data = {
            c: 3,
            d: {
                account,
                password
            }
        };
        const res = await this.apiManager.httpPost('192.168.30.160/gbe/api/gateway.php', data, {Connection: 'close'});
        if (res.body.s === true) {
            return res.body.d;
        }
        // const res = await this.apiManager.httpPost('127.0.0.1:3100/mock/forget',
        // {account, password, platform, device, ip});
        // if (_.toNumber(res.body.status) === 1) {
        //     return res.body.result;
        // }
        return 0;
    }
}
