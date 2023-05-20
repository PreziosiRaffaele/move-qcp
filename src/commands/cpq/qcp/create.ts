import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import { createQCP } from '../../../HandleCreateQCP';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('move-qcp', 'cpq.qcp.create');

export type CpqQcpCreateResult = {
  isSuccess: boolean;
  errorMessage?: string;
};

export default class CpqQcpCreate extends SfCommand<CpqQcpCreateResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    path: Flags.string({
      summary: messages.getMessage('flags.path.summary'),
      char: 'p',
      required: false,
    }),
    qcpname: Flags.string({
      summary: messages.getMessage('flags.qcpname.summary'),
      char: 'n',
      required: true,
    }),
  };

  public async run(): Promise<CpqQcpCreateResult> {
    const { flags } = await this.parse(CpqQcpCreate);
    this.spinner.start('Creating QCP...');
    const result = await createQCP(flags);
    this.spinner.stop();
    if (!result.isSuccess) {
      throw messages.createError(result.errorMessage);
    }
    return result;
  }
}
