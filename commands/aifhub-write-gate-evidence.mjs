// aifhub-write-gate-evidence.mjs - installed-project wrapper for durable gate evidence
import { normalizeWrapperArgs, runInstalledScript } from './run-installed-script.mjs';

const DESCRIPTION = 'Persist validated AIFHub gate evidence under QA paths.';

export function register(program) {
  program
    .command('aifhub-write-gate-evidence')
    .description(DESCRIPTION)
    .allowUnknownOption(true)
    .allowExcessArguments(true)
    .argument('[args...]')
    .action(async (args, command) => {
      await runInstalledScript('../scripts/write-gate-evidence.mjs', normalizeWrapperArgs(args, command), import.meta.url);
    });
}
