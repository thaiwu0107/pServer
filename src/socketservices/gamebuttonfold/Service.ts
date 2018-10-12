import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import GameRoundServer from '../gameproceround/Service';
import Repository from './Repository';

@provide('GameButtonFoldServer')
export default class GameButtonFoldServer extends BaseService {
    constructor(@inject('GameButtonFoldRepository') private repository: Repository,
    @inject('GameRoundServer') private GameRound: GameRoundServer) { super(); }

    public async dealFoldAction(
        playerID: string,
        playChannelName: string,
        costTime: string | number,
        systemAction = false
    ): Promise<any> {
        // 檢查session
        const getPlayerRedisSession = await this.repository.getPlayerRedisSession(playerID);
        const getDeskRedisSession = await this.repository.getDeskRedisSession(playChannelName);
        if (_.toNumber(getPlayerRedisSession) !== _.toNumber(getDeskRedisSession)) {
            throw new Exceptions(9001, 'member: ' + playerID + ' WHAT_THE_HACK');
        }
        // 桌子目前要動作的玩家
        const getNowDesk = await this.repository.getNowDesk(playChannelName);
        const getPlayerInfo = await this.repository.getPlayerInfo(playerID);
        // 判斷動作是否是 等待中
        if (_.toNumber(getPlayerInfo.action) === Constant.STATUS_LOOK) {
            throw new Exceptions(9001, 'member: ' + playerID + ' CANT_ACTION');
        }
        // 玩家的位置是否和要動作的玩家一致
        if (getNowDesk.nowPlayer !== getPlayerInfo.seat) { // 6
            throw new Exceptions(9001, 'member: ' + playerID + ' WHAT_THE_HACK');
        }
        // 系統幫忙
        if (!systemAction) {
            // 紀錄action時間
        }
        // 棄排動作
        await this.repository.dealPlayer(playerID, costTime);
        await this.repository.dealDesk(playChannelName, _.toNumber(getPlayerInfo.seat));
        //  playerReord
        await this.GameRound.dealDeskAction(playChannelName);
        return this.repository.playerInfo(playChannelName, playerID, getNowDesk.deskMoney, costTime);
    }
}
