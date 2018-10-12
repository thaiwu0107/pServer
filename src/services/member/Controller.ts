import { all, controller, cookies,
    httpDelete, httpGet, httpHead, httpMethod, httpPatch,
    httpPost, httpPut, next, queryParam,
    request, requestBody, requestHeaders, requestParam, response, TYPE } from 'inversify-koa-utils';
import { inject, provideNamed } from '../../ioc/ioc';
import BaseController from '../../models/BaseController';
import BaseResponse from '../../models/BaseResponse';
import IContext from '../../models/IContext';
import BaseUtils from '../../utils/BaseUtils';
import Service from './Service';

@provideNamed(TYPE.Controller, 'MemberController')
@controller('/member')
export default class MemberController extends BaseController {
    constructor(
        @inject('MemberServer') private service: Service) { super(); }

    // 取得玩家資料
    @httpPost('/getmember')
    public async getMember(ctx: IContext) {
        const id = ctx.request.body.reqData.id;
        ctx.body = new BaseResponse(await this.service.getMember(id));
    }

    // 修改密碼
    @httpPost('/modifypassword')
    public async modifyPassword(ctx: IContext) {
        console.log(ctx);
        // const id = await BaseUtils.Decryption_AES_ECB_128(ctx.request.body.reqData.id); // 會員序號
        const id = ctx.request.body.reqData.id; // 會員序號
        const password = ctx.request.body.reqData.password; // 會員密碼
        console.log('id:', id, 'password:', password);
        ctx.body = new BaseResponse(await this.service.modifyPassword(id, password));
    }

    // 修改暱稱
    @httpPost('/modifynickname')
    public async modifyNickname(ctx: IContext) {
        // const id = await BaseUtils.Decryption_AES_ECB_128(ctx.request.body.reqData.id); // 會員序號
        const id = ctx.request.body.reqData.id; // 會員序號
        const nickname = ctx.request.body.reqData.nickname; // 會員暱稱
        ctx.body = new BaseResponse(await this.service.modifyNickname(id, nickname));
    }
}
