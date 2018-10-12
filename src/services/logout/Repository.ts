import * as _ from 'lodash';
import 'reflect-metadata';
import { GameRedis } from '../../config/GameRedis';
import { LobbyTexasRedis } from '../../config/LobbyTexasRedis';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import Transaction from '../../models/Transaction';

@provide('LogoutRepository')
export default class LogoutRepository extends BaseRepository {
    constructor() {
        super();
    }

    public async signOut(key, token): Promise<any> {
        return this.redisManger.hdel(key, token);
    }

    public async cleanRedis(deskID): Promise<any> {
        this.redisManger.del(
            GameRedis.HASH_DESKINFO + deskID,
            GameRedis.LIST_PLAYER_SIT + deskID,
            GameRedis.LIST_PLAYING_PLAYER + deskID,
            GameRedis.LIST_LOOK_PLAYER + deskID,
            GameRedis.LIST_PLAYER_POINT + deskID,
            GameRedis.LIST_PUBLIC_POKER + deskID,
            GameRedis.LIST_WEIGHT + deskID,
            GameRedis.LIST_WIN + deskID,
            GameRedis.LIST_PLAYER_ACTION + deskID,
            GameRedis.LIST_ROUND_WIN_PRICE + deskID,
            GameRedis.LIST_ONLINE_PLAYER + deskID,
            LobbyTexasRedis.HASH_STATUS + deskID,
            LobbyTexasRedis.HASH_RULE + deskID
        );
    }
    public async cleanDatabase(time, sessionId, trans: Transaction): Promise<any> {
        const del =
        'UPDATE porkerdb.table_status SET ts_status = 0 , ts_people = 0 , ts_end = ? where (ts_session = ?)';
        return this.sqlManager.query(del, [time, sessionId], trans);
    }
}
