import * as log4js from 'koa-log4';
import * as _ from 'lodash';
import 'reflect-metadata';
import MysqlContext from './MySqlContext';

const _log = log4js.getLogger('Transaction');

export default class Transaction implements ITransaction {
    private transPromise: Promise<any>;
    private trans: {
        conn: any
        begin: () => {},
        commit: () => {},
        rollback: () => {}
    } = {
        conn: undefined,
        begin: async () => {await this.begin(); },
        commit: async () => {await this.commit(); },
        rollback: async () => {await this.rollback(); }
    };
    constructor(dbName?: string) {
        this.transPromise = MysqlContext.getInstance().getBean(_.isUndefined(dbName) ? 'main' : dbName!);
        return this.trans as any;
    }
    public async begin(): Promise<any> {
        this.trans.conn = await this.transPromise;
        await this.trans.conn.query('SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED');
        await this.trans.conn.beginTransaction();
    }
    public async commit(): Promise<any> {
        await this.trans.conn.commit();
        await this.trans.conn.release();
        // tslint:disable-next-line:no-null-keyword
        this.trans.begin = null as any;
        // tslint:disable-next-line:no-null-keyword
        this.trans.commit = null as any;
        // tslint:disable-next-line:no-null-keyword
        this.trans.rollback = null as any;
        // tslint:disable-next-line:no-null-keyword
        this.trans.conn = null as any;
    }
    public async rollback(): Promise<any> {
        await this.trans.conn.rollback();
        await this.trans.conn.release();
        // tslint:disable-next-line:no-null-keyword
        this.trans.begin = null as any;
        // tslint:disable-next-line:no-null-keyword
        this.trans.commit = null as any;
        // tslint:disable-next-line:no-null-keyword
        this.trans.rollback = null as any;
        // tslint:disable-next-line:no-null-keyword
        this.trans.conn = null as any;
    }
    /**
     * 注意!!這是為了Mock注入的hook,單純為了注入依賴,非常規使用
     * 請不要隨意使用這個方法
     * @static
     * @param {*} mockOrm
     * @memberof Context
     */
    public setMockContext(mockOrm: any) {
        this.trans.conn = mockOrm;
    }
}
export interface ITransaction {
    begin(): Promise<any>;
    commit(): Promise<any>;
    rollback(): Promise<any>;
}
