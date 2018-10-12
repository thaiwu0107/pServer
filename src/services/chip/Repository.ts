import * as _ from 'lodash';
import 'reflect-metadata';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';

@provide('ChipRepository')
export default class ChipRepository extends BaseRepository {
    constructor() { super(); }

    public async give(managerId, playerId, chips): Promise<any> {
        const data = await this.apiManager.httpPost('127.0.0.1:3100/mock/give', {managerId, playerId, chips});
        return data.body;
    }

    public async takeBack(managerId, playerId, chips): Promise<any> {
        const data = await this.apiManager.httpPost('127.0.0.1:3100/mock/takeback', {managerId, playerId, chips});
        return data.body;
    }

    public async settlement(playerId, chips): Promise<any> {
        const data = await this.apiManager.httpPost('127.0.0.1:3100/mock/settlement', {playerId, chips});
        return data.body;
    }

    public async getChipLog(id): Promise<any> {
        const data = await this.apiManager.httpPost('127.0.0.1/log', {id});
        return data;
    }
}
