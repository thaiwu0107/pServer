import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameRedis } from '../../config/GameRedis';
import { GameSend } from '../../config/GameSend';
import { inject, provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import Exceptions from '../../models/Exceptions';
import PlayerRecordEntity from '../../models/PlayerRecordEntity';
import Utils from '../../utils/Utils';

@provide('GameSelectSeatRepository')
export default class GameSelectSeatRepository extends BaseRepository {
    constructor() { super(); }

    public async playTakeSit(channelName, position, playerID, point, remainAmount, playerCountDown): Promise<any> {
        const pipeline = await this.redisManger.pipeline();
        return pipeline
        .lset(GameRedis.LIST_PLAYER_SIT + channelName, position, playerID)
        .hmset(GameRedis.HASH_PLAYERINFO + playerID, {
            seat: position,
            handsAmount: point,
            amount: remainAmount,
            countDown: playerCountDown
        })
        .hincrby(GameRedis.HASH_DESKINFO + channelName, 'deskPeople', 1)
        .lset(GameRedis.LIST_PLAYING_PLAYER + channelName, position, playerID)
        .lset(GameRedis.LIST_PLAYER_POINT + channelName, position, point)
        .hmset(GameRedis.HASH_FRONT_BET + channelName, playerID, 0)
        .exec();
    }
    public async getPlaySit(channelName): Promise<number[]> {
        return this.redisManger.lrange(GameRedis.LIST_PLAYER_SIT + channelName, 0, -1);
    }
    // 拿全部桌子資料
    public async getDeskInfo(playChannelName: string): Promise<{
        deskStatus,
        dHost,
        dbig,
        dsmall,
        frontmoney,
        deskMoney,
        round,
        playerSit,
        publicPoker,
        playerAction,
        playerPoint}> {
        const pipeline = await this.redisManger.pipeline();
        const aa = await pipeline   // [null,[0,0,0,0,0,0,0]]
        .hgetall(GameRedis.HASH_DESKINFO + playChannelName)
        .lrange(GameRedis.LIST_PLAYER_SIT + playChannelName, 0, -1)
        .lrange(GameRedis.LIST_PUBLIC_POKER + playChannelName, 0, -1)
        .lrange(GameRedis.LIST_PLAYER_ACTION + playChannelName, 0, -1)
        .lrange(GameRedis.LIST_PLAYER_POINT + playChannelName, 0, -1)
        .exec();
        const [deskInfo,
            playerSit,
            publicPoker,
            playerAction,
            playerPoint] = Utils.getPipelineData(aa);
        return {
            deskStatus: deskInfo.deskStatus,
            dHost: deskInfo.dHost,
            dbig: deskInfo.dBig,
            dsmall: deskInfo.dSmall,
            frontmoney: deskInfo.frontMoney,
            deskMoney: deskInfo.deskMoney,
            round: deskInfo.round,
            playerSit,
            publicPoker,
            playerAction,
            playerPoint
        };
    }
    public async getPlayerInfo(playerID): Promise<{
        table,
        sessionRecordID,
        roundStatusID,
        channelName,
        seat,
        nickName,
        amount,
        handsAmount,
        castTime,
        diamond,
        bet,
        action,
        countDown,
        deskBetPool,
        insurance
    }> {
        return this.redisManger.hgetall(GameRedis.HASH_PLAYERINFO + playerID);
    }
    public async getDeskPeople(channelName) {
        const res = await this.redisManger.hmget(GameRedis.HASH_DESKINFO + channelName, 'deskPeople');
        return res[0];
    }
    public async getDeskLimitMoney(channelName) {
        const res = await this.redisManger.hmget(GameRedis.HASH_DESKINFO + channelName, 'deskMin', 'deskMax');
        return {
            deskMin: res[0],
            deskMax: res[1]
        };
    }
    public async getPlayerRedisSession(memberId): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_PLAYERINFO + memberId, 'sessionRecordID');
        const resNumber = _.toNumber(res[0]);
        return resNumber === -1 ? -33 : resNumber;
    }
    public async getDeskRedisSession(channelName): Promise<any> {
        const res = await this.redisManger.hmget(
            GameRedis.HASH_DESKINFO + channelName, 'sessionID', 'playerCountDown');
        return res;
    }
}
