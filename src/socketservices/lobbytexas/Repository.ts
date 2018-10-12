import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { GameRedis } from '../../config/GameRedis';
import { inject, provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';
import Exceptions from '../../models/Exceptions';
import Transaction from '../../models/Transaction';

@provide('LobbyTexasRepository')
export default class LobbyTexasRepository extends BaseRepository {
    constructor() {
        super();
    }
    public async initDeskSeat(
        tableNumber: number,
        totalTime: number,
        sessionID: number,
        plays: number,
        desksChannel: string,
        deskSec: number,
        deskMinbet: number,
        deskMaxbet: number,
        desksb: number,
        deskbb: number,
        deskCountDown: number,
        memberId): Promise<any> {
        const initOnePlays: number[] = _.fill(Array(plays), -1);
        const initZeroPlays: number[] = _.fill(Array(plays), 0);
        const init100Plays: number[] = _.fill(Array(plays), 100);
        const pipeline = this.redisManger.pipeline();
        return pipeline
            // 清除
            .del(GameRedis.HASH_DESKINFO + desksChannel,
                GameRedis.LIST_PLAYER_SIT + desksChannel,
                GameRedis.LIST_PLAYING_PLAYER + desksChannel,
                GameRedis.LIST_LOOK_PLAYER + desksChannel,
                GameRedis.LIST_PLAYER_POINT + desksChannel,
                GameRedis.LIST_WEIGHT + desksChannel,
                GameRedis.LIST_WIN + desksChannel,
                GameRedis.LIST_PLAYER_ACTION + desksChannel,
                GameRedis.LIST_ROUND_WIN_PRICE + desksChannel,
                GameRedis.LIST_ONLINE_PLAYER + desksChannel)
            // 開始重置
            .hmset(GameRedis.HASH_DESKINFO + desksChannel, {
                sessionID,
                tableNumber,
                deskStatus: 0, // 牌桌是否已開始
                desksChannel, // 頻道名稱
                deskPeople: 0, // 目前玩家數量
                seatSpace: plays,  // 位置空間
                nowPlayer: -1, // 目前要決定動作的玩家
                deskMin: deskMinbet,
                deskMax: deskMaxbet,
                dHost: -1, // 莊家
                dSmall: -1, // 小忙
                dBig: -1, // 大忙
                dSmallCost: desksb, // 小忙
                dBigCost: deskbb, // 大忙注金額
                deskMoney: 0, // 目前押注金額
                frontMoney: 100,
                round: 0,	// 目前倫數
                timeUp: deskCountDown,  // 牌桌倒數
                castTime: 0, // 本局耗時
                totalTime, // 本桌總可用時間
                countDown: Constant.GAME_START_COUNTDOWN_DEFAULT, // 倒數計時
                countDowner: 0, // 倒數計時的人啟動了沒
                playerCountDown: deskSec, // 預設玩家思考
                masterCountDowner: -1 // 場主模式
            })
            .rpush(GameRedis.LIST_PLAYER_SIT + desksChannel, ...initOnePlays)
            .rpush(GameRedis.LIST_PLAYING_PLAYER + desksChannel, ...initOnePlays)
            .rpush(GameRedis.LIST_LOOK_PLAYER + desksChannel, memberId)
            .rpush(GameRedis.LIST_PLAYER_POINT + desksChannel, ...initOnePlays)
            .rpush(GameRedis.LIST_WEIGHT + desksChannel, ...initOnePlays)
            .rpush(GameRedis.LIST_WIN + desksChannel, 0)
            .rpush(GameRedis.LIST_PLAYER_ACTION + desksChannel, ...init100Plays)
            .rpush(GameRedis.LIST_ROUND_WIN_PRICE + desksChannel, ...initOnePlays)
            .rpush(GameRedis.LIST_ONLINE_PLAYER + desksChannel, 0)
            .rpush(GameRedis.DESK_PLAYING, desksChannel)
            .exec();
    }

    public async insertSessionRecord(
        rule: number,
        id: number,
        type: number,
        trans: Transaction
    ): Promise<any> {
        const insert =
            'INSERT INTO porkerdb.session_record (sr_tableConfigID, sr_tableStatusID, sr_tableTypeID) VALUES (?, ?, ?)';
        return this.sqlManager.insert(insert, [rule, id, type], trans);
    }

    // 查詢 table_status 第一筆
    public async selectTableStatusList(
        status: number,
        type: number,
        trans?: Transaction
    ): Promise<{
        id: number, ts_session, ts_table, ts_ruleid, ts_type, ts_status, ts_people, ts_start, ts_end
    } | 0> {
        const select =
            'select id, ts_session, ts_table, ts_ruleid, ts_type, ts_status, ts_people, ts_start, ts_end \
        from table_status where (ts_status = ? && ts_type = ? ) order by ts_table LIMIT 1';
        const res = await this.sqlManager.query(select, [status, type], trans);
        return res[0] || 0;
    }

    // 查詢 table_status
    public async selectTableStatus(
        status: number,
        type: number,
        tableId: number,
        trans: Transaction
    ): Promise<{ id, ts_session, ts_table, ts_ruleid, ts_type, ts_status, ts_people, ts_start, ts_end }> {
        const select =
            'select id, ts_session, ts_table, ts_ruleid, ts_type, ts_status, ts_people, ts_start, ts_end \
            from table_status where (ts_status = ? && ts_type = ? && ts_table = ?) ';
        const res = await this.sqlManager.query(
            select,
            [status, type, tableId],
            trans
        );
        if (_.size(res) === 1) {
            return res[0];
        } else {
            return {} as any;
        }
    }

    // 查詢 table_status.ts_table
    public async selectTableStatusTableId(
        status: number,
        type: number,
        trans: Transaction
    ): Promise<{ ts_table }> {
        const select =
            'select ts_table from table_status where (ts_status = ? && ts_type = ?) order by ts_table DESC LIMIT 1';
        const res = await this.sqlManager.query(select, [status, type], trans);
        return _.size(res) === 0 ? 0 : res[0].ts_table;
    }

    // 新增 table_status
    public async insertTableStatus(
        tableName: string,
        tableNumber: number,
        rule: number,
        type: number,
        status: number,
        people: number,
        startTime: Date,
        trans: Transaction
    ): Promise<any> {
        const insert =
            'INSERT INTO porkerdb.table_status (ts_name, ts_table, ts_ruleid, ts_type, ts_status, ts_people, ts_start) \
       VALUES (?, ?, ?, ?, ?, ? , ?)';
        return this.sqlManager.insert(insert,
            [tableName, tableNumber, rule, type, status, people, startTime], trans);
    }

    // 修改 table_status
    public async updateTableStatus(
        tableName: string,
        rule: number,
        status: number,
        people: number,
        tableID: number,
        startTime: Date,
        tableDeskNumber,
        trans: Transaction
    ): Promise<any> {
        const update =
            'UPDATE porkerdb.table_status set ts_ruleid = ?, \
            ts_status = ?, ts_people = ?, ts_start = ? ts_name = ? where (id = ? && ts_table = ?)';
        const res = await this.sqlManager.query(
            update, [rule, status, people, startTime, tableName, tableID, tableDeskNumber], trans);
        return res[0] || -1;
    }

    // 修改 table_status.ts_session
    public async updateTableStatusSessionId(
        sessionId: number,
        status: number,
        type: number,
        tableId: number,
        trans: Transaction
    ): Promise<any> {
        const update =
            'UPDATE porkerdb.table_status set ts_session = ? where (ts_status = ? and ts_type = ? and id = ?) ';
        const res = await this.sqlManager.query(update, [sessionId, status, type, tableId], trans);
        return res[0] || -1;
    }

    /**
     * 虛構的等真正的MEMBER db才是真正去勞資料
     *
     * @param {number} memberId
     * @param {Transaction} trans
     * @returns {(Promise<{ money } | -1>)}
     * @memberof LobbyTexasRepository
     */
    public async checkGamePoint(
        memberId: number,
        trans: Transaction
    ): Promise<{ UM_Point, UM_goldpoint } | undefined> {
        const select = 'select UM_Point, UM_goldpoint from porkerdb.ts_usermember where (UM_No = ?) limit 1';
        const res = await this.sqlManager.query(select, [memberId], trans);
        return res[0] || undefined;
    }

    public async setGamePointZero(
        goldpoint: number,
        memberId: number,
        trans: Transaction
    ): Promise<any> {
        const select = 'UPDATE porkerdb.ts_usermember set UM_Point = 0 ,UM_goldpoint = ? where (UM_No = ? )';
        return this.sqlManager.query(select, [goldpoint, memberId], trans);
    }

    public async insertNLHRule(
        countDown: number,
        sb: number,
        bb: number,
        minbet: number,
        maxbet: number,
        sec: number,
        seat: number,
        multdeal: number,
        insurance: number,
        rake: number,
        toprake: Float32Array,
        buyin: number,
        gps: number,
        ip: number,
        tableTime: Float32Array,
        trans: Transaction
    ): Promise<any> {
        const insert =
            'INSERT INTO porkerdb.nlh_rule \
        (tc_countDown, tc_sb, tc_bb, tc_minbet, tc_maxbet, tc_sec, tc_seat, tc_multdeal, tc_insurance, \
            tc_rake, tc_toprake, tc_buyin, tc_gps, tc_ip,\
             tc_table_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        return this.sqlManager.insert(insert, [countDown, sb, bb, minbet, maxbet, sec, seat, multdeal,
            insurance, rake, toprake, buyin, gps, ip, tableTime], trans);
    }

    // 查詢 table_type
    public async selectTableType(
        type: number,
        trans: Transaction
    ): Promise<{ id, tt_game, tt_type }> {
        const select = 'select id, tt_game, tt_type from table_type where (id = ?)';
        const res = await this.sqlManager.query(select, [type], trans);
        return res[0] || -1;
    }

    /**
     * 初始化PLAYER
     *
     */
    public async initPlayer(recordID: string , channelName: string, nickName: string, tableNumber: number,
        gamePoint: string, memberId: number, redisPlayerKey): Promise<any> {
        const pipeline = this.redisManger.pipeline();
        return pipeline
            .del(redisPlayerKey)
            .hmset(redisPlayerKey, {
                table: tableNumber,
                sessionRecordID: recordID,
                roundStatusID: -1,
                channelName,
                seat: -1,
                nickName,
                amount: gamePoint,
                handsAmount: -1,
                costTime: 0,
                diamond: 0,
                bet: -1,
                action: Constant.STATUS_LOOK,
                countDown: -1,
                deskBetPool: -1,
                insurance: -1
            })
            .rpush(GameRedis.LIST_POKER + memberId, -1, -1)
            .exec();
    }
    public async getPlayerRedisSession(memberId): Promise<any> {
        const res = await this.redisManger.hmget(GameRedis.HASH_PLAYERINFO + memberId, 'sessionRecordID');
        return res[0] || 0;
    }
    public async getAllDeskList(): Promise<object> {
        // 從Redis撈取所有桌子與桌子資訊
        // 撈取所有桌子名稱之Key: this.redisManger.hmget(GameRedis.LIST_ALLDESKNAME);
        const allDeskName =  await this.redisManger.lrange(GameRedis.DESK_PLAYING, 0, -1); // 取得目前全部的桌子
        const deskList = [] as any;
        const pipe = await this.redisManger.pipeline();
        for (const i of allDeskName) {
            pipe.hgetall(GameRedis.HASH_DESKINFO + i);
        }
        const res = await pipe.exec();
        for (const data of res) {
            if (data[0]) {
                throw new Exceptions(9001, 'some thing error');
            } else {
                deskList.push({
                    deskID : data[1].desksChannel,
                    dSmallCost: data[1].dSmallCost,
                    dBigCost: data[1].dBigCost,
                    deskMin: data[1].deskMin,
                    deskMax: data[1].deskMax,
                    timeUp: data[1].timeUp,
                    deskStatus: data[1].deskStatus,
                    seatSpace: data[1].seatSpace
                });
            }
        }
        return deskList;
    }
}
