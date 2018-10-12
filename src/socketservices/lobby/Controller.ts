import { all, controller, cookies,
  httpDelete, httpGet, httpHead, httpMethod, httpPatch,
  httpPost, httpPut, next, queryParam,
  request, requestBody, requestHeaders, requestParam, response, TYPE } from 'inversify-koa-utils';
import 'reflect-metadata';
import { inject, provide } from '../../ioc/ioc';
import WsEntity from '../../models/WsEntity';
import Service from './Service';

@provide('LobbyController')
export default class LobbyController {
  constructor(@inject('LobbyServer') private service: Service) {  }
  public async on(ws: WsEntity, data: any, ip: any): Promise<any> {
    // console.log('data', data);
  }
}
