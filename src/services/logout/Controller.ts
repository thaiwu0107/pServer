import { all, controller, cookies,
    httpDelete, httpGet, httpHead, httpMethod, httpPatch,
    httpPost, httpPut, next, queryParam,
    request, requestBody, requestHeaders, requestParam, response, TYPE } from 'inversify-koa-utils';
import { inject, provideNamed } from '../../ioc/ioc';
import BaseController from '../../models/BaseController';
import BaseResponse from '../../models/BaseResponse';
import IContext from '../../models/IContext';
import Service from './Service';

@provideNamed(TYPE.Controller, 'LogoutController')
@controller('/logout')
export default class LogoutController extends BaseController {
    constructor(
        @inject('LogoutServer') private service: Service) { super(); }

    // 正常退出賭桌
    @httpPost('/closeDesk')
    public async closeDesk(ctx: IContext) {
        const deskID = ctx.request.body.reqData.id;
        const sessionId = ctx.request.body.reqData.sessionId;
        ctx.body = new BaseResponse(await this.service.closeDesk(deskID, sessionId));
    }

    // 正常登出遊戲
    @httpPost('/signOut')
    public async signOut(ctx: IContext) {
        const token = ctx.request.body.reqData.token;
        const key = ctx.request.body.reqData.key;
        ctx.body = new BaseResponse(await this.service.signOut(key, token));
    }
}
