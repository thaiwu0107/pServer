import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameRedis } from '../../config/GameRedis';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import Utils from '../../utils/Utils';

@provide('GameRoundRepository')
export default class GameRoundRepository extends BaseRepository {
    constructor() { super(); }
    public async getPlayerRedisSession(memberId: string): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_PLAYERINFO + memberId, 'sessionRecordID');
        return res[0] || -33;
    }
    public async getDeskRedisSession(channelName: string): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_DESKINFO + channelName, 'sessionID');
        return res[0] || -99;
    }
    public async getRoundAction(playChannelName: string)
                : Promise<{playerAction, seatSpace, round, nowPlayer, playerSit, dhost}> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.lrange(GameRedis.LIST_PLAYER_ACTION + playChannelName, 0, -1);
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'seatSpace');
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'round');
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'nowPlayer');
        pipeline.lrange(GameRedis.LIST_PLAYER_SIT + playChannelName, 0, -1);
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'dHost');
        const res = await pipeline.exec();
        const [playerAction, seatSpace, round, nowPlayer, playerSit, dhost] = Utils.getPipelineData(res);
        return{
            playerAction,
            seatSpace,
            round,
            nowPlayer,
            playerSit: Utils.findPlaySitPosition(playerSit),
            dhost
        };
    }
    public async setnextPlayer(channelName: string, nextPlayer): Promise<any> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmset(GameRedis.HASH_DESKINFO + channelName, {
            nowPlayer: nextPlayer,
            countDownerControl: 1
        });
        return pipeline.exec();
    }
}
