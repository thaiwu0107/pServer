import { sign } from 'jsonwebtoken';
import * as _ from 'lodash';
import 'reflect-metadata';
import config from '../../config/config.app';
import { inject, provide } from '../../ioc/ioc';
import BaseService from '../../models/BaseService';
import Exceptions from '../../models/Exceptions';
import Repository from './Repository';
@provide('ForgetServer')
export default class ForgetServer extends BaseService {
    constructor(@inject('ForgetRepository') private repository: Repository) { super(); }

    public async forget(account, verycode, password, platform, device, ip): Promise<any> {
        const verify = await this.repository.verification(account, verycode);
        if (verify === 0) {
            throw new Exceptions(8002, 'verification fail');
        }
        const res = await this.repository.forget(account, password);
        if (res === 0) {
            throw new Exceptions(8001, 'forget password fail');
        } else {
            return {
                msssage: 'success'
            };
        }
    }
}
