import { rmdirSync } from 'fs';
import { join } from 'path';
import { expect, test } from '@oclif/test';
import { CpqQcpCreateResult } from '../../../../src/commands/cpq/qcp/create';

describe('creating qcp', () => {
  after(() => {
    const tempDirPath = join('./test', 'qcp');
    rmdirSync(tempDirPath, { recursive: true });
  });

  test
    .stdout()
    .command(['cpq qcp create', '--path', './test', '--qcpname', 'qcp'])
    .it('creating QCP', (ctx) => {
      const result = ctx.returned as CpqQcpCreateResult;
      expect(result.isSuccess).to.equal(true);
    });
});
