import { dirname } from 'path';
import { promisify } from 'util';
import { writeFile, mkdir } from 'fs';
import { CpqQcpCreateResult } from './commands/cpq/qcp/create';

const mkdirPromise = promisify(mkdir);
const writeFilePromise = promisify(writeFile);

interface Flags {
  path: string;
  qcpname: string;
}

export async function createQCP(flags: Flags): Promise<CpqQcpCreateResult> {
  try {
    const path = flags.path ?? './';
    await Promise.all([
      createFile(`${path}/${flags.qcpname}/config.json`, getSettingFileCode(flags.qcpname)),
      createFile(`${path}/${flags.qcpname}/main.js`, mainCode),
    ]);
    await Promise.all([
      createFile(`${path}/${flags.qcpname}/onAfterCalculate/afterCalculate.js`, afterCalculateCode),
      createFile(`${path}/${flags.qcpname}/onBeforeCalculate/beforeCalculate.js`, beforeCalculateCode),
      createFile(`${path}/${flags.qcpname}/onInit/init.js`, initCode),
      createFile(`${path}/${flags.qcpname}/pageSecurityPlugin/psp.js`, pspCode),
    ]);
    return { isSuccess: true };
  } catch (err) {
    return { isSuccess: false, errorMessage: err as string };
  }
}

async function createFile(path: string, contents: string): Promise<void> {
  await mkdirPromise(dirname(path), { recursive: true });
  await writeFilePromise(path, contents);
}

const pspCode = `export function isVisible(fieldName, record, conn, objectName){
}

export function isEditable(fieldName, record, conn, objectName) {
}`;

const initCode = `export function init(lines, conn){
  return Promise.resolve();
}`;

const beforeCalculateCode = `export function beforeCalculate(quoteModel, quoteLineModels, conn) {
  return Promise.resolve();
};`;

const afterCalculateCode = `export function afterCalculate(quoteModel, quoteLineModels, conn) {
  return Promise.resolve();
};`;

const mainCode = `import { isVisible, isEditable } from './pageSecurityPlugin/psp'
import { init } from './onInit/init'
import { beforeCalculate } from './onBeforeCalculate/beforeCalculate'
import { afterCalculate } from './onAfterCalculate/afterCalculate'

export function onInit(quoteLineModels, conn){
    return init(quoteLineModels, conn);
}

export function onBeforeCalculate(quote, lines, conn){
    return beforeCalculate(quote, lines, conn);
}

export function onAfterCalculate(quote, lines, conn){
    return afterCalculate(quote, lines, conn);
}

export function isFieldVisibleForObject(fieldName, line, conn, objectName){
    return isVisible(fieldName, line, conn, objectName);
}

export function isFieldEditableForObject(fieldName, line, conn, objectName){
    return isEditable(fieldName, line, conn, objectName);
}`;

function getSettingFileCode(name: string): string {
  return `{
    "Name": "${name}",
    "SBQQ__GroupFields__c": [],
    "SBQQ__ConsumptionScheduleFields__c": [],
    "SBQQ__QuoteLineFields__c": [

    ],
    "SBQQ__QuoteFields__c": [

    ]
}`;
}
