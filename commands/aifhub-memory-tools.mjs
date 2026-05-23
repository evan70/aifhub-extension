// aifhub-memory-tools.mjs - installed-project wrapper for optional memory/context tool recommendations
import { normalizeWrapperArgs, runInstalledScript } from './run-installed-script.mjs';

const DESCRIPTION = 'Run AIFHub optional memory and context tool recommendation diagnostics.';

export function register(program) {
  program
    .command('aifhub-memory-tools')
    .description(DESCRIPTION)
    .allowUnknownOption(true)
    .allowExcessArguments(true)
    .argument('[args...]')
    .action(async (args, command) => {
      await runInstalledScript('../scripts/memory-tool-recommender.mjs', normalizeWrapperArgs(args, command), import.meta.url);
    });
}
