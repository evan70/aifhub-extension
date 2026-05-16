// aifhub-coverage.mjs - installed-project wrapper for OpenSpec coverage evidence
import { normalizeWrapperArgs, runInstalledScript } from './run-installed-script.mjs';

const DESCRIPTION = 'Build and optionally write AIFHub OpenSpec coverage evidence.';

export function register(program) {
  program
    .command('aifhub-coverage')
    .description(DESCRIPTION)
    .allowUnknownOption(true)
    .allowExcessArguments(true)
    .argument('[args...]')
    .action(async (args, command) => {
      await runInstalledScript('../scripts/openspec-coverage-matrix.mjs', normalizeWrapperArgs(args, command), import.meta.url);
    });
}
