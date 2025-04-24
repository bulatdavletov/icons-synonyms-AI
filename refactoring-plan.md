# Refactoring Plan

## Build Process
- Source files in `src/` are compiled into the `build/` directory
- The plugin manifest (`manifest.json`) uses `build/main.js` and `build/ui.js`
- Source entry points are defined in `package.json` as `src/main.ts` and `src/ui.tsx`
- Config files are generated from templates and `.env` during the prebuild process

## Files to Remove (Safe to Delete)
- `src/ui.js` - Compiled JS file, should only exist in build/
- `src/ui.js.map` - Source map file, should only exist in build/
- `src/ai-service.js` - Compiled JS file from TS
- `src/icon-exporter.js` - Compiled JS file from TS
- `code.js` - Older compiled JS in root directory
- `code.js.map` - Older source map in root directory

## API Key Management Refactoring
The project currently has multiple methods for handling API keys:

1. **Current (Correct) Method**: The Settings component in the UI lets users enter their API key, which is then stored in Figma client storage.

2. **Old Methods to Remove**:
   - `.env` file and `prebuild.js` script that generates `config.ts` - Remove this approach
   - `api-keys.template.ts` and `api-keys.ts` - Remove these files
   - Legacy `localStorage` usage in `ui.html` - Remove this approach
   
3. **Refactoring Tasks**:
   - Remove the `prebuild.js` script's API key handling (keep only essential functionality if needed)
   - Update build scripts in `package.json` to remove `prebuild` step if no longer needed
   - Remove references to `config.ts` and environment variables
   - Ensure all API key usage flows through the Settings UI and Figma client storage

## Code to Refactor

### 1. Remove unused imports
Review all files for unused imports and remove them.

### 2. Simplify the codebase organization
- Move the Prompt.ts to src/ directory for better organization
- Consider organizing files into more logical folders (e.g., services, utils)

### 3. Clean up duplicated code
- In main.ts, there's some duplicate code for processing synonyms that could be refactored into a helper function
- Simplify the AI response parsing in ai-service.ts

### 4. Improve type safety
- Add more explicit type definitions where needed
- Make sure all functions have proper return types

### 5. Handle templates better
- `src/config.template.ts` and `src/api-keys.template.ts` are used as templates but could be handled better
- Consider using a more structured approach to environment variables

## Dependency Review
- Check for unused dependencies in package.json
- Ensure all necessary dependencies are at appropriate versions

## File Structure Improvements
Current structure is somewhat flat. Consider organizing into:

```
src/
  ├── components/     # Keep UI components here
  ├── services/       # Move ai-service.ts here
  ├── utils/          # Move icon-exporter.ts and helpers here
  ├── types/          # Move types.ts here
  ├── main.ts         # Entry point
  └── ui.tsx          # UI entry point
```

## Other Improvements
- Add more comments for complex logic
- Consider adding unit tests for critical functions
- Implement better error handling
- Update .gitignore to ensure compiled files are not tracked 