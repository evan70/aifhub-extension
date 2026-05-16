// aifhub-migrate-legacy-plans.mjs - installed-project wrapper for legacy plan migration
import { normalizeWrapperArgs, runInstalledScript } from './run-installed-script.mjs';

const DESCRIPTION = 'Run AIFHub legacy AI Factory plan migration commands.';

export function register(program) {
  program
    .command('aifhub-migrate-legacy-plans')
    .description(DESCRIPTION)
    .allowUnknownOption(true)
    .allowExcessArguments(true)
    .argument('[args...]')
    .action(async (args, command) => {
      await runInstalledScript('../scripts/migrate-legacy-plans.mjs', normalizeWrapperArgs(args, command), import.meta.url);
    });
}
