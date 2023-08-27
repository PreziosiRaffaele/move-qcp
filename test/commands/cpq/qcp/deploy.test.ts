import { expect } from 'chai';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup';
import { Connection } from '@salesforce/core';
import CpqQcpDeploy from '../../../../src/commands/cpq/qcp/deploy';

describe('Deploy QCP', () => {
  const $$ = new TestContext();
  let testOrg = new MockTestOrgData();

  beforeEach(() => {
    testOrg = new MockTestOrgData();
    testOrg.orgId = '00Dxx0000000000';
    // Stub the ux methods on SfCommand so that you don't get any command output in your tests.
    // You can also make assertions on the ux methods to ensure that they are called with the
    // correct arguments.
  });

  it('insert QCP', async () => {
    await $$.stubAuths(testOrg);

    $$.SANDBOX.stub(Connection.prototype, 'query').resolves({ records: [], totalSize: 0, done: true });
    $$.SANDBOX.stub(Connection.prototype, 'sobject').returnsThis();
    $$.SANDBOX.stub(Connection.prototype, 'create').resolves({ id: 'a0P0o0000123456', success: true, errors: [] });

    const result = await CpqQcpDeploy.run(['--targetusername', testOrg.username, '--sourcedir', './test']);
    expect(result.isSuccess).to.equal(true);
    expect(result.recordId).to.equal('a0P0o0000123456');
  });

  it('update QCP', async () => {
    await $$.stubAuths(testOrg);

    $$.SANDBOX.stub(Connection.prototype, 'query').resolves({
      records: [{ Id: 'a0P0o0000123451' }],
      totalSize: 1,
      done: true,
    });
    $$.SANDBOX.stub(Connection.prototype, 'update').resolves([{ id: 'a0P0o0000123451', success: true, errors: [] }]);

    const result = await CpqQcpDeploy.run(['--targetusername', testOrg.username, '--sourcedir', './test']);
    expect(result.isSuccess).to.equal(true);
    expect(result.recordId).to.equal('a0P0o0000123451');
  });

  it('Deploy failed: DML error.', async () => {
    await $$.stubAuths(testOrg);

    $$.SANDBOX.stub(Connection.prototype, 'query').resolves({ records: [], totalSize: 0, done: true });
    $$.SANDBOX.stub(Connection.prototype, 'sobject').returnsThis();
    $$.SANDBOX.stub(Connection.prototype, 'create').resolves({
      success: false,
      errors: [{ message: 'DML error', errorCode: '02' }],
    });

    try {
      await CpqQcpDeploy.run(['--targetusername', testOrg.username, '--sourcedir', './test']);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(error.message).to.equal('Deploy failed: DML error.');
    }
  });
});
