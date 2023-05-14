import { expect, test } from '@oclif/test';
import { Connection, AuthInfo } from '@salesforce/core';
import { deployQCP } from '../../../../src/HandleDeployQCP';

describe('cpq qcp deploy', () => {
  test
    .stub(AuthInfo, 'create', () => Promise.resolve({}))
    .stub(Connection, 'create', () => Promise.resolve({}))
    .stub(deployQCP, 'rollup', () => Promise.resolve('console.log("hello world");'))
    .stub(deployQCP, 'fetchQuoteCalculatorPlugin', () => Promise.resolve(null))
    .stub(deployQCP, 'upsertQuoteCalculatorPlugin', () => Promise.resolve({ Id: 'a0P0o0000123456', success: true }))
    .stdout()
    .command(['cpq qcp deploy', '--targetusername', 'test', '--pathmain', './main.js', '--qcpname', 'test'])
    .it('runs cpq qcp deploy', (ctx) => {
      const expectedOutput = 'Deploying QCP... done';
      expect(ctx.returned).to.equal(expectedOutput);
    });
});
