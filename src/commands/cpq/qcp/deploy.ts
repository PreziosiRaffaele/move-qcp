import { exec } from 'child_process';
import { promisify } from 'util';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages, AuthInfo, Connection } from '@salesforce/core';
import { deployQCP } from '../../../HandleDeployQCP';

const execAsync = promisify(exec);

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('move-qcp', 'cpq.qcp.deploy');

export type CpqQcpDeployResult = {
  isSuccess: boolean;
  error?: string;
  recordId?: string;
};

interface OrgDetail {
  result: {
    username: string;
  };
}

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
    let userName: string;
    if (isValidEmail(flags.targetusername)) {
      userName = flags.targetusername;
    } else {
      const cmd = 'sf force org display --json -u ' + flags.targetusername;
      const orgDetailJSON = await execAsync(cmd);
      const orgDetail = JSON.parse(orgDetailJSON.stdout) as OrgDetail;
      userName = orgDetail.result.username;
    }
    const authInfo = await AuthInfo.create({ username: userName });
    const conn = await Connection.create({ authInfo });
    const result = await deployQCP(conn, flags);
    this.spinner.stop();
    if (!result.isSuccess) {
      throw messages.createError(result.error);
    }
    return result;
  }
}

function isValidEmail(input: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
}
