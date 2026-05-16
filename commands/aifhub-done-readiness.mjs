// aifhub-done-readiness.mjs - installed-project wrapper for done-readiness diagnostics
import { normalizeWrapperArgs, runInstalledScript } from './run-installed-script.mjs';

const DESCRIPTION = 'Run AIFHub OpenSpec done-readiness diagnostics.';

export function register(program) {
  program
    .command('aifhub-done-readiness')
    .description(DESCRIPTION)
    .allowUnknownOption(true)
    .allowExcessArguments(true)
    .argument('[args...]')
    .action(async (args, command) => {
      await runInstalledScript('../scripts/openspec-done-readiness.mjs', normalizeWrapperArgs(args, command), import.meta.url);
    });
}
