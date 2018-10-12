import * as _ from 'lodash';
import 'reflect-metadata';
import { inject, provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';

@provide('LobbyRepository')
export default class LobbyRepository extends BaseRepository {
    constructor() { super(); }
    public async createSession(): Promise<any> {
        //
    }
}
