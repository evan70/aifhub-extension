// aifhub-validate-artifacts.mjs - installed-project wrapper for OpenSpec artifact validation
import { normalizeWrapperArgs, runInstalledScript } from './run-installed-script.mjs';

const DESCRIPTION = 'Run AIFHub OpenSpec artifact contract validation.';

export function register(program) {
  program
    .command('aifhub-validate-artifacts')
    .description(DESCRIPTION)
    .allowUnknownOption(true)
    .allowExcessArguments(true)
    .argument('[args...]')
    .action(async (args, command) => {
      await runInstalledScript('../scripts/openspec-artifact-validator.mjs', normalizeWrapperArgs(args, command), import.meta.url);
    });
}
