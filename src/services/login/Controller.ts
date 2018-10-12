import { all, controller, cookies,
    httpDelete, httpGet, httpHead, httpMethod, httpPatch,
    httpPost, httpPut, next, queryParam,
    request, requestBody, requestHeaders, requestParam, response, TYPE } from 'inversify-koa-utils';
import { inject, provideNamed } from '../../ioc/ioc';
import BaseController from '../../models/BaseController';
import BaseResponse from '../../models/BaseResponse';
import IContext from '../../models/IContext';
import Utils from '../../utils/Utils';
import Service from './Service';

@provideNamed(TYPE.Controller, 'LoginController')
@controller('/login')
export default class LoginController extends BaseController {
    constructor(
        @inject('LoginServer') private service: Service) { super(); }

    // 正常登入 輸入帳密
    @httpPost('/normal')
    public async normal(ctx: IContext) {
        const account = ctx.request.body.reqData.account;
        const password = ctx.request.body.reqData.password;
        const address = {ip: ''};
        if (ctx.request.ip !== '::ffff:127.0.0.1') {
            address.ip = ctx.request.ip.match(/\d+.\d+.\d+.\d+/)[0];
        }
        const ip = address.ip;
        const platform = ctx.request.body.reqData.platform;
        const device = ctx.request.body.reqData.device;
        const browser = ctx.request.body.reqData.browser;
        ctx.body = new BaseResponse(await this.service.normalLoginCheck(account, password, ip, platform,
            device, browser));
    }

    // 快速登入 有 token
    @httpPost('/quick')
    public async quick(ctx: IContext) {
        const member = ctx.state.user as any;
        const id = Utils.Decryption_AES_ECB_128(member.id);
        const key = ctx.request.body.reqData.key;
        const token = ctx.request.body.reqData.token;
        const address = {ip: ''};
        if (ctx.request.ip !== '::ffff:127.0.0.1') {
            address.ip = ctx.request.ip.match(/\d+.\d+.\d+.\d+/)[0];
        }
        const ip = address.ip;
        const platform = ctx.request.body.reqData.platform;
        const device = ctx.request.body.reqData.device;
        const browser = ctx.request.body.reqData.browser;
        ctx.body = new BaseResponse(await this.service.quickLoginCheck(id, key, token, ip, platform,
            device, browser));
    }

    // 遊客登入
    @httpPost('/visitor')
    public async visitor(ctx: IContext) {
        const platform = ctx.request.body.reqData.platform;
        const device = ctx.request.body.reqData.device;
        const ip = ctx.request.ip.match(/\d+.\d+.\d+.\d+/)[0];
        ctx.body = new BaseResponse(await this.service.visitorLoginCheck(platform, device, ip));
    }
}
