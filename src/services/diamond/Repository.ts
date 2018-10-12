import * as _ from 'lodash';
import 'reflect-metadata';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';

@provide('DiamondRepository')
export default class DiamondRepository extends BaseRepository {
    constructor() { super(); }
    // 儲值鑽石
    public async deposit(playerId, diamonds): Promise<any> {
        const data = await this.apiManager.httpPost('127.0.0.1:3100/mock/deposit', {playerId, diamonds});
        return data.body;
    }
    // 花費鑽石
    public async cost(playerId, diamonds): Promise<any> {
        const data = await this.apiManager.httpPost('127.0.0.1:3100/mock/cost', {playerId, diamonds});
        return data.body;
    }

    public async getDiamondLog(id): Promise<any> {
        const data = await this.apiManager.httpPost('127.0.0.1/log', {id});
        return data;
    }
}
