import { expect } from 'chai';
import * as moment from 'moment';
import { anything, instance, mock, reset, spy, when } from 'ts-mockito/lib/ts-mockito';

import { HttpStatusCode } from '../../config/enum.http';
import Repository from './Repository';
import Service from './Service';

describe('ChipService', () => {
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
            when(repository.give(
                anything(), anything(), anything())).thenReturn(Promise.resolve({
                    status: 1,
                    result: {
                        managerId: 'managerId',
                        playerId: 'playerId',
                        chips: 6666
                    }
                }));
            const res = await test.giveChips(anything(), anything(), anything());
            expected(res).to.deep.equal({
                managerId: 'managerId',
                playerId: 'playerId',
                chips: 6666
            });
        });
        it('1-2.假設status回傳0', async () => {
            when(repository.give(
                anything(), anything(), anything())).thenReturn(Promise.resolve({
                    status: 0,
                    result: {
                        managerId: 'managerId',
                        playerId: 'playerId',
                        chips: 6666
                    }
                }));
            try {
                await test.giveChips(anything(), anything(), anything());
            } catch (error) {
                expected(error.status).to.deep.equal(HttpStatusCode.STATUS_FAIL);
            }
        });
    });

    describe('takeBackChips', () => {
        it('2-1.假設status回傳1', async () => {
            when(repository.takeBack(
                anything(), anything(), anything())).thenReturn(Promise.resolve({
                    status: 1,
                    result: {
                        managerId: 'managerId',
                        playerId: 'playerId',
                        chips: 7777
                    }
                }));
            const res = await test.takeBackChips(anything(), anything(), anything());
            expected(res).to.deep.equal({
                managerId: 'managerId',
                playerId: 'playerId',
                chips: 7777
            });
        });
        it('2-2.假設status回傳0', async () => {
            when(repository.takeBack(
                anything(), anything(), anything())).thenReturn(Promise.resolve({
                    status: 0,
                    result: {
                        managerId: 'managerId',
                        playerId: 'playerId',
                        chips: 7777
                    }
                }));
            try {
                await test.takeBackChips(anything(), anything(), anything());
            } catch (error) {
                expected(error.status).to.deep.equal(HttpStatusCode.STATUS_FAIL);
            }
        });
    });

    describe('settlementChips', () => {
        it('3-1.假設status回傳1', async () => {
            when(repository.settlement(
                anything(), anything())).thenReturn(Promise.resolve({
                    status: 1,
                    result: 1
                }));
            const res = await test.settlementChips(anything(), anything());
            expected(res).to.deep.equal({
                result: 1
            });
        });
        it('3-2.假設status回傳0', async () => {
            when(repository.settlement(
                anything(), anything())).thenReturn(Promise.resolve({
                    status: 0,
                    result: 1
                }));
            try {
                await test.settlementChips(anything(), anything());
            } catch (error) {
                expected(error.status).to.deep.equal(HttpStatusCode.STATUS_FAIL);
            }
        });
    });

});
