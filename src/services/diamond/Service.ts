import * as _ from 'lodash';
import 'reflect-metadata';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import Repository from './Repository';

@provide('DiamondService')
export default class DiamondService extends BaseService {
    constructor(@inject('DiamondRepository') private repository: Repository) { super(); }
    // 儲值鑽石
    public async depositDiamonds(playerId, diamonds): Promise<any> {
        const res = await this.repository.deposit(playerId, diamonds);
        if (_.toNumber(res.status) === 1) {
            return {
                playerId: res.result.playerId,
                diamonds: res.result.diamonds
            };
        } else {
            throw new Exceptions(9001, 'deposit fail');
        }
    }
    // 花費鑽石
    public async costDiamonds(playerId, diamonds): Promise<any> {
        const res = await this.repository.cost(playerId, diamonds);
        if (_.toNumber(res.status) === 1) {
            return {
                playerId: res.result.playerId,
                diamonds: res.result.diamonds
            };
        } else {
            throw new Exceptions(9001, 'cost fail');
        }
    }

    public async getDiamondLog(playerId): Promise<any> {
        const res = await this.repository.getDiamondLog(playerId);
        if (_.size(res[0]) === 1) {
            return res[0];
        } else {
            throw new Exceptions(8008, 'cost fail');
        }
    }
}
