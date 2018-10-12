import { expect } from 'chai';
import * as moment from 'moment';
import { anything, instance, mock, reset, spy, when } from 'ts-mockito/lib/ts-mockito';

import { HttpStatusCode } from '../../config/enum.http';
import Repository from './Repository';
import Service from './Service';

describe('MemberServer', () => {
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
    describe('getMember', () => {
        it('1-1.getMember return 0 會出錯', async () => {
            when(repository.getMember(anything())).thenReturn(Promise.resolve(
                    0
                ));
            try {
                await test.getMember(anything());
            } catch (error) {
                expected(error.status).to.deep.equal(HttpStatusCode.STATUS_NO_MATCH_DATA);
            }
        });
        it('1-2.getMember 執行正常 ', async () => {
            when(repository.getMember(anything())).thenReturn(Promise.resolve({
                id: 1,
                nickname: 'Tom Cruise'
            }));
            const res = await test.getMember(anything());
            expected(res).to.deep.equal({
                id: 1,
                nickname: 'Tom Cruise'
            });
        });
    });
});
