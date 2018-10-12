import { all, controller, cookies,
    httpDelete, httpGet, httpHead, httpMethod, httpPatch,
    httpPost, httpPut, next, queryParam,
    request, requestBody, requestHeaders, requestParam, response, TYPE } from 'inversify-koa-utils';
import { inject, provideNamed } from '../../ioc/ioc';
import BaseController from '../../models/BaseController';
import BaseResponse from '../../models/BaseResponse';
import IContext from '../../models/IContext';
import Service from './Service';
@provideNamed(TYPE.Controller, 'RegisterController')
@controller('/register')
export default class RegisterController extends BaseController {
    constructor(
        @inject('RegisterServer') private service: Service) { super(); }

    // 註冊入口
    @httpPost('/')
    public async register(ctx: IContext) {
        const account = ctx.request.body.reqData.account;
        const verycode = ctx.request.body.reqData.verycode;
        const password = ctx.request.body.reqData.password;
        const platform = ctx.request.body.reqData.platform;
        const device = ctx.request.body.reqData.device;
        const browser = ctx.request.body.reqData.browser;
        const address = {ip: ''};
        if (ctx.request.ip !== '::ffff:127.0.0.1') {
            address.ip = ctx.request.ip.match(/\d+.\d+.\d+.\d+/)[0];
        }
        const ip = address.ip;
        ctx.body = new BaseResponse(await this.service.register(account, verycode, password,
            platform, device, ip, browser));
    }
}
