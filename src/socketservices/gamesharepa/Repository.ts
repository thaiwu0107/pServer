import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameRedis } from '../../config/GameRedis';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import Utils from '../../utils/Utils';

@provide('GameSharePaRepository')
export default class GameSharePaRepository extends BaseRepository {
    constructor() { super(); }
    public async getPlayerRedisSession(memberId: string): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_PLAYERINFO + memberId, 'sessionRecordID');
        return res[0] || -33;
    }
    public async getDeskRedisSession(channelName: string): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_DESKINFO + channelName, 'sessionID');
        return res[0] || -99;
    }
    public async getprocessPa(playChannelName): Promise <{roundBet, playerName, allinBet, deskMoney, paPool}> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hgetall(GameRedis.HASH_FRONT_BET + playChannelName);
        pipeline.smembers(GameRedis.LIST_ALLIN_BET + playChannelName);
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'deskMoney');
        pipeline.lrange(GameRedis.LIST_PA_POOL + playChannelName, 0, -1);
        pipeline.llen(GameRedis.LIST_PA_POOL + playChannelName);
        const res = await pipeline.exec();
        const [playerBet, allin, deskMoney, moneyPool, PoolCount, allinCount] = Utils.getPipelineData(res);
        let allinBet: any = [];
        let paPool: any = [];
        // tslint:disable-next-line:prefer-conditional-expression
        if (allin.length === 0) {
            allinBet = [];
        } else {
            allinBet = Utils.getArraySortASC(allin);
        }
        // tslint:disable-next-line:prefer-conditional-expression
        if (PoolCount === '0') {
            paPool = [];
        } else {
            paPool = moneyPool;
        }
        const playerBetHash = Utils.getHgetAllKeyValue(playerBet);
        return {
            roundBet: playerBetHash.valueName,
            playerName: playerBetHash.keyName,
            allinBet,
            deskMoney,
            paPool
        };
    }
    public async setpaPoolInfo(playChannelName, paPool, roundBet, playerName) {
        await this.redisManger.del(GameRedis.LIST_PA_POOL + playChannelName);
        const pipeline = await this.redisManger.pipeline();
        _.forEach(paPool, (data) => {
            pipeline.rpush(GameRedis.LIST_PA_POOL + playChannelName, data);
        });
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < roundBet.length ; i++) {
            pipeline.hmset(GameRedis.HASH_FRONT_BET + playChannelName, playerName[i], roundBet[i]);
        }
        return pipeline.exec();
    }
    // 以下是平分pa池
    public async getDeskInfo(playChannelName): Promise<{playerSit, roundBet, playerName, paPool, publicPoker}> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.lrange(GameRedis.LIST_PLAYER_SIT + playChannelName, 0, -1);
        pipeline.hgetall(GameRedis.HASH_FRONT_BET + playChannelName);
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'deskMoney');
        pipeline.lrange(GameRedis.LIST_PA_POOL + playChannelName, 0, -1);
        pipeline.llen(GameRedis.LIST_PA_POOL + playChannelName);
        pipeline.lrange(GameRedis.LIST_PUBLIC_POKER + playChannelName, 0, -1);
        const res = await pipeline.exec();
        const [playerSit, playerBet, deskMoney, pool, poolCount, publicPoker] = Utils.getPipelineData(res);
        /*[ '23350', '37021', '37729', '5179', '-1', '-1', '-1', '-1', '-1' ],
            { '5179': '6666',
                '23350': '6666',
                '37021': '6666',
                '37729': '200' },
            [ '20198' ],
            [],
            '0',
            [ '42', '44', '122', '141', '124' ] */
        const playerBetHash = Utils.getHgetAllKeyValue(playerBet);
        let paPool: any = [];
        if (poolCount === '0') {
            paPool.push(deskMoney);
        } else {
            paPool = pool;
        }
        return {
            playerSit,
            roundBet: playerBetHash.valueName,
            playerName: playerBetHash.keyName,
            paPool,
            publicPoker
        };
    }
    public async getPlayInfo(playerSit) {
        const pipeline = await this.redisManger.pipeline();
        for (const data of playerSit) {
            if (data !== '-1') {
                pipeline.hmget(GameRedis.HASH_PLAYERINFO + data, 'action');
                pipeline.lrange(GameRedis.LIST_POKER + data, 0, -1);
            }
        }
        const res = await pipeline.exec();
        const getInfo = Utils.getPipelineData(res);
        const playerInfo: any = [];
        for (let i = 0, j = 0; i < playerSit.length; i++, j = j + 2) {
            if (playerSit[i] !== '-1') {
                playerInfo.push({
                    id: playerSit[i],
                    action: getInfo[j],
                    poker: getInfo[j + 1]
                });
            }
        }
        return playerInfo;
    }
}
