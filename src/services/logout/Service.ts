import * as _ from 'lodash';
import 'reflect-metadata';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import Transaction from '../../models/Transaction';
import Repository from './Repository';

@provide('LogoutServer')
export default class Service extends BaseService {
    constructor(@inject('LogoutRepository') private repository: Repository) { super(); }

    public async closeDesk(deskId, sessionId): Promise<any> {
        const time = await this.repository.getDBCurrentTime();
        const trans = new Transaction();
        await trans.begin();
        try {
            await this.repository.cleanDatabase(time, sessionId, trans);
            await trans.commit();
            await this.repository.cleanRedis(deskId);
        } catch (error) {
            await trans.rollback();
            throw error;
        }
    }

    public async signOut(key, token): Promise<any> {
        const res = await this.repository.signOut(key, token);
        if (_.toNumber(res) === 0) {
            throw new Exceptions(9001, 'sign out fail');
        } else {
            return {
                msssage: 'success'
            };
        }
    }
}
