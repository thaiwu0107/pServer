import * as fastJson from 'fast-json-stringify';
import * as _ from 'lodash';
import { Constant } from '../config/enum.constant';
import { ErrorStatusCode } from '../config/enum.http';
import BaseEntity from '../models/BaseEntity';
import Exceptions from '../models/Exceptions';
import {cardNameTable} from '../models/sim/CardNameTable';
import {rankTable7CF} from '../models/sim/RankTable7CF';
import {rankTable7CNF} from '../models/sim/RankTable7CNF';
import Success from '../models/Success';
import BaseUtils from './BaseUtils';

export default class Utils extends BaseUtils {
    public static modifyHistoryLog(
        logType: Constant.MS_MODIFY_HISORY_LOG_TYPE_ADD | Constant.MS_MODIFY_HISORY_LOG_TYPE_MODIFY,
        title: string, obj: BaseEntity | object) {
        const titleString = logType === Constant.MS_MODIFY_HISORY_LOG_TYPE_ADD ? title + ':Add' : title + ':Modify';
        const toObj = (obj instanceof BaseEntity) ? obj.toJSON() : obj;
        let objString: string = titleString;
        _.mapKeys(toObj, (v, k) => {
            objString += ', ' + _.toString(k) + ':' + _.toString(v);
            return {};
        });
        return objString;
    }
    public static resultWarn(msg: string, statusCode: ErrorStatusCode = ErrorStatusCode.PORCEDURE_WARN) {
        throw new Exceptions(statusCode, msg);
    }
    public static resultSuccess(msg: string, statusCode: ErrorStatusCode = ErrorStatusCode.STATUS_OK) {
        return new Success(statusCode, msg);
    }
    public static resultWarns(iResult: number | string, ...exceptionsList: Array<{
        ResultCode: number,
        Msg: any,
        Success: boolean,
        StatusCode?: ErrorStatusCode | any
    }>) {
        const index = _.findIndex(exceptionsList, (find) => {
            return find.ResultCode === iResult;
        });
        if (index === -1) {
            throw new Exceptions(ErrorStatusCode.STATUS_FAIL, 'Undefined Error');
        }
        const exception = exceptionsList[index];
        if (exception.Success) {
            return this.resultSuccess(exception.Msg, exception.StatusCode);
        } else {
            return this.resultWarn(exception.Msg, exception.StatusCode);
        }
    }
    public static Warn(
        iResultCode: number | string,
        sMsg: string,
        statusCode: ErrorStatusCode = ErrorStatusCode.PORCEDURE_WARN) {
        return _.omitBy({
            ResultCode: iResultCode,
            Msg: sMsg,
            StatusCode: statusCode,
            Success: false
        }, _.isUndefined) as {
                ResultCode: number,
                Msg: string,
                Success: boolean,
                StatusCode?: ErrorStatusCode
            };
    }
    public static Success(
        iResultCode: number | string,
        sMsg: string,
        statusCode: ErrorStatusCode = ErrorStatusCode.STATUS_OK) {
        return _.omitBy({
            ResultCode: iResultCode,
            Msg: sMsg,
            StatusCode: statusCode,
            Success: true
        }, _.isUndefined) as {
                ResultCode: number,
                Msg: string,
                Success: boolean,
                StatusCode?: ErrorStatusCode
            };
    }
    public static changeFlower(deskpoker) {
        switch (Math.floor(deskpoker / 20)) {
            case 0 :
                deskpoker = 'c.' + deskpoker % 20;
                break;
            case 1:
                deskpoker = 'd.' + deskpoker % 20;
                break;
            case 2:
                deskpoker = 'h.' + deskpoker % 20;
                break;
            case 3:
                deskpoker = ' s.' + deskpoker % 20;
                break;
        }
        return deskpoker;
    }
    public static findPlaySitPosition(playerSitList: any[])
    : Array<{playerPosition: number, playerId: string, pokers: number[]}> {
        const positionList: any[] = [];
        let playerPosition = 0;
        for (const playerId of playerSitList) {
            if (_.toNumber(playerId) !== Constant.NO_PLAYER) {
                positionList.push({
                    playerId,
                    playerPosition
                });
            }
            playerPosition++;
        }
        return positionList;
    }
    public static findElementByIndex(list: any[], index: number) {
        const _index = index % list.length;
        return list[_index];
    }
    public static findBarrel(id: number) {
        return (id % 200);
    }
    private static stringify = fastJson({
        title: 'Example Schema',
        type: 'object',
        properties: {
          um_id: {
            type: 'string'
          },
          pr_sessionRecordID: {
            type: 'string'
          },
          pr_roundStatusID: {
            type: 'string'
          },
          pr_handsAmount: {
            type: 'string'
          },
          pr_seat: {
            type: 'string'
          },
          pr_hands: {
            type: 'string'
          },
          pr_castTime: {
            type: 'string'
          },
          pr_bet: {
            type: 'string'
          },
          pr_action: {
            type: 'string'
          },
          pr_deskBetPool: {
            type: 'string'
          },
          pr_insurance: {
            type: 'string'
          }
        }
    });
    public static testFastJson(obj: any) {
        return Utils.stringify(obj);
    }
    public static testString(obj: any) {
        // tslint:disable-next-line:max-line-length
        return `{"um_id":"${obj.um_id}","pr_sessionRecordID":"${obj.pr_sessionRecordID}","pr_roundStatusID":"${obj.pr_roundStatusID}","pr_handsAmount":"${obj.pr_handsAmount}","pr_seat":"${obj.pr_seat}","pr_hands":"${obj.pr_hands}","pr_castTime":"${obj.pr_castTime}","pr_bet":"${obj.pr_bet}","pr_action":"${obj.pr_action}","pr_deskBetPool":"${obj.pr_deskBetPool}","pr_insurance":"${obj.pr_insurance}"}`;
    }
    /**
     * 進來的牌自己的私牌一定要是倒數最後兩個
     * 前面一定要是公牌
     * @static
     * @param {number[]} inputCards 公牌加上私牌
     * @memberof Utils
     */
    public static getRankInfo(inputCards: number[]) {
        const cardMap = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ];
        const suitMap = {};
        let indexCards = 7;
        while (indexCards--) {
            const suit = inputCards[indexCards] % 10;
            const point = (inputCards[indexCards] - suit) / 10;
            cardMap[suit][point]++;
            cardMap[suit][0]++;
            cardMap[0][point]++;
            if (suitMap[point]) {
                suitMap[point].push(suit);
            } else {
                suitMap[point] = [suit];
            }
        }
        let isFlush = false;
        let selectSuit = 0;
        let isFlushIndex = 5;
        while (isFlushIndex--) {
            if (cardMap[isFlushIndex][0] >= 5) {
                isFlush = true;
                selectSuit = isFlushIndex;
                break;
            }
        }
        // tslint:disable-next-line:max-line-length
        const keyOfRank = `${cardMap[selectSuit][14]}${cardMap[selectSuit][13]}${cardMap[selectSuit][12]}${cardMap[selectSuit][11]}${cardMap[selectSuit][10]}${cardMap[selectSuit][9]}${cardMap[selectSuit][8]}${cardMap[selectSuit][7]}${cardMap[selectSuit][6]}${cardMap[selectSuit][5]}${cardMap[selectSuit][4]}${cardMap[selectSuit][3]}${cardMap[selectSuit][2]}`;
        let rankInfo;
        const selectCards: any[] = [];
        if (isFlush) {
            rankInfo = rankTable7CF[keyOfRank];
            for (let i = 0; i < 5; i++) {
                selectCards[i] = rankInfo.CardPoint[i] * 10 + selectSuit;
            }
        } else {
            rankInfo = rankTable7CNF[keyOfRank];
            for (let i = 0; i < 5; i++) {
                selectCards[i] = rankInfo.CardPoint[i] * 10 + suitMap[rankInfo.CardPoint[i]].pop();
            }
        }
        rankInfo.SelectCards = selectCards;
        return rankInfo;
    }
    public static getWeigth(inputArray: number[][]) {
        const weigthArray: Array<{
        Type7: string,
        Rank: number,
        Type5Ch: string,
        Type5En: string,
        CardPoint: any[]}> = [];
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < inputArray.length; i++) {
            weigthArray.push(this.getRankInfo(inputArray[i]));
        }
        return weigthArray;
    }
    public static getHgetAllKeyValue(obj: any) {
        const keyName: any = [];
        const valueName: any = [];
        // tslint:disable-next-line:only-arrow-functions
        _.forEach(obj, function(value, key) {
            keyName.push(key);
            valueName.push(value);
        });
        return {
            keyName,
            valueName
        };
    }
    public static getSelfChannelName(playerID: string) {
        let text1 = '';
        let text2 = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 5; i++) {
          text1 += possible.charAt(Math.floor(Math.random() * possible.length));
          text2 += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text1 + playerID + text2;
    }
    public static getArraySortASC(inputArray: any[]) {
        inputArray.sort((a, b) => {
            return b - a;
        });
        return inputArray;
    }
}
