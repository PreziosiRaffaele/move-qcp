import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages, AuthInfo, Connection } from '@salesforce/core';
import { deployQCP } from '../../../HandleDeployQCP';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('move-qcp', 'cpq.qcp.deploy');

export type CpqQcpDeployResult = {
  isSuccess: boolean;
  error?: string;
  recordId?: string;
};

export default class CpqQcpDeploy extends SfCommand<CpqQcpDeployResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    targetusername: Flags.string({
      summary: messages.getMessage('flags.targetusername.summary'),
      char: 'u',
      required: true,
    }),
    pathmain: Flags.string({
      summary: messages.getMessage('flags.pathmain.summary'),
      char: 'p',
      required: true,
    }),
  };

  public async run(): Promise<CpqQcpDeployResult> {
    this.log(process.cwd());
    const { flags } = await this.parse(CpqQcpDeploy);
    this.spinner.start('Deploying QCP...');
    const authInfo = await AuthInfo.create({ username: flags.targetusername });
    const conn = await Connection.create({ authInfo });
    const result = await deployQCP(conn, flags);
    this.spinner.stop();
    if (!result.isSuccess) {
      throw messages.createError(result.error);
    }
    return result;
  }
}
