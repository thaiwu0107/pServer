import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameRedis } from '../../config/GameRedis';
import { GameSend } from '../../config/GameSend';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import PlayerRecordEntity from '../../models/PlayerRecordEntity';
import Utils from '../../utils/Utils';

@provide('GameStartRepository')
export default class GameStartRepository extends BaseRepository {
    constructor() { super(); }
    public async getDeskDec(playChannelName: string) {
        const pipeline = await this.redisManger.pipeline();
        const res = await pipeline
            .hmget(GameRedis.HASH_DESKINFO + playChannelName, 'deskStatus', 'deskPeople')
            .lrange(GameRedis.LIST_COUNT_DOWNER + playChannelName, 0, -1)
            .exec();
        const [deskData, CountDowner] = Utils.getPipelineData(res);
        return{
            deskStatus: deskData[0],
            deskPeople: deskData[1],
            CountDowner
        };
    }
    public async setPeopleNotFull(channelName) {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmset(GameRedis.HASH_DESKINFO + channelName, {
            dhost: -1,
            dsmall: -1,
            dbig: -1,
            deskStatus: 0
        });
        pipeline.del(GameRedis.LIST_COUNT_DOWNER + channelName);
        return pipeline.exec();
    }
    public async checkMasterCountDowner(channelName) {
        const res = await this.redisManger.hmget(GameRedis.HASH_DESKINFO + channelName, 'masterCountDowner');
        return _.toNumber(res[0]);
    }
    public async pushCountDowner(playChannelName: string, playerID: string) {
        return this.redisManger.rpush(GameRedis.LIST_COUNT_DOWNER + playChannelName, playerID);
    }
    public async getCountDowner(playChannelName) {
        const res = await this.redisManger.lrange(GameRedis.LIST_COUNT_DOWNER + playChannelName, 0, -1);
        return res[0];
    }
    public async getDeskCountDowdTime(playChannelName) {
        const res = await this.redisManger.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'countDown');
        return _.toNumber(res[0]);
    }
    public async getDeskInit(channelName) {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmget(GameRedis.HASH_DESKINFO + channelName, 'dHost', 'dSmallCost', 'dBigCost');
        pipeline.lrange(GameRedis.LIST_PLAYER_SIT + channelName, 0, -1);
        const res = await pipeline.exec();
        const [[host, smallCost, bigCost], playerSit] = Utils.getPipelineData(res);
        return {
            host,
            smallCost,
            bigCost,
            playerSit: Utils.findPlaySitPosition(playerSit)
        };
    }
    public async getPlayerRedisSession(memberId): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_PLAYERINFO + memberId, 'sessionRecordID');
        return res[0] || -33;
    }
    public async getDeskRedisSession(channelName): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_DESKINFO + channelName, 'sessionID');
        return res[0] || -99;
    }
    public async playerInfo(channelName, getPlayerSitPosition: Array<{
        playerPosition: number;
        playerId: string;
        pokers: number[];
    }>, deskMoney): Promise<any> {
        const pipeLine = await this.redisManger.pipeline();
        pipeLine.hmget(GameRedis.HASH_DESKINFO + channelName, 'round');
        for (const data of getPlayerSitPosition) {
            pipeLine
            .hgetall(GameRedis.HASH_PLAYERINFO + data.playerId);
        }
        const res = await pipeLine.exec();
        const dataList = Utils.getPipelineData(res);
        const roundStatusID = dataList[0];
        const newPipe = await this.redisManger.pipeline();
        for (let i = 1, id = 0; i < dataList.length ; i ++, id++) {
            const player = new PlayerRecordEntity();
            const playInfo = dataList[i];
            const handPoker = `[${getPlayerSitPosition[id].pokers[0]},${getPlayerSitPosition[id].pokers[1]}]`;
            player.um_id = getPlayerSitPosition[id].playerId;
            player.pr_sessionRecordID = playInfo.sessionRecordID;
            player.pr_roundStatusID = roundStatusID;
            player.pr_handsAmount = playInfo.handsAmount;
            player.pr_seat = playInfo.seat;
            player.pr_hands = handPoker;
            player.pr_action = playInfo.action;
            player.pr_deskBetPool = _.toString(deskMoney);
            player.pr_costTime = '0';
            player.pr_bet = playInfo.bet;
            player.pr_insurance = playInfo.insurance;
            newPipe.rpush(GameRedis.LIST_PLAYER_BET_RECORD + channelName, player.makePlayerRecord());
        }
        return newPipe.exec();
    }
    public async subPlayerBet(playerBigId, bigBet, playerSmallId, smallBet) {
        const pipeLine = await this.redisManger.pipeline();
        const res = await pipeLine
            .hincrbyfloat(GameRedis.HASH_PLAYERINFO + playerSmallId, 'handsAmount', -smallBet)
            .hincrbyfloat(GameRedis.HASH_PLAYERINFO + playerBigId, 'handsAmount', -bigBet)
            .exec();
        const [smallBetPoit, bigBetPoint] = Utils.getPipelineData(res);
        return {
            smallBetPoit,
            bigBetPoint
        };
    }
    public async setPlayerPoker(
        getPlayerSitPosition: Array<{playerPosition: number, playerId: string, pokers: number[]}>, playChannelName) {
            const pipeline1 = await this.redisManger.pipeline();
            const pipeline2 = await this.redisManger.pipeline();
            await Promise.all(getPlayerSitPosition.map(async (player) => {
                pipeline1.lset(GameRedis.LIST_PLAYER_ACTION + playChannelName, player.playerPosition, 0);
                // 存各個玩家的私牌
                pipeline2.hmset(GameRedis.HASH_PLAYERINFO + player.playerId, 'action', Constant.STATUS_ACTION);
                pipeline2.lset(GameRedis.LIST_POKER + player.playerId, 0 , player.pokers[0]);
                pipeline2.lset(GameRedis.LIST_POKER + player.playerId, 1 , player.pokers[1]);
                return this.socketPushManager.publishChannel(
                    Constant.PRIVATE_CHANNEL + player.playerId, {
                        protocol: GameSend.PROTOCOL_PRIVATE_POKERS,
                        playerPokers: player.pokers
                    });
            }));
            return Promise.all([pipeline1.exec(), pipeline2.exec()]);
    }
    public async setPlayerBet(
        // 要改  playerIdSmallPosition playerIdBigPosition
        channelName, playerIdSmallPosition, smallBetPoit, smallCost, smallID,
        playerIdBigPosition, bigBetPoint, bigCost, bigID) {
        const pipeLine = await this.redisManger.pipeline();
        return pipeLine
            .lset(GameRedis.LIST_PLAYER_POINT + channelName, playerIdSmallPosition, smallBetPoit)
            .hincrbyfloat(GameRedis.HASH_FRONT_BET + channelName, smallID, smallCost)
            .lset(GameRedis.LIST_PLAYER_POINT + channelName, playerIdBigPosition, bigBetPoint)
            .hincrbyfloat(GameRedis.HASH_FRONT_BET + channelName, bigID, bigCost)
            .exec();
    }
    public async initNewGame(
        channelName, dHost, dBig, dSmall, deskMoney, frontMoney, nowPlayer, publicPokers) {
        const pipeline = await this.redisManger.pipeline();
        return pipeline
        .del(GameRedis.LIST_PUBLIC_POKER + channelName,
            GameRedis.LIST_COUNT_DOWNER + channelName)
        .hmset(GameRedis.HASH_DESKINFO + channelName, {
            dHost: dHost.playerPosition,
            dBig: dBig.playerPosition,
            dSmall: dSmall.playerPosition,
            deskMoney,
            frontMoney,
            deskStatus: Constant.STATUS_ACTIVE,
            nowPlayer: nowPlayer.playerPosition,
            round: 1,
            countDownerControl: 1
        })
        .lset(GameRedis.LIST_PLAYER_ACTION + channelName, dHost.playerPosition, Constant.NEED_TO_ACTION)
        .lset(GameRedis.LIST_PLAYER_ACTION + channelName, dSmall.playerPosition, Constant.NEED_TO_ACTION)
        .lset(GameRedis.LIST_PLAYER_ACTION + channelName, dBig.playerPosition, Constant.WATTING_ACTION)
        .rpush(GameRedis.LIST_PUBLIC_POKER + channelName, ...publicPokers)
        // 如果到時候要可以換牌才會使用這個牌池來做換牌
        // .rpush(GameRedis.LIST_PORKER_POOL + channelName, ...publicPokers)
        .exec();
    }
    public async setPreTime(time: Date, playChannelName: string) {
        return this.redisManger.hmset(GameRedis.HASH_DESKINFO + playChannelName, 'preTime', time);
    }
    public async getNowDesk(playChannelName: string): Promise<{nowPlayer, playerSit}> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'nowPlayer');
        pipeline.lrange(GameRedis.LIST_PLAYER_SIT + playChannelName, 0, -1);
        pipeline.lset(GameRedis.LIST_COUNT_DOWNER + playChannelName, 0, '-1');
        const res = await pipeline.exec();
        const [nowPlayer, playerSit, countDowner] = Utils.getPipelineData(res);
        return {
            nowPlayer,
            playerSit: Utils.findPlaySitPosition(playerSit)
        };
    }
    public async getPlayerTime(nowPlayerID: string, playChannelName) {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmget(GameRedis.HASH_PLAYERINFO + nowPlayerID, 'countDown');
        pipeline.hmget(GameRedis.HASH_DESKINFO  + playChannelName, 'countDownerControl');
        const res = await pipeline.exec();
        const [countDown, countDownerControl] = Utils.getPipelineData(res);
        // return res[0] ? _.toNumber(res[0]) : -1;
        return {
            countDown: countDown[0] ? _.toNumber(countDown[0]) : -1,
            countDownerControl: _.toNumber(countDownerControl[0])
        };
    }
}
