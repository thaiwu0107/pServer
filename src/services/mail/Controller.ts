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
@provideNamed(TYPE.Controller, 'MailController')
@controller('/mail')
export default class MailController extends BaseController {
    constructor(
        @inject('MailServer') private service: Service) { super(); }

    // 寄送 mail
    @httpPost('/')
    public async mail(ctx: IContext) {
        const playerMail = ctx.request.body.reqData.mail;
        ctx.body = new BaseResponse(await this.service.sendMail(playerMail));
    }
    // 修改信箱
    @httpPost('/modifyemail')
    public async modifyEmail(ctx: IContext) {
        // const id = await BaseUtils.Decryption_AES_ECB_128(ctx.request.body.reqData.id); // 會員序號
        const id = ctx.request.body.reqData.id;
        const email = ctx.request.body.reqData.email; // 會員信箱
        const verycode = ctx.request.body.reqData.verycode; // 信箱驗證碼
        ctx.body = new BaseResponse(await this.service.modifyEmail(id, email, verycode));
    }
}
