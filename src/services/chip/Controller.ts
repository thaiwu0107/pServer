import { all, controller, cookies,
    httpDelete, httpGet, httpHead, httpMethod, httpPatch,
    httpPost, httpPut, next, queryParam,
    request, requestBody, requestHeaders, requestParam, response, TYPE } from 'inversify-koa-utils';
import { inject, provideNamed } from '../../ioc/ioc';
import BaseController from '../../models/BaseController';
import BaseResponse from '../../models/BaseResponse';
import IContext from '../../models/IContext';
import Service from './Service';

@provideNamed(TYPE.Controller, 'ChipController')
@controller('/chip')
export default class ChipController extends BaseController {
    constructor(
        @inject('ChipService') private service: Service) { super(); }

    // 發放籌碼
    @httpPost('/give')
    public async give(ctx: IContext) {
        const managerId = ctx.request.body.reqData.managerId;
        const playerId = ctx.request.body.reqData.playerId;
        const chips = ctx.request.body.reqData.chips;
        ctx.body = new BaseResponse(await this.service.giveChips(managerId, playerId, chips));
    }

    // 收回籌碼
    @httpPost('/takeback')
    public async takeback(ctx: IContext) {
        const managerId = ctx.request.body.reqData.managerId;
        const playerId = ctx.request.body.reqData.playerId;
        const chips = ctx.request.body.reqData.chips;
        ctx.body = new BaseResponse(await this.service.takeBackChips(managerId, playerId, chips));
    }

    // 結算籌碼
    @httpPost('/settlement')
    public async settlement(ctx: IContext) {
        const id = ctx.request.body.reqData.id; // 玩家ID
        const chips = ctx.request.body.reqData.chips;
        ctx.body = new BaseResponse(await this.service.settlementChips(id, chips));
    }

    // 查詢籌碼紀錄
    @httpPost('log')
    public async log(ctx: IContext) {
        const id = ctx.request.body.reqData.id;
        ctx.body = new BaseResponse(await this.service.getChipLog(id));
    }
}
