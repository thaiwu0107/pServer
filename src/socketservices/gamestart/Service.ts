import BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameSend } from '../../config/GameSend';
import { PokerList } from '../../config/PokerList';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import GHeartbeats from '../../models/GHeartbeats';
import Utils from '../../utils/Utils';
import GameButtonFoldServer from '../gamebuttonfold/Service';
import Repository from './Repository';

@provide('GameStartServer')
export default class GameStartServer extends BaseService {
    constructor(@inject('GameStartRepository') private repository: Repository,
    @inject('GameButtonFoldServer') private gameButtonFold: GameButtonFoldServer) { super(); }

    public async gameStart(
        playerID: string,
        playChannelName: string,
        session: string
    ): Promise<any> {
        const getPlayerRedisSession = await this.repository.getPlayerRedisSession(playerID);
        const getDeskRedisSession = await this.repository.getDeskRedisSession(playChannelName);
        // if (_.toNumber(getPlayerRedisSession) !== _.toNumber(getDeskRedisSession)) {
        //     throw new Exceptions(9001, 'member: ' + playerID + ' WHAT_THE_HACK');
        // }
        const time = await this.repository.getDBCurrentTime();
        // 遊戲是否已經準備開始或是正要開始
        const deskDec = await this.repository.getDeskDec(playChannelName);
        // 檢查玩家人數
        if (_.toNumber(deskDec.deskPeople) < Constant.GAME_MIN_PLAYERS) {
            await this.repository.setPeopleNotFull(playChannelName);
            return;
        }
        // 判斷是否是桌主開始的模式
        const checkMasterCountDowner = await this.repository.checkMasterCountDowner(playChannelName);
        if (checkMasterCountDowner !== Constant.IS_MASTER_COUNTDOWN) {
            return;
        }

        await this.repository.pushCountDowner(playChannelName, playerID);
        const getCountDowner = await this.repository.getCountDowner(playChannelName);
        if (_.toNumber(deskDec.deskStatus) === Constant.GAME_NO_PLAYING) {
            if (getCountDowner === _.toString(playerID)) {
                const getDeskCountDowdNumber = await this.repository.getDeskCountDowdTime(playChannelName);
                GHeartbeats.createEvent(
                    Constant.UNIT_ONE_SECOND, getDeskCountDowdNumber + 1, async (count: number, last: boolean) => {
                        if (!last) {
                            await this.socketPushManager.publishChannel(Constant.ALLCHANNEL + playChannelName, {
                                count: getDeskCountDowdNumber - count,
                                protocol: 13
                            });
                        } else {
                            const getDeskInit = await this.repository.getDeskInit(playChannelName);
                            const getPlayerSitPosition = getDeskInit.playerSit; // [{memberId, position}]

                            let playerHost: IPlayerPositionInfo;
                            let playerSmall: IPlayerPositionInfo;
                            let playerBig: IPlayerPositionInfo;
                            let nowPlayer: IPlayerPositionInfo;
                            if (_.toNumber(getDeskInit.host) === -1) { // 全新的一桌
                                playerHost = Utils.findElementByIndex(getPlayerSitPosition, 0);
                                playerSmall = Utils.findElementByIndex(getPlayerSitPosition, 1);
                                playerBig = Utils.findElementByIndex(getPlayerSitPosition, 2);
                                nowPlayer = Utils.findElementByIndex(getPlayerSitPosition, 3); // 第幾個玩家開始
                            } else { // 已經玩過的桌子
                                const prehostIndex = getDeskInit.host;
                                playerHost = Utils.findElementByIndex(getPlayerSitPosition, prehostIndex + 1);
                                playerSmall = Utils.findElementByIndex(getPlayerSitPosition, prehostIndex + 2);
                                playerBig = Utils.findElementByIndex(getPlayerSitPosition, prehostIndex + 3);
                                nowPlayer = Utils.findElementByIndex(getPlayerSitPosition, prehostIndex + 4);
                            }
                            const deskMoney = new BigNumber(getDeskInit.bigCost).plus(getDeskInit.smallCost).toNumber();

                            // 把牌打亂加上取出 人數*2 + 5 公牌
                            const shuffled = _.sampleSize(_.shuffle(PokerList.KEYS_NUMBER), Constant.MAXSIZE_PORKER);
                            // 開始取牌
                            const playerSize = _.size(getPlayerSitPosition);
                            const playersPokers = _.sampleSize(shuffled, (playerSize * 2) + 5);
                            let index = getPlayerSitPosition.length;
                            while (index--) {
                                const pokers = _.sampleSize(playersPokers, 2);
                                getPlayerSitPosition[index].pokers = [pokers[0], pokers[1]];
                                _.pull(playersPokers, ...pokers);
                            }
                            const publicPokers = playersPokers;
                            // 設定玩家手牌
                            await this.repository.setPlayerPoker(getPlayerSitPosition, playChannelName);
                            await this.repository.initNewGame(
                                playChannelName, playerHost, playerBig, playerSmall, deskMoney,
                                getDeskInit.bigCost, nowPlayer, publicPokers
                                );

                            // 歷程記錄
                            await this.repository.playerInfo(playChannelName, getPlayerSitPosition, deskMoney);
                            // 減去大小忙注的錢
                            const subPlayerBet =
                            await this.repository.subPlayerBet(
                                playerBig.playerId, getDeskInit.bigCost, playerSmall.playerId, getDeskInit.smallCost);
                            // 更新playerPoint
                            await this.repository.setPlayerBet(
                                playChannelName, playerSmall.playerPosition,
                                subPlayerBet.smallBetPoit, getDeskInit.smallCost, playerSmall.playerId,
                                playerBig.playerPosition, subPlayerBet.bigBetPoint,
                                getDeskInit.bigCost, playerBig.playerId);
                            await this.socketPushManager.publishChannel(Constant.ALLCHANNEL + playChannelName, {
                                playerHost: playerHost.playerId,
                                playerSmall: playerSmall.playerId,
                                playerBig: playerBig.playerId,
                                deskMoney,
                                nowPlayer: nowPlayer.playerId,
                                samllMoney: subPlayerBet.smallBetPoit,
                                bigMoney: subPlayerBet.bigBetPoint,
                                protocol: GameSend.PROTOCOL_DESK_INFO
                            });
                            // tslint:disable-next-line:max-line-length
                            GHeartbeats.createEvent(Constant.UNIT_ONE_SECOND, Constant.WATTING_CHIENT_ANIMATION + 1,
                                async (_count: number, _last: boolean) => {
                                    if (_last) {
                                        await this.socketPushManager.publishChannel(
                                        Constant.PRIVATE_CHANNEL + nowPlayer.playerId, {
                                            protocol: GameSend.PROTOCOL_BUTTON_DISPLAY,
                                            FOLD: true,
                                            CALL: true,
                                            RAISE: true,
                                            ALLIN: true,
                                            CHECK: false
                                        });
                                    }
                            });
                        }
                    });
                this.repository.setPreTime(time, playChannelName);
            }
        } else if (_.toNumber(deskDec.deskStatus) === Constant.GAME_IS_PLAYING) {
            if (getCountDowner === _.toString(playerID)) {
                const getNowDesk = await this.repository.getNowDesk(playChannelName);
                const getPlayerID: any = _.find(getNowDesk.playerSit, (onePlayer) => {
                    return _.toNumber(getNowDesk.nowPlayer) === _.toNumber(onePlayer.playerPosition);
                });
                const loop = GHeartbeats.createEvent(Constant.UNIT_ONE_SECOND, 0,
                    async (_count: number, _last: boolean) => {
                        const countDowner = await this.repository.getPlayerTime(getPlayerID.playerId, playChannelName);
                        const getPlayerTime = _.toNumber(countDowner.countDown) + 1;
                        if (countDowner.countDownerControl === 0) {
                            loop.kill();
                        } else if (_.toNumber(getPlayerTime) <= _count) {
                            // 棄排GO
                            loop.kill();
                            const aa =
                                await this.gameButtonFold.dealFoldAction(playerID, playChannelName, _count, true);
                        }
                });
            }
        }
        return {};
    }
}
export interface IPlayerPositionInfo {
    playerPosition: number;
    playerId: string;
    pokers: number[];
}
