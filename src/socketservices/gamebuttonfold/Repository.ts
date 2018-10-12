import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameRedis } from '../../config/GameRedis';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import PlayerRecordEntity from '../../models/PlayerRecordEntity';
import Utils from '../../utils/Utils';

@provide('GameButtonFoldRepository')
export default class GameButtonFoldRepository extends BaseRepository {
    constructor() { super(); }
    public async getPlayerRedisSession(memberId): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_PLAYERINFO + memberId, 'sessionRecordID');
        return res[0] || -33;
    }
    public async getDeskRedisSession(channelName): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_DESKINFO + channelName, 'sessionID');
        return res[0] || -99;
    }
    public async getNowDesk(playChannelName: string) {
        const res = await this.redisManger.hmget(GameRedis.HASH_DESKINFO + playChannelName, 'nowPlayer', 'deskMoney');
        return{
            nowPlayer: res[0],
            deskMoney: res[1]
        };
    }
    public async getPlayerInfo(playerID: string): Promise<{seat, action}> {
        const pipeline = await this.redisManger.pipeline();
        pipeline.hmget(GameRedis.HASH_PLAYERINFO + playerID, 'seat');
        pipeline.hmget(GameRedis.HASH_PLAYERINFO + playerID, 'action');
        const res = await pipeline.exec();
        const [seat, action] = Utils.getPipelineData(res);
        return {
            seat: seat[0],
            action: action[0]
        };
    }
    public async dealPlayer(playerID: string, costTime): Promise <any> {
        return this.redisManger.hmsetObject(GameRedis.HASH_PLAYERINFO + playerID, {
            action: Constant.STATUS_FOLD,
            costTime
        });
    }
    public async dealDesk(playChannelName: string, playerSeat: number) {
        const pipeline = await this.redisManger.pipeline();
        pipeline.lset(GameRedis.LIST_PLAYER_ACTION + playChannelName, playerSeat, Constant.PLAYER_ACTION_FOLD);
        pipeline.del(GameRedis.LIST_COUNT_DOWNER + playChannelName);
        return pipeline.exec();
    }

    public async playerInfo(channelName, playerId, deskMoney, costTime): Promise<any> {
        const pipeLine = await this.redisManger.pipeline();
        pipeLine.hmget(GameRedis.HASH_DESKINFO + channelName, 'round');
        pipeLine
            .hgetall(GameRedis.HASH_PLAYERINFO + playerId)
            .lrange(GameRedis.LIST_POKER + playerId, 0, -1);
        const res = await pipeLine.exec();
        const dataList = Utils.getPipelineData(res);
        const roundStatusID = dataList[0];
        const newPipe = await this.redisManger.pipeline();
        const player = new PlayerRecordEntity();
        const playInfo = dataList[1];
        const handPoker = `[${dataList[2][0]},${dataList[2][1]}]`;
        player.um_id = playerId;
        player.pr_sessionRecordID = playInfo.sessionRecordID;
        player.pr_roundStatusID = roundStatusID;
        player.pr_handsAmount = playInfo.handsAmount;
        player.pr_seat = playInfo.seat;
        player.pr_hands = handPoker;
        player.pr_action = playInfo.action;
        player.pr_deskBetPool = _.toString(deskMoney);
        player.pr_costTime = costTime;
        player.pr_bet = playInfo.bet;
        player.pr_insurance = playInfo.insurance;
        newPipe.rpush(GameRedis.LIST_PLAYER_BET_RECORD + channelName, player.makePlayerRecord());
        return newPipe.exec();
    }
}
