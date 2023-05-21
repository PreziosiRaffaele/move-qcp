import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { deployQCP } from '../../../HandleDeployQCP';
import { default as getConnection } from '../../../Connection';

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
    const conn = await getConnection(flags.targetusername);
    const result = await deployQCP(conn, flags);
    this.spinner.stop();
    if (!result.isSuccess) {
      throw messages.createError(result.error);
    }
    return result;
  }
}
