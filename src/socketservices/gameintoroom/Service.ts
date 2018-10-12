import * as _ from 'lodash';
import 'reflect-metadata';
import { Constant } from '../../config/enum.constant';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import Repository from './Repository';

@provide('GameIntoRoomServer')
export default class GameIntoRoomServer extends BaseService {
    constructor(@inject('GameIntoRoomRepository') private repository: Repository) { super(); }

    public async intoRoom(data: {
        playerID: string,
        playertable: string,
        playChannelName: string
        session: string
    }): Promise<any> {
        const deskList = await this.repository.getDeskList();
        if (!_.some(deskList, (even) => {
            return even === data.playChannelName;
        })) {
            throw new Exceptions(9001, 'not found this channel');
        }
        const getPlayerRedisSession = await this.repository.getPlayerRedisSession(data.playerID);
        // if (_.toNumber(getPlayerRedisSession) !== _.toNumber(Constant.WHAT_THE_HACK)) {
        //     throw new Exceptions(9001, 'member: ' + data.playerID + ' already in other table');
        // }
        const deskInfo = await this.repository.getDeskInfo(data.playChannelName);
        await this.repository.initPlayer(
            data.playerID,
            data.playertable,
            data.playChannelName,
            data.session,
            deskInfo.playerCountDown
        );
        return deskInfo;
    }
}
