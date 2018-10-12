import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import Utils from '../../utils/Utils';
import Repository from './Repository';

@provide('GameSharePaServer')
export default class GameSharePaServer extends BaseService {
    constructor(@inject('GameSharePaRepository') private repository: Repository) { super(); }

    public async dealPot(
        playChannelName: string
    ): Promise<any> {
        /**
         * {id: Bet}
         * {0: 50}
         */
        const getprocessPa = await this.repository.getprocessPa(playChannelName);
        const allinCheck = getprocessPa.allinBet.length;
        /**
         * [30, 40, 60, 70]
         */
        const allinBet = getprocessPa.allinBet;
        let deskMoney = getprocessPa.deskMoney;
        const roundBet = getprocessPa.roundBet;
        const paPool = getprocessPa.paPool;
        let paMoney = 0;
        const allPaSize = paPool.length;
        if (allPaSize > 0) {
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < allPaSize; i++) {
                const _paMoney = new BigNumber(paMoney).plus(paPool[i]);
                paMoney = _.toNumber(_paMoney);
            }
        }
        deskMoney = new BigNumber(deskMoney).minus(paMoney);
        if (allinCheck > 0) {
            // 有人allin 要分pa
            for (let i = 0 ; i < allinCheck; i++) {
                let otherMoney = 0;
                /**
                 * [40, 60, 70]
                 */
                const procesBet = allinBet.pop();
                for (let ai = 0; ai < allinBet.length; ai++) {
                    allinBet[ai] = new BigNumber(allinBet[ai]).minus(procesBet).toNumber();
                }
                for (let ak = 0; ak < roundBet.length; ak++) {
                    let _otherMoney;
                    if (_.toNumber(roundBet[ak]) > 0) {
                        roundBet[ak] = new BigNumber(roundBet[ak]).minus(procesBet).toNumber();
                        _otherMoney = new BigNumber(otherMoney).plus(roundBet[ak]).toNumber();
                        if (_.toNumber(roundBet[ak]) === 0) {
                            const palength = (allPaSize + 1) * -1;
                            roundBet[ak] = palength;
                        }
                        otherMoney = _otherMoney;
                    }
                }
                deskMoney = new BigNumber(deskMoney).minus(otherMoney).toNumber();
                paPool.push(deskMoney); // [280]
                deskMoney = otherMoney;
            }
        }
        // 沒人allin
        await this.repository.setpaPoolInfo(playChannelName, paPool, roundBet, getprocessPa.playerName);
        return {};
    }
    public async dealSharePa(
        playChannelName: string
    ): Promise<any> {
        //
        const getDeskInfo = await this.repository.getDeskInfo(playChannelName);
        /**
         * [{
         *  id:9457
         *  action: fold
         *  poker: [54,60]
         * }]
         */
        const getPlayInfo = await this.repository.getPlayInfo(getDeskInfo.playerSit);
        /**
         * [ { id: '23350', action: [ '3' ], poker: [ '54', '33' ] },
         * { id: '37021', action: [ '3' ], poker: [ '143', '61' ] },
         * { id: '37729', action: [ '99' ], poker: [ '81', '24' ] },
         * { id: '5179', action: [ '3' ], poker: [ '52', '112' ] }]
         */
        let playerInfo = getPlayInfo;
        const publicPoker = getDeskInfo.publicPoker;
        const allPokerList: any = [];
        const playerName = getDeskInfo.playerName;
        // 將 玩家資訊組合
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < playerInfo.length; i++) {
            // tslint:disable-next-line:prefer-for-of
            for (let j = 0; j < playerName.length; j++) {
                if (playerInfo[i].id === playerName[j]) {
                    playerInfo[i].poker = _.concat(playerInfo[i].poker, publicPoker);
                    allPokerList.push(_.concat(playerInfo[i].poker, publicPoker));
                    playerInfo[i].playerStatusPool = getDeskInfo.roundBet[j];
                }
            }
        }
        const weigthInfo = Utils.getWeigth(allPokerList);
        for (let i = 0; i < playerInfo.length; i++) {
            if (playerInfo[i].playerStatusPool === -99) {
                playerInfo[i].weigth = 0;
            }
            playerInfo[i].weigth = weigthInfo[i].Rank;
            playerInfo[i].turnMoney = 0;
        }
        playerInfo = _.orderBy(playerInfo, 'weigth', 'asc');
        // 排名
        for (let i = playerInfo.length - 1, j = 1; i > -1 ; i--) {
            if (i >= 1) {
                if (playerInfo[i].weigth === playerInfo[i - 1].weigth) {
                    playerInfo[i].rank = j;
                } else {
                    playerInfo[i].rank = j;
                    j++;
                }
            } else {
                playerInfo[i].rank = j;
            }
        }   // rank end

        const paShare: any = [];
        const paPoolCount = getDeskInfo.paPool.length;
        const paPool = getDeskInfo.paPool;
        for (let i = 0; i < paPoolCount; i++) {
            // tslint:disable-next-line:prefer-for-of
            for (let j = 0, k = 1; j < playerInfo.length; j++) {
                if (playerInfo[j].playerStatusPool !== -99) {
                    const playerStatusPool =  playerInfo[j].playerStatusPool * -1;
                    if (playerStatusPool > i) {
                        if (playerInfo[j].rank === k) { // 找第一名
                            paShare.push(playerInfo[j]);
                        }
                        if (paShare.length === 0 && j === playerInfo.length - 1) {  // 找地2名
                            k++;
                            j = 0;
                        }
                    }
                }
            }// 看誰是贏家
            const paShareCount = paShare.length;
            const finalMoney = paPool[i] / paShareCount;
            for (let j = 0 ; j < paShareCount; j++) {
                // tslint:disable-next-line:prefer-for-of
                for (let k = 0; k < playerInfo.length; k++) {
                    if (paShare[j].id === playerInfo[k].id) {
                        playerInfo[k].turnMoney = new BigNumber(finalMoney).plus(playerInfo[k].turnMoney).toNumber();

                    }
                }
            }// 分錢
        }//
        /*
        { id: '23350',
            action: [ '3' ],
            poker: [ '23', '71', '43', '133', '72', '91', '44' ],
            playerStatusPool: '-1',
            weigth: 30142,
            turnMoney: 0,
            rank: 3 },
        { id: '5179',
            action: [ '3' ],
            poker: [ '24', '73', '43', '133', '72', '91', '44' ],
            playerStatusPool: '-1',
            weigth: 30142,
            turnMoney: 0,
            rank: 3 },
        { id: '37729',
            action: [ '3' ],
            poker: [ '132', '34', '43', '133', '72', '91', '44' ],
            playerStatusPool: '-1',
            weigth: 30634,
            turnMoney: 0,
            rank: 2 },
        { id: '37021',
            action: [ '3' ],
            poker: [ '41', '22', '43', '133', '72', '91', '44' ],
            playerStatusPool: '-1',
            weigth: 40184,
            turnMoney: 26964,
            rank: 1 }
         */
    }
}
