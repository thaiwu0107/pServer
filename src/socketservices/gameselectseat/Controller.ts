import * as _ from 'lodash';
import 'reflect-metadata';
import { GameListen } from '../../config/GameListen';
import { GameSend } from '../../config/GameSend';
import { inject, provide } from '../../ioc/ioc';
import BaseController from '../../models/BaseController';
import WsEntity from '../../models/WsEntity';
import Service from './Service';

@provide('GameSelectSeatController')
export default class GameSelectSeatController extends BaseController {
    constructor(@inject('GameSelectSeatServer')private service: Service) {
        super();
    }
    public async on(ws: WsEntity, data: any): Promise<any> {
        switch (data.protocol) {
            case GameListen.PROTOCOL_SELECT_SEAT:
                const playerID = data.data.playerID;
                const position = data.data.position;
                const point = data.data.point;
                let deskInfo;
                deskInfo = await this.service.SelectSeat(playerID, position, point)
                .catch((error) => {
                    ws.send(GameSend.EVENT_SEND_DESKSDATA, GameSend.PROTOCOL_SEND_SIT, error);
                    throw error;
                });
                await this.socketPushManager.publishChannel('publicAll' + data.data.playChannelName, {
                    deskInfo,
                    protocol: 3
                });
                break;
        }
    }
}
