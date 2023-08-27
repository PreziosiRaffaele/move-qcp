import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { Connection } from '@salesforce/core';
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
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    targetusername: Flags.requiredOrg({
      summary: messages.getMessage('flags.targetusername.summary'),
      char: 'u',
      required: true,
    }),
    sourcedir: Flags.directory({
      summary: messages.getMessage('flags.sourcedir.summary'),
      char: 'd',
      exists: true,
      required: true,
    }),
    'no-code-minification': Flags.boolean({
      summary: messages.getMessage('flags.no-code-minification.summary'),
      char: 'c',
      default: false,
    }),
  };

  public async run(): Promise<CpqQcpDeployResult> {
    const { flags } = await this.parse(CpqQcpDeploy);
    this.spinner.start('Deploying QCP...');
    const conn: Connection = flags.targetusername.getConnection();
    const result = await deployQCP(conn, flags.sourcedir, flags['no-code-minification']);
    this.spinner.stop();
    if (!result.isSuccess) {
      throw messages.createError('error.Deploy', [result.error]);
    }
    this.log(`QCP deployed successfully with Id: ${result.recordId}`);
    return result;
  }
}
