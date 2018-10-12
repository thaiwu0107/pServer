import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { ErrorStatusCode } from '../../config/enum.http';
import { GameSend } from '../../config/GameSend';
import { PokerList } from '../../config/PokerList';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import Utils from '../../utils/Utils';
import Repository from './Repository';

@provide('GameSelectSeatServer')
export default class GameSelectSeatServer extends BaseService {
    constructor(@inject('GameSelectSeatRepository') private repository: Repository) { super(); }

    public async SelectSeat(playerID, position, point): Promise<{
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
        const getPlayerInfo = await this.repository.getPlayerInfo(playerID);
        if (getPlayerInfo.channelName === Constant.WHAT_THE_HACK) {
            throw new Exceptions(ErrorStatusCode.WHAT_THE_HACK, Constant.WHAT_THE_HACK);
        }
        const getPlayerRedisSession = await this.repository.getPlayerRedisSession(playerID);
        const getDeskRedisSession = await this.repository.getDeskRedisSession(getPlayerInfo.channelName);
        // if (_.toNumber(getPlayerRedisSession) !== _.toNumber(getDeskRedisSession[0])) {
        //     throw new Exceptions(9001, 'member: ' + playerID + ' WHAT_THE_HACK');
        // }
        const getPlaySit = await this.repository.getPlaySit(getPlayerInfo.channelName);
        // 是否是無限注德州
        const str = _.map(getPlayerInfo.channelName);
        const takeMoney = new BigNumber(_.toString(point));
        switch (str[0]) {
            case Constant.TLH:
                const getDeskLimitMoney = await this.repository.getDeskLimitMoney(getPlayerInfo.channelName);

                if (takeMoney.gt(getDeskLimitMoney.deskMax) || takeMoney.lt(getDeskLimitMoney.deskMin)) {
                    throw new Exceptions(9001, 'error money');
                }
                break;
            case Constant.NLH:
                const getDeskSamllMoney = await this.repository.getDeskLimitMoney(getPlayerInfo.channelName);
                if (takeMoney.lt(getDeskSamllMoney.deskMin)) {
                    throw new Exceptions(9001, 'error money');
                }
                break;
        }
        if (_.toNumber(getPlaySit[position]) !== Constant.NO_PLAYER) {
            throw new Exceptions(ErrorStatusCode.CANT_SEAT, ErrorStatusCode.CANT_SEAT);
        }
        const amount = new BigNumber(_.toString(getPlayerInfo.amount));
        const playPoint = new BigNumber(_.toString(point));
        if (amount.lt(playPoint)) {
            throw new Exceptions(ErrorStatusCode.NO_ENOUGH_MONEY, ErrorStatusCode.NO_ENOUGH_MONEY);
        }
        const remainAmount = amount.minus(playPoint).toNumber();
        await this.repository.playTakeSit(
            getPlayerInfo.channelName, position, playerID, point, remainAmount, getDeskRedisSession[1]);
        return this.repository.getDeskInfo(getPlayerInfo.channelName);
    }
}
