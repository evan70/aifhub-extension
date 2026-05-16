// run-installed-script.mjs - helpers for extension command wrappers
import { spawn as spawnChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export function resolveInstalledScriptPath(scriptRelativePath, moduleUrl) {
  return fileURLToPath(new URL(scriptRelativePath, moduleUrl));
}

export async function runInstalledScript(scriptRelativePath, args = [], moduleUrl, options = {}) {
  const processLike = options.processLike ?? process;
  const spawn = options.spawn ?? spawnChildProcess;
  const stdio = options.stdio ?? 'inherit';
  const scriptPath = resolveInstalledScriptPath(scriptRelativePath, moduleUrl);
  const forwardedArgs = Array.isArray(args) ? args : [];

  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn(processLike.execPath, [scriptPath, ...forwardedArgs], {
      cwd: processLike.cwd(),
      env: processLike.env,
      stdio
    });

    child.once('error', reject);
    child.once('close', (code, signal) => {
      resolve(code ?? (signal ? 1 : 0));
    });
  });

  if (exitCode !== 0) {
    processLike.exitCode = exitCode;
  }

  return exitCode;
}

export function normalizeWrapperArgs(args, command) {
  if (command && Array.isArray(command.args) && command.args.length > 0) {
    return command.args;
  }
  if (Array.isArray(args)) {
    return args;
  }
  if (args === undefined || args === null) {
    return [];
  }
  return [args];
}
