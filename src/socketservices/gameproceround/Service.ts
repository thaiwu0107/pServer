import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import GameSharePaServer from '../gamesharepa/Service';
import Repository from './Repository';

@provide('GameRoundServer')
export default class GameRoundServer extends BaseService {
    constructor(@inject('GameRoundRepository') private repository: Repository,
    @inject('GameSharePaServer') private gamesharepa: GameSharePaServer) { super(); }

    public async dealDeskAction(
        playChannelName: string
    ): Promise<any> {
        const getRoundAction = await this.repository.getRoundAction(playChannelName);
        const processDeskAction: any = [0, 0 , 0, 0];
        const DeskSeatSpace = _.toNumber(getRoundAction.seatSpace);
        _.forEach(getRoundAction.playerAction, (data) => {
            switch (_.toNumber(data)) {
                case 100:
                    processDeskAction[0]++;
                    break;
                case 50:
                    processDeskAction[0]++;
                    break;
                case 30:
                    processDeskAction[1]++;
                    break;
                case 1:
                    processDeskAction[2]++;
                    break;
            }
        });
        processDeskAction[3] = processDeskAction[0] + processDeskAction[1];
        if (processDeskAction[3] === DeskSeatSpace && getRoundAction.round) {
            // 分錢
            await this.gamesharepa.dealPot(playChannelName);
            await this.gamesharepa.dealSharePa(playChannelName);
            return;
        }
        if (processDeskAction[0] === DeskSeatSpace ||
            (processDeskAction[0] === DeskSeatSpace - 1 &&  processDeskAction[1] === 1) ||
            (processDeskAction[0] === DeskSeatSpace - 1 &&  processDeskAction[3] === 0)) {
            // 分錢
            await this.gamesharepa.dealPot(playChannelName);
            await this.gamesharepa.dealSharePa(playChannelName);
            return;
        }
        const playerAction = getRoundAction.playerAction;
        let nextPlayer = -1;
        if (processDeskAction[3] === DeskSeatSpace) {
            // 執行下一round
            const buttonPosition = _.toNumber(getRoundAction.dhost);
            for (let i = buttonPosition + 1; i < DeskSeatSpace; i++) {
                const action = _.toNumber(playerAction[i]);
                if (action !== Constant.PLAYER_ACTION_FOLD && action !== Constant.PLAYER_ACTION_ALLIN) {
                    nextPlayer = i;
                    break;
                }
                if (i === 8 && nextPlayer === -1) {
                    i = 0;
                }
            }
        } else {
            // 執行下一位
            let nowPlayer = _.toNumber(getRoundAction.nowPlayer);
            // tslint:disable-next-line:prefer-conditional-expression
            if (nowPlayer + 1 > DeskSeatSpace) {
                nowPlayer = 0;
            } else {
                nowPlayer =  nowPlayer + 1;
            }
            for (let i = nowPlayer; i < DeskSeatSpace; i++) {
                const action = _.toNumber(playerAction[i]);
                if (action !== Constant.PLAYER_ACTION_FOLD && action !== Constant.PLAYER_ACTION_ALLIN) {
                    nextPlayer = i;
                    break;
                }
                if (i === 8 && nextPlayer === -1) {
                    i = -1;
                }
            }
        }
        await this.repository.setnextPlayer(playChannelName, nextPlayer);
        return {};
    }
}
