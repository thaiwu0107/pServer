import { all, controller, cookies,
    httpDelete, httpGet, httpHead, httpMethod, httpPatch,
    httpPost, httpPut, next, queryParam,
    request, requestBody, requestHeaders, requestParam, response, TYPE } from 'inversify-koa-utils';
import { inject, provideNamed } from '../../ioc/ioc';
import BaseController from '../../models/BaseController';
import BaseResponse from '../../models/BaseResponse';
import IContext from '../../models/IContext';
import Service from './Service';
@provideNamed(TYPE.Controller, 'ForgetController')
@controller('/forget')
export default class ForgetController extends BaseController {
    constructor(
        @inject('ForgetServer') private service: Service) { super(); }

    // 忘記密碼入口
    @httpPost('/')
    public async forget(ctx: IContext) {
        const account = ctx.request.body.reqData.account;
        const verycode = ctx.request.body.reqData.verycode;
        const password = ctx.request.body.reqData.password;
        const platform = ctx.request.body.reqData.platform;
        const device = ctx.request.body.reqData.device;
        const address = {ip: ''};
        if (ctx.request.ip !== '::ffff:127.0.0.1') {
            address.ip = ctx.request.ip.match(/\d+.\d+.\d+.\d+/)[0];
        }
        const ip = address.ip;
        ctx.body = new BaseResponse(await this.service.forget(account, verycode, password, platform, device, ip));
    }
}
