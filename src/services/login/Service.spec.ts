import { expect } from 'chai';
import { anything, instance, mock, reset, spy, when } from 'ts-mockito/lib/ts-mockito';

import { ErrorStatusCode } from '../../config/enum.http';
import Repository from './Repository';
import Service from './Service';

describe('LoginServer', () => {
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
    describe('normalLoginCheck', () => {
        // it('1-1.normal return 0 會出錯', async () => {
        //     when(repository.normal(
        //         anything(), anything(), anything(), anything(), anything())).thenReturn(Promise.resolve(
        //             0
        //         ));
        //     try {
        //         await test.normalLoginCheck(anything(), anything(), anything(), anything(), anything());
        //     } catch (error) {
        //         expected(error.status).to.deep.equal(ErrorStatusCode.STATUS_NO_MATCH_DATA);
        //     }
        // });
        // it('1-2.normal ', async () => {
        //     when(repository.normal(
        //         anything(), anything(), anything(), anything(), anything()
        //         )).thenReturn(Promise.resolve({
        //             id: 'Mei123',
        //             nickname: 'Mei Mei',
        //             realname: 'Mei Lin',
        //             diamond: 500,
        //             chip: 999
        //         }));
        //     const res = await test.normalLoginCheck(anything(), anything(), anything(), anything(), anything());
        //     expected(res).to.deep.equal({
        //         id: 'Mei123',
        //         nickname: 'Mei Mei',
        //         realname: 'Mei Lin',
        //         diamond: 500,
        //         chip: 999,
        //         // tslint:disable-next-line:no-null-keyword
        //         key: null
        //     });
        // });
    });
});
