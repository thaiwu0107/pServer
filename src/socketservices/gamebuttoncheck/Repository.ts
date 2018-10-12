import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameRedis } from '../../config/GameRedis';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import Utils from '../../utils/Utils';

@provide('GameButtonCheckRepository')
export default class GameButtonCheckRepository extends BaseRepository {
    constructor() { super(); }
    public async getPlayerRedisSession(memberId): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_PLAYERINFO + memberId, 'sessionRecordID');
        return res[0] || -33;
    }
    public async getDeskRedisSession(channelName): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_DESKINFO + channelName, 'sessionID');
        return res[0] || -99;
    }
    public async getDeskInfo(playChannelName: string): Promise<{frontMoney, nowPlayer}> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'frontMoney');
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'nowPlayer');
        const res = await pipeline.exec();
        const [frontMoney, nowPlayer] = Utils.getPipelineData(res);
        return{
            frontMoney,
            nowPlayer
        };
    }

    public async getPlayerInfo(playerID: string): Promise<{seat, action}> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmget(GameRedis.HASH_PLAYERINFO + playerID, 'seat');
        pipeline.hmget(GameRedis.HASH_PLAYERINFO + playerID, 'action');
        const res = await pipeline.exec();
        const [seat, action] = Utils.getPipelineData(res);
        return {
            seat,
            action
        };
    }
    public async dealPlayer(playerID: string): Promise <any> {
        return this.redisManger.hmset(GameRedis.HASH_PLAYERINFO + playerID, 'action', Constant.STATUS_CHECK);
    }
    public async dealDesk(playChannelName: string, playerSeat: number) {
        const pipeline = await this.redisManger.pipeline();
        pipeline.lset(GameRedis.LIST_PLAYER_ACTION + playChannelName, playerSeat, Constant.PLAYER_ACTION_CHECK);
        pipeline.lset(GameRedis.LIST_WEIGHT + playChannelName, playerSeat, Constant.PLAYER_FOLD_WEIGHT);
        pipeline.del(GameRedis.LIST_COUNT_DOWNER + playChannelName);
        return pipeline.exec();
    }
}
