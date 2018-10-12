import { expect } from 'chai';
import * as moment from 'moment';
import { anything, instance, mock, reset, spy, when } from 'ts-mockito/lib/ts-mockito';

import { HttpStatusCode } from '../../config/enum.http';
import Repository from './Repository';
import Service from './Service';

describe('DiamondService', () => {
    let test: Service;
    let repository: Repository;
    let mockSelf: Service;
    let expectDone;
    const expected = (target?: any, message?: string) => {
        expectDone = true;
        return expect(target, message);
    };
    beforeEach(() => {
        expectDone = false;
        repository = mock(Repository);
        test = new Service(instance(repository));
        mockSelf = spy(test);
    });
    afterEach('這個方法有寫驗證但是沒有驗證到', () => {
        expect(expectDone).to.equal(true);
        reset(mockSelf);
        reset(repository);
    });
    describe('depositDiamonds', () => {
        it('1-1.假設status回傳1', async () => {
            when(repository.deposit(
                anything(), anything())).thenReturn(Promise.resolve({
                    status: 1,
                    result: {
                        playerId: 'd',
                        diamonds: 100
                    }
                }));
            const res = await test.depositDiamonds(anything(), anything());
            expected(res).to.deep.equal({
                playerId: 'd',
                diamonds: 100
            });
        });
        it('1-2.假設status回傳0', async () => {
            when(repository.deposit(
                anything(), anything())).thenReturn(Promise.resolve({
                    status: 0,
                    result: {
                        playerId: 'd',
                        diamonds: 100
                    }
                }));
            try {
                await test.depositDiamonds(anything(), anything());
            } catch (error) {
                expected(error.status).to.deep.equal(HttpStatusCode.STATUS_FAIL);
            }
        });
    });

    describe('costDiamonds', () => {
        it('2-1.假設status回傳1', async () => {
            when(repository.cost(
                anything(), anything())).thenReturn(Promise.resolve({
                    status: 1,
                    result: {
                        playerId: 'd',
                        diamonds: 100
                    }
                }));
            const res = await test.costDiamonds(anything(), anything());
            expected(res).to.deep.equal({
                playerId: 'd',
                diamonds: 100
            });
        });
        it('2-2.假設status回傳0', async () => {
            when(repository.cost(
                anything(), anything())).thenReturn(Promise.resolve({
                    status: 0,
                    result: {
                        playerId: 'd',
                        diamonds: 100
                    }
                }));
            try {
                await test.costDiamonds(anything(), anything());
            } catch (error) {
                expected(error.status).to.deep.equal(HttpStatusCode.STATUS_FAIL);
            }
        });
    });

});
