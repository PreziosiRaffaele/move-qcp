import { exec } from 'child_process';
import { promisify } from 'util';
import { AuthInfo, Connection } from '@salesforce/core';

const execAsync = promisify(exec);

interface OrgDetail {
  result: {
    username: string;
  };
}

export default async function getConnection(userInput: string): Promise<Connection> {
  let userName: string;
  if (isValidEmail(userInput)) {
    userName = userInput;
  } else {
    const cmd = 'sf force org display --json -u ' + userInput;
    const orgDetailJSON = await execAsync(cmd);
    const orgDetail = JSON.parse(orgDetailJSON.stdout) as OrgDetail;
    userName = orgDetail.result.username;
  }
  const authInfo = await AuthInfo.create({ username: userName });
  const conn = await Connection.create({ authInfo });
  return conn;
}

function isValidEmail(input: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
}
