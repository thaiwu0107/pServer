import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import GameRoundServer from '../gameproceround/Service';
import Repository from './Repository';

@provide('GameButtonAllinServer')
export default class GameButtonAllinServer extends BaseService {
    constructor(@inject('GameButtonAllinRepository') private repository: Repository,
    @inject('GameRoundServer') private GameRound: GameRoundServer) { super(); }

    public async dealFoldAction(
        playerID: string,
        playertable: string,
        playChannelName: string,
        session: string
    ): Promise<any> {
        // 檢查session
        const getPlayerRedisSession = await this.repository.getPlayerRedisSession(playerID);
        const getDeskRedisSession = await this.repository.getDeskRedisSession(playChannelName);
        if (_.toNumber(getPlayerRedisSession) !== _.toNumber(getDeskRedisSession)) {
            throw new Exceptions(9001, 'member: ' + playerID + ' WHAT_THE_HACK');
        }
        const getDeskInfo = await this.repository.getDeskInfo(playChannelName);
        const getPlayerInfo = await this.repository.getPlayerInfo(playerID);
        // 玩家的位置是否和要動作的玩家一致
        if (getDeskInfo.nowPlayer !== getPlayerInfo.seat) {
            throw new Exceptions(9001, 'member: ' + playerID + ' CANT_CHECK');
        }
        // 判斷動作是否是 等待中
        if (_.toNumber(getPlayerInfo.action) === Constant.STATUS_LOOK) {
            throw new Exceptions(9001, 'member: ' + playerID + ' CANT_ACTION');
        }
        const handsAmount =  await this.repository.getBet(playChannelName, playerID, getPlayerInfo.handsAmount);
        const getAllPlayerInfo = await this.repository.getAllPlayerInfo(playChannelName);
        const frontBet = getAllPlayerInfo.frontBet;
        const playerSit = getAllPlayerInfo.playerSit;
        const playerAction = getAllPlayerInfo.playerAction;
        const needChangePlayer: any = [];
        // tslint:disable-next-line:only-arrow-functions
        _.forEach(frontBet, function(value, key) {
            if (value < handsAmount) {
                const sit =  _.indexOf(playerSit, key);
                if (playerAction[sit] < 50) {
                    needChangePlayer.push(sit);
                }
            }
        });
        await this.repository.setPlayerInfo(playerID, getPlayerInfo.handsAmount);
        await this.repository.setDeskInfo(
            playChannelName,
            handsAmount,
            _.toNumber(getPlayerInfo.seat),
            needChangePlayer);
        const getDeskMoney = await this.repository.getDeskMoney(playChannelName);
        await this.repository.playerInfo(playChannelName, playerID, getDeskMoney, '0'); // 修改 time
        await this.GameRound.dealDeskAction(playChannelName);
        return {};
    }
}
