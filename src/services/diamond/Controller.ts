import { all, controller, cookies,
    httpDelete, httpGet, httpHead, httpMethod, httpPatch,
    httpPost, httpPut, next, queryParam,
    request, requestBody, requestHeaders, requestParam, response, TYPE } from 'inversify-koa-utils';
import { inject, provideNamed } from '../../ioc/ioc';
import BaseController from '../../models/BaseController';
import BaseResponse from '../../models/BaseResponse';
import IContext from '../../models/IContext';
import Service from './Service';

@provideNamed(TYPE.Controller, 'DiamondController')
@controller('/diamond')
export default class DiamondController extends BaseController {
    constructor(
        @inject('DiamondService') private service: Service) { super(); }

    // 儲值鑽石
    @httpPost('/deposit')
    public async deposit(ctx: IContext) {
        const id = ctx.request.body.reqData.id;
        const diamonds = ctx.request.body.reqData.diamonds;
        ctx.body = new BaseResponse(await this.service.depositDiamonds(id, diamonds));
    }

    // 花費鑽石
    @httpPost('/cost')
    public async cost(ctx: IContext) {
        const id = ctx.request.body.reqData.id;
        const diamonds = ctx.request.body.reqData.diamonds;
        ctx.body = new BaseResponse(await this.service.costDiamonds(id, diamonds));
    }

    // 查詢鑽石紀錄
    @httpPost('log')
    public async log(ctx: IContext) {
        const id = ctx.request.body.reqData.id;
        ctx.body = new BaseResponse(await this.service.getDiamondLog(id));
    }
}
