import * as _ from 'lodash';
import 'reflect-metadata';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import Repository from './Repository';

@provide('ChipService')
export default class ChipService extends BaseService {
    constructor(@inject('ChipRepository') private repository: Repository) { super(); }
    // 發放籌碼
    public async giveChips(managerId, playerId, chips): Promise<any> {
        const res = await this.repository.give(managerId, playerId, chips);
        if (_.toNumber(res.status) === 1) {
            return {
                managerId: res.result.managerId,
                playerId: res.result.playerId,
                chips: res.result.chips
            };
        } else {
            throw new Exceptions(9001, 'give chips fail');
        }
    }
    // 收回籌碼
    public async takeBackChips(managerId, playerId, chips): Promise<any> {
        const res = await this.repository.takeBack(managerId, playerId, chips);
        if (_.toNumber(res.status) === 1) {
            return {
                managerId: res.result.managerId,
                playerId: res.result.playerId,
                chips: res.result.chips
            };
        } else {
            throw new Exceptions(9001, 'take back chips fail');
        }
    }
    // 結算籌碼
    public async settlementChips(playerId, chips): Promise<any> {
        const res = await this.repository.settlement(playerId, chips);
        console.log('[res]', res.result);
        if (_.toNumber(res.status) === 1) {
            return {
                result: res.result
            };
        } else {
            throw new Exceptions(9001, 'settlement chips fail');
        }
    }

    public async getChipLog(playerId): Promise<any> {
        const res = await this.repository.getChipLog(playerId);
        if (_.size(res[0]) === 1) {
            return res;
        } else {
            throw new Exceptions(8011, 'settlement chips fail');
        }
    }
}
