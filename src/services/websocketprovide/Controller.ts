import { all, controller, cookies,
    httpDelete, httpGet, httpHead, httpMethod, httpPatch,
    httpPost, httpPut, next, queryParam,
    request, requestBody, requestHeaders, requestParam, response, TYPE } from 'inversify-koa-utils';
import * as log4js from 'koa-log4';
import * as _ from 'lodash';
import 'reflect-metadata';
import { SocketConstant } from '../../config/SocketConstant';
import { inject, provideNamed } from '../../ioc/ioc';
import WebSocketContext from '../../models/WebSocketContext';
import WsEntity from '../../models/WsEntity';
import GameButtonAllinController from '../../socketservices/gamebuttonallin/Controller';
import GameButtonCheckController from '../../socketservices/gamebuttoncheck/Controller';
import GameButtonFoldController from '../../socketservices/gamebuttonfold/Controller';
import GameIntoRoomController from '../../socketservices/gameintoroom/Controller';
import GameSelectSeatController from '../../socketservices/gameselectseat/Controller';
import GameStartController from '../../socketservices/gamestart/Controller';
import LobbyController from '../../socketservices/lobby/Controller';
import LobbyTexasController from '../../socketservices/lobbytexas/Controller';
import PublishController from '../../socketservices/publish/Controller';

const _log = log4js.getLogger('WebSocketProvideController');

@provideNamed(TYPE.Controller, 'WebSocketProvideController')
export default class WebSocketProvideController {
    private constructor(
        @inject('LobbyController') private lobbycontroller: LobbyController,
        @inject('GameIntoRoomController') private gameIntoroomController: GameIntoRoomController,
        @inject('GameSelectSeatController') private gameSelectSeatController: GameSelectSeatController,
        @inject('PublishController') private publishController: PublishController,
        @inject('LobbyTexasController') private lobbyTexasController: LobbyTexasController,
        @inject('GameButtonFoldController') private gameButtonFoldController: GameButtonFoldController,
        @inject('GameStartController') private gameStartController: GameStartController,
        @inject('GameButtonCheckController') private gameButtonCheckController: GameButtonCheckController,
        @inject('GameButtonAllinController') private gameButtonAllinController: GameButtonAllinController
    ) {
        this.on();
    }
    private on() {
        WebSocketContext.getInstance().onConnection((ws: WsEntity, req, head) => {
            _log.info(SocketConstant.CONNECTION, req.connection.remoteAddress);
            ws.on(SocketConstant.LOBBY, (data) => {
                this.lobbycontroller.on(ws, data, req.connection.remoteAddress)
                .catch((error) => {
                    _log.error(error);
                });
            });

            ws.on(SocketConstant.LOBBY_TEXAS, (data) => {
                this.lobbyTexasController.on(ws, data, req.connection.remoteAddress)
                .catch((error) => {
                    _log.error(error);
                });
            });
            ws.on(SocketConstant.GAME_BUTTON_FOLD, (data) => {
                this.gameButtonFoldController.on(ws, data)
                .catch((error) => {
                    _log.error(error);
                });
            });
            ws.on(SocketConstant.GAME_BUTTON_CHECK, (data) => {
                this.gameButtonCheckController.on(ws, data)
                .catch((error) => {
                    _log.error(error);
                });
            });
            ws.on(SocketConstant.GAME_BUTTON_ALLIN, (data) => {
                this.gameButtonAllinController.on(ws, data)
                .catch((error) => {
                    _log.error(error);
                });
            });
            ws.on(SocketConstant.GAME_INTO_ROOM, (data) => {
                this.gameIntoroomController.on(ws, data)
                .catch((error) => {
                    _log.error(error);
                });
            });
            ws.on(SocketConstant.GAME_START, (data) => {
                this.gameStartController.on(ws, data)
                .catch((error) => {
                    _log.error(error);
                });
            });
            ws.on(SocketConstant.GAME_SELECT_SEAT, (data) => {
                this.gameSelectSeatController.on(ws, data)
                .catch((error) => {
                    _log.error(error);
                });
            });
            ws.on(SocketConstant.DISCONNECT, (code: number, reason: string): void => {
                _log.info(SocketConstant.DISCONNECT,
                    req.connection.remoteAddress + 'code : ' + code + ', reason : ' + reason);
            });
            ws.on(SocketConstant.ERROR, (err: Error) => {
                _log.error(SocketConstant.ERROR, req.connection.remoteAddress + ', error : ' + err);
            });
        });
        WebSocketContext.getInstance().getWebsocket().setMiddleware(SocketConstant.ON_CHANNEL_OPEN, (channel) => {
            // channel: name of the channel
        });
        WebSocketContext.getInstance().getWebsocket().setMiddleware(SocketConstant.ON_CHANNEL_CLOSE, (channel) => {
            // channel: name of the channel
        });
        WebSocketContext.getInstance().getWebsocket().setMiddleware(
            SocketConstant.ON_PUBLISH, (channel: string, data: any): void => {
            _log.info(SocketConstant.ON_PUBLISH, data);
            this.publishController.on(channel, data);
        });
        WebSocketContext.getInstance().getWebsocket().setWatcher(SocketConstant.JOIN, (data) => {
            this.publishController.join(data);
        });
    }
}
interface IWS {
    on: (event: SocketConstant, data: (adata?: any, tdata?: any) => void) => {};
}
