import { readFile } from 'fs';
import { isAbsolute, resolve } from 'path';
import { promisify } from 'util';
import { Connection } from '@salesforce/core';
import { Schema, SObjectUpdateRecord } from 'jsforce';
import { minify } from 'uglify-js';
import { rollup } from 'rollup';
import { CpqQcpDeployResult } from './commands/cpq/qcp/deploy';
export const readFileAsync = promisify(readFile);

interface CustomScript {
  Id?: string;
  Name?: string;
  SBQQ__Code__c?: string;
  SBQQ__GroupFields__c?: string;
  SBQQ__ConsumptionScheduleFields__c?: string;
  SBQQ__ConsumptionRateFields__c?: string;
  SBQQ__QuoteLineFields__c?: string;
  SBQQ__QuoteFields__c?: string;
}

interface CustomScriptUnFormatted {
  Id?: string;
  Name?: string;
  SBQQ__Code__c?: string;
  SBQQ__GroupFields__c?: [string];
  SBQQ__ConsumptionScheduleFields__c?: [string];
  SBQQ__ConsumptionRateFields__c?: [string];
  SBQQ__QuoteLineFields__c?: [string];
  SBQQ__QuoteFields__c?: [string];
}

interface Flags {
  targetusername: string;
  sourcedir: string;
}

interface DmlResult {
  Id?: string;
  success: boolean;
}

export async function deployQCP(conn: Connection, flags: Flags): Promise<CpqQcpDeployResult> {
  try {
    const [script, qcp] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      rollupCode(flags.sourcedir, flags['no-code-minification']),
      getCustomScript(flags.sourcedir),
    ]);
    qcp['SBQQ__Code__c'] = script;
    await fetchQPCId(conn, qcp);
    const dmlResult: DmlResult = await upsertQuoteCalculatorPlugin(conn, qcp);
    return { isSuccess: dmlResult.success, recordId: dmlResult.Id };
  } catch (err) {
    return { isSuccess: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function rollupCode(path: string, noCodeMinification: boolean): Promise<string> {
  const bundle = await rollup({
    input: `${path}/main.js`,
    output: { format: 'esm' },
  });
  const { output } = await bundle.generate({ format: 'esm' });
  const code = output[0].code;
  if (noCodeMinification) {
    return code;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const minified = minify(code) as { code: string };
    return minified.code;
  }
}

export async function getCustomScript(path: string): Promise<CustomScript> {
  const result = await readFileAsync(`${createAbsolutePath(path)}/config.json`, 'utf8');
  const customScriptUnFormatted = JSON.parse(result) as CustomScriptUnFormatted;
  const customScript = formatCustomScript(customScriptUnFormatted);
  return customScript;
}

function formatCustomScript(customScript: CustomScriptUnFormatted): CustomScript {
  const formattedCustomScript: CustomScript = {};
  const fieldsToReplace = new Set([
    'SBQQ__GroupFields__c',
    'SBQQ__ConsumptionScheduleFields__c',
    'SBQQ__ConsumptionRateFields__c',
    'SBQQ__QuoteLineFields__c',
    'SBQQ__QuoteFields__c',
  ]);
  const fieldsToCopy = new Set(['Name']);
  Object.keys(customScript).forEach((key) => {
    if (fieldsToReplace.has(key)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      formattedCustomScript[key] = customScript[key].join('\r\n');
    } else if (fieldsToCopy.has(key)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      formattedCustomScript[key] = customScript[key];
    }
  });
  return formattedCustomScript;
}

function createAbsolutePath(path: string): string {
  if (isAbsolute(path)) {
    // The user input is already an absolute path
    return path;
  } else {
    // The user input is a relative path
    const absolutePath = resolve(process.cwd(), path);
    return absolutePath;
  }
}

async function fetchQPCId(conn: Connection, qcp: CustomScript): Promise<void> {
  const result = await conn.query(
    `SELECT Id FROM SBQQ__CustomScript__c WHERE Name = '${qcp.Name}' ORDER BY CreatedDate DESC`
  );
  if (result?.records && result.records.length > 0) {
    qcp.Id = result.records[0].Id;
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
