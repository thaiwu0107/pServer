import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameRedis } from '../../config/GameRedis';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import Utils from '../../utils/Utils';

@provide('GameButtonAllinRepository')
export default class GameButtonAllinRepository extends BaseRepository {
    constructor() { super(); }
    public async getPlayerRedisSession(memberId: string): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_PLAYERINFO + memberId, 'sessionRecordID');
        return res[0] || -33;
    }
    public async getDeskRedisSession(channelName: string): Promise<any> {
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
            frontMoney: frontMoney[0],
            nowPlayer: nowPlayer[0]
        };
    }
    public async getPlayerInfo(playerID: string): Promise<{seat, action, handsAmount}> {
        //   getPlayerInfo() =>
        //   {"seat":{"0":"3"},"action":{"0":"99"},"handsAmount":{"0":"6666"}}
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmget(GameRedis.HASH_PLAYERINFO + playerID, 'seat');
        pipeline.hmget(GameRedis.HASH_PLAYERINFO + playerID, 'action');
        pipeline.hmget(GameRedis.HASH_PLAYERINFO + playerID, 'handsAmount');
        const res = await pipeline.exec();
        const [seat, action, handsAmount] = Utils.getPipelineData(res);
        return {
            seat: seat[0],
            action: action[0],
            handsAmount: handsAmount[0]
        };
    }
    public async getBet(playChannelName, playerID: string, handsAmount): Promise<any> {
        await this.redisManger.hincrbyfloat(GameRedis.HASH_FRONT_BET + playChannelName, playerID, handsAmount);
        return this.redisManger.hmget(GameRedis.HASH_FRONT_BET + playChannelName, playerID);
    }
    public async getAllPlayerInfo(playChannelName): Promise<{frontBet, playerSit, playerAction}> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hgetall(GameRedis.HASH_FRONT_BET + playChannelName);
        pipeline.lrange(GameRedis.LIST_PLAYER_SIT + playChannelName, 0, -1);
        pipeline.lrange(GameRedis.LIST_PLAYER_ACTION + playChannelName, 0, -1);
        const res = await pipeline.exec();
        const [frontBet, playerSit, playerAction] = Utils.getPipelineData(res);
        return {
            frontBet,
            playerSit,
            playerAction
        };
    }
    public async setPlayerInfo(playerID: string, handsAmount): Promise<any> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmset(GameRedis.HASH_PLAYERINFO + playerID, {
            handsAmount: 0,
            bet: handsAmount,
            action: Constant.STATUS_ALLIN
        });
        return pipeline.exec();
    }
    public async setDeskInfo(playChannelName: string, handsAmount, position: number, needChangePlayer): Promise<any> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmset(GameRedis.HASH_DESKINFO + playChannelName, {
            frontMoney: handsAmount,
            countDownerControl: 0
        });
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < needChangePlayer.length; i++) {
            pipeline.lset(GameRedis.LIST_PLAYER_ACTION + playChannelName, needChangePlayer[i], 0);
        }
        pipeline.hincrbyfloat(GameRedis.HASH_DESKINFO + playChannelName, 'deskMoney', handsAmount);
        pipeline.lset(GameRedis.LIST_PLAYER_ACTION + playChannelName, position, Constant.PLAYER_ACTION_ALLIN);
        pipeline.sadd(GameRedis.LIST_ALLIN_BET + playChannelName, handsAmount);
        pipeline.lset(GameRedis.LIST_PLAYER_POINT + playChannelName, position, 0);
        return pipeline.exec();
    }
}
