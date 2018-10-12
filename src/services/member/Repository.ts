import * as _ from 'lodash';
import 'reflect-metadata';
import { provide } from '../../ioc/ioc';
import BaseRepository from '../../models/BaseRepository';

@provide('MemberRepository')
export default class MemberRepository extends BaseRepository {
    constructor() { super(); }

    public async getMember(id): Promise<any> {
        const data = await this.apiManager.httpPost('127.0.0.1:3100/mock/getmember', {id});
        if (data.body.status === 1) {
            return data.body.result;
        }
        return 0;
    }
    // 修改密碼
    public async modifyPassword(no, password): Promise<any> {
        no = _.toString(no);
        const data = {
            c: 3,
            d: {
                no,
                password
            }
        };
        const res = await this.apiManager.httpPost('192.168.30.160/gbe/api/gateway.php', data, {Connection: 'close'});
        console.log('[password]][res:::]', res);
        if (res.body.s === true) {
            return 'success';
        }
        // const data = await this.apiManager.httpPost(
        //     '127.0.0.1:3100/mock/modifypassword',
        //     {no, password}
        // );
        // if (data.body.status) { // 連接狀態為true
        //     return data.body.status;
        // }
        return 0;
    }
    // 修改暱稱
    public async modifyNickname(no, nickname): Promise<any> {
        no = _.toString(no);
        const data = {
            c: 6,
            d: {
                no,
                nickname
            }
        };
        const res = await this.apiManager.httpPost('192.168.30.160/gbe/api/gateway.php', data, {Connection: 'close'});
        console.log('[nickname][res:::]', res);
        if (res.body.s) {
            return 'success';
        }
        // const data = await this.apiManager.httpPost(
        //     '127.0.0.1:3100/mock/modifynickname',
        //     {memberNo, nickname}
        // );
        // if (data.body.status) {
        //     return 'success';
        // }
        return 0;
    }
}
