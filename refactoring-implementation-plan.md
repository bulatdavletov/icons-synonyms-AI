# Refactoring Implementation Plan

## Phase 1: Clean Up Files and Remove Old API Key Methods

1. Remove compiled JS files:
   ```bash
   git rm -f src/ui.js src/ui.js.map src/ai-service.js src/icon-exporter.js code.js code.js.map
   ```

2. Remove old API key management files:
   ```bash
   git rm -f src/api-keys.ts src/api-keys.template.ts src/config.ts src/config.template.ts
   ```

3. Update `.gitignore` to ensure these files aren't tracked in the future

4. Remove references to environment variables and config in code:
   - Remove imports from `config.ts` and `api-keys.ts` if they exist
   - Ensure all code uses the API key from Figma client storage

5. Remove localStorage usage in legacy code

6. Modify or remove the `scripts/prebuild.js` script:
   - The script currently reads API keys from `.env` and generates `config.ts`
   - Since API keys are now managed through the Settings UI, this functionality is not needed
   - Options:
     - Remove the script entirely if no other functionality is needed
     - If the script performs other necessary tasks, remove only the API key handling parts
   - Update `package.json` to remove or modify the `prebuild` script reference

7. Remove unnecessary dependencies:
   - Remove `dotenv` package from `package.json` since it's only used for the .env file handling
   - Run `npm prune` to update node_modules
   ```bash
   npm uninstall dotenv
   ```

## Phase 2: Reorganize Code Structure

1. Create proper directory structure:
   ```bash
   mkdir -p src/services src/utils src/types
   ```

2. Move files to appropriate locations:
   ```bash
   git mv Prompt.ts src/utils/prompt.ts
   git mv src/ai-service.ts src/services/ai-service.ts
   git mv src/icon-exporter.ts src/utils/icon-exporter.ts
   git mv src/types.ts src/types/index.ts
   ```

3. Update imports in all files to reflect new structure
   - Change `import { ... } from '../Prompt'` to `import { ... } from '../utils/prompt'`
   - Update all other imports accordingly

## Phase 3: Clean Up and Refactor Main Code

1. Simplify `main.ts`:
   - Extract duplicate code for processing synonyms into helper functions
   - Ensure proper typing for all functions
   - Remove any remaining code related to old API key methods

2. Refactor `ai-service.ts`:
   - Improve response parsing logic
   - Add better error handling
   - Ensure all functions have proper return types

3. Update build scripts:
   - Modify `package.json` to remove `prebuild` step if no longer needed
   - Simplify the build process
   - Keep the `check-secrets` script as it's still useful to ensure no API keys are in the build files

## Phase 4: Update UI Components

1. Check for and remove any remaining references to the old API key methods
2. Ensure the Settings UI works correctly with Figma client storage
3. Make any necessary UI improvements

## Phase 5: Testing and Documentation

1. Test all the refactored functionality:
   - Ensure API key can be set via Settings
   - Verify synonym generation works correctly
   - Check that all components render correctly

2. Update documentation to reflect the changes:
   - Update README.md with new structure
   - Add comments to code where necessary

## Phase 6: Commit Changes

Create a commit with the refactored code:
```bash
git add .
git commit -m "refactor: simplify codebase and remove deprecated API key methods"
```

## Phase 7: Additional Improvements (Optional)

1. Add unit tests for critical functions
2. Improve error handling throughout the application
3. Consider adding more robust API key validation
4. Update to latest dependencies where appropriate 