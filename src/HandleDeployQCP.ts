import { exec } from 'child_process';
import { Connection } from '@salesforce/core';
import { Schema, SObjectUpdateRecord } from 'jsforce';
import { CpqQcpDeployResult } from './commands/cpq/qcp/deploy';

interface CustomScript {
  Id?: string;
  Name?: string;
  SBQQ__Code__c?: string;
}

interface Flags {
  targetusername: string;
  pathmain: string;
  qcpname: string;
}

interface DmlResult {
  Id?: string;
  success: boolean;
}

export async function deployQCP(conn: Connection, flags: Flags): Promise<CpqQcpDeployResult> {
  try {
    const [script, fetchResult] = await Promise.all([
      rollup(flags.pathmain),
      fetchQuoteCalculatorPlugin(conn, flags.qcpname),
    ]);
    const qcp: CustomScript = fetchResult ?? { Name: flags.qcpname };
    qcp['SBQQ__Code__c'] = script;
    const dmlResult: DmlResult = await upsertQuoteCalculatorPlugin(conn, qcp);
    return { isSuccess: dmlResult.success };
  } catch (err) {
    return { isSuccess: false, error: err as string };
  }
}

function rollup(path: string): Promise<string> {
  const cmd = `rollup ${path} --format esm`;
  return new Promise((resolve, reject) => {
    exec(cmd, {}, (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function fetchQuoteCalculatorPlugin(conn: Connection, qcpname: string): Promise<CustomScript> | null {
  const result = await conn.query(
    `SELECT Id FROM SBQQ__CustomScript__c WHERE Name = '${qcpname}' ORDER BY CreatedDate DESC`
  );
  if (result.records.length > 0) {
    return result.records[0];
  } else {
    return null;
  }
}

async function upsertQuoteCalculatorPlugin(conn: Connection, qcp: CustomScript): Promise<DmlResult> {
  let result: DmlResult;
  if (!qcp.Id) {
    result = await conn.insert('SBQQ__CustomScript__c', qcp);
  } else {
    const res = await conn.update('SBQQ__CustomScript__c', [
      qcp as SObjectUpdateRecord<Schema, 'SBQQ__CustomScript__c'>,
    ]);
    if (res.length > 0) {
      result = res[0];
    }
  }
  return result;
}
