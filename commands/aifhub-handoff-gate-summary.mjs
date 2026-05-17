// aifhub-handoff-gate-summary.mjs - installed-project wrapper for Handoff gate summary diagnostics
import { normalizeWrapperArgs, runInstalledScript } from './run-installed-script.mjs';

const DESCRIPTION = 'Run AIFHub Handoff gate summary diagnostics.';

export function register(program) {
  program
    .command('aifhub-handoff-gate-summary')
    .description(DESCRIPTION)
    .allowUnknownOption(true)
    .allowExcessArguments(true)
    .argument('[args...]')
    .action(async (args, command) => {
      await runInstalledScript('../scripts/handoff-gate-summary.mjs', normalizeWrapperArgs(args, command), import.meta.url);
    });
}
