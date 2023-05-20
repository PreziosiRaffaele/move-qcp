import { expect, test } from '@oclif/test';
import { Connection, AuthInfo } from '@salesforce/core';
import { CpqQcpDeployResult } from '../../../../src/commands/cpq/qcp/deploy';

describe('deploy qcp', () => {
  test
    .stub(AuthInfo, 'create', () => Promise.resolve({}))
    .stub(Connection, 'create', () =>
      Promise.resolve({
        query: () => Promise.resolve({ records: [] }),
        insert: () => Promise.resolve({ Id: 'a0P0o0000123456', success: true }),
      })
    )
    .stdout()
    .command(['cpq qcp deploy', '--targetusername', 'test@test.com', '--pathmain', './test'])
    .it('insert QCP', (ctx) => {
      const result = ctx.returned as CpqQcpDeployResult;
      expect(result.isSuccess).to.equal(true);
      expect(result.recordId).to.equal('a0P0o0000123456');
    });

  test
    .stub(AuthInfo, 'create', () => Promise.resolve({}))
    .stub(Connection, 'create', () =>
      Promise.resolve({
        query: () => Promise.resolve({ records: [{ Id: 'a0P0o0000123451' }] }),
        update: () => Promise.resolve([{ Id: 'a0P0o0000123451', success: true }]),
      })
    )
    .stdout()
    .command(['cpq qcp deploy', '--targetusername', 'test@test.com', '--pathmain', './test'])
    .it('update QCP', (ctx) => {
      const result = ctx.returned as CpqQcpDeployResult;
      expect(result.isSuccess).to.equal(true);
      expect(result.recordId).to.equal('a0P0o0000123451');
    });
});
