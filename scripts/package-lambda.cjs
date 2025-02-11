/* eslint-disable max-len */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const LAMBDA_DIR = path.join(__dirname, '../lambda/get-prompt-suggestions');
const PACKAGE_DIR = path.join(LAMBDA_DIR, 'package');
const REQUIREMENTS_FILE = path.join(LAMBDA_DIR, 'requirements.txt');
const VENV_DIR = path.join(LAMBDA_DIR, 'venv');

try {
  if (fs.existsSync(PACKAGE_DIR)) {
    execSync(`rm -rf ${PACKAGE_DIR}`);
  }

  fs.mkdirSync(PACKAGE_DIR);

  execSync('python -m venv venv', { cwd: LAMBDA_DIR });

  const activateCmd = process.platform === 'win32' ? `"${VENV_DIR}\\Scripts\\activate"` : `"source ${VENV_DIR}/bin/activate"`;
  const formattedReqPath = process.platform === 'win32' ? REQUIREMENTS_FILE.replace(/\\/g, '\\\\') : REQUIREMENTS_FILE;

  execSync(`${activateCmd} && pip install -r  "${formattedReqPath}" --platform manylinux2014_x86_64 --target package --only-binary=:all:`,
    {
      cwd  : LAMBDA_DIR,
      shell: true
    });

  fs.copyFileSync(
    path.join(LAMBDA_DIR, 'lambda_function.py'),
    path.join(PACKAGE_DIR, 'lambda_function.py')
  );

  const zipCmd = process.platform === 'win32' ? `cd ${PACKAGE_DIR} && powershell Compress-Archive -Path * -DestinationPath ../function.zip -Force` : `cd ${PACKAGE_DIR} && zip -r ../function.zip .`;

  execSync(zipCmd, { shell: true });

  execSync(`rm -rf ${PACKAGE_DIR} ${path.join(LAMBDA_DIR, 'venv')}`);

  console.log('Lambda package created successfully at lambda/get-prompt-suggestions/function.zip');
} catch (error) {
  console.error('Error packaging lambda:', error);
  process.exit(1);
}
