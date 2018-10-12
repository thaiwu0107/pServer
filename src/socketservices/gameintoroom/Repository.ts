import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameRedis } from '../../config/GameRedis';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import Utils from '../../utils/Utils';

@provide('GameIntoRoomRepository')
export default class GameIntoRoomRepository extends BaseRepository {
    constructor() { super(); }
    public async initPlayer(
        playerID: string,
        playertable: string,
        playChannelName: string,
        session: string,
        playerCountDown
        ) {
            const pipeline = await this.redisManger.pipeline();
            return pipeline
            .hmset(GameRedis.HASH_PLAYERINFO + playerID, {
                table: playertable,
                sessionRecordID: session,
                roundStatusID: -1,
                channelName: playChannelName,
                seat: -1,
                handsAmount: -1,
                costBet: 0,
                castTime: 0,
                bet: -1,
                action: Constant.STATUS_LOOK,
                countDown: playerCountDown,
                deskBetPool: -1,
                insurance: -1
            })
            .rpush(GameRedis.LIST_LOOK_PLAYER + playChannelName, playerID)
            .exec();
    }
    public async getPlayerRedisSession(memberId): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_PLAYERINFO + memberId, 'sessionRecordID');
        return res[0] || 0;
    }
    public async getDeskList() {
        return this.redisManger.lrange(GameRedis.DESK_PLAYING, 0 , -1);
    }
    // 拿全部桌子資料
    public async getDeskInfo(playChannelName: string) {
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
            dHost: deskInfo.dHost,
            dbig: deskInfo.dBig,
            dsmall: deskInfo.dSmall,
            frontmoney: deskInfo.frontMoney,
            deskMoney: deskInfo.deskMoney,
            round: deskInfo.round,
            playerSit,
            publicPoker,
            playerAction,
            playerPoint,
            playerCountDown: deskInfo.playerCountDown
        };
    }
}
