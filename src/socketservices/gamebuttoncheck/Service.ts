import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import Repository from './Repository';

@provide('GameButtonCheckServer')
export default class GameButtonCheckServer extends BaseService {
    constructor(@inject('GameButtonCheckRepository') private repository: Repository) { super(); }

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
        const FrontMoney = new BigNumber(getDeskInfo.frontMoney);
        // 確認金錢
        if (FrontMoney.gt(Constant.FRONT_MONEY_ZERO)) {
            throw new Exceptions(9001, 'member: ' + playerID + ' WHAT_THE_HACK');
        }
        // 桌子目前要動作的玩家

        // 棄排動作
        await this.repository.dealPlayer(playerID);
        await this.repository.dealDesk(playChannelName, _.toNumber(getPlayerInfo.seat));
        return {};
    }
}
