# Icon Synonyms AI Plugin

A Figma plugin that uses AI to generate relevant synonyms for icon components and automatically adds them to component descriptions, improving searchability and usability of icon libraries.

## Features
- Generate contextually relevant synonyms for icons using AI
- Enhance component searchability 
- Improve icon library usability
- Support for both single components and batch processing
- Light/Dark theme support
- Multiple AI provider support (OpenAI and JetBrains)

## Development Setup

1. Install Node.js from https://nodejs.org/en/download/
2. Clone this repository
3. Install dependencies:
```bash
npm install
npm install --save-dev @figma/plugin-typings
npm install @create-figma-plugin/ui preact # New UI framework
```
4. Set up API keys:
   - Create a `.env` file in the root directory
   - Add your API keys in the format: 
     ```
     OPENAI_API_KEY=your-openai-api-key-here
     JETBRAINS_API_KEY=your-jetbrains-api-key-here
     ```
   - Configure which API provider to use in `src/config.ts` by setting `API_PROVIDER` to either 'openai' or 'jetbrains'
   - The prebuild script will automatically copy the keys to `src/config.ts` during build
   - Both `.env` and `src/config.ts` are gitignored to prevent API keys from being committed

## API Key Security

We take the security of API keys very seriously:

1. API keys are only stored in the `.env` file, which is git-ignored
2. The prebuild script copies the API keys to `src/config.ts` (also git-ignored)
3. A `check-secrets.js` script runs after builds to detect any API keys in build files
4. The script masks API key values in log outputs
5. Never commit build files or `.env` files to the repository

If a build contains API keys, the build process will fail with an error message.

## Project Structure
```
icons-synonyms-AI/
├── code.ts              # Main plugin logic
├── code.js             # Bundled JavaScript (from esbuild)
├── ui.html             # Plugin interface
├── manifest.json       # Plugin configuration
├── .env                # Environment variables (gitignored)
├── src/
│   ├── ai-service.ts   # AI API integration (OpenAI and JetBrains)
│   ├── config.ts       # Configuration generated from .env (gitignored)
│   ├── config.template.ts # Configuration template
│   ├── jetbrains-api-config.ts # JetBrains API configuration
│   ├── icon-exporter.ts # Icon export functionality
│   ├── components/     # UI components
│   └── __tests__/      # Unit tests
│       └── ai-service.test.ts # Tests for AI service
├── __mocks__/          # Mock files for testing
├── jest.config.js      # Jest configuration
├── jest.setup.js       # Jest setup file
├── scripts/
│   ├── prebuild.js     # Script to copy API key from .env to config.ts
│   └── check-secrets.js # Script to check for API keys in build files
└── tsconfig.json       # TypeScript configuration
```

## Development Workflow

1. Open the directory in Visual Studio Code
2. Start the TypeScript compiler in watch mode:
```bash
npm run watch
```
3. Make your changes
4. Test in Figma by loading the plugin
5. Run unit tests to verify functionality:
```bash
npm test
```

## Build Process
- TypeScript files are bundled using esbuild
- Main entry point: `code.ts` → `code.js`
- UI is defined in `ui.html`
- Build command: `npm run build`
- Watch mode: `npm run watch`

## Testing
The project uses Jest for unit testing. Tests are located in the `src/__tests__` directory.

### Running Tests
```bash
npm test
```

### Test Coverage
- ✅ AI Service functionality
  - OpenAI API integration
  - JetBrains API integration
  - Response parsing
  - Error handling

### Adding New Tests
1. Create test files in the `src/__tests__` directory
2. Follow the naming convention: `*.test.ts`
3. Run tests with `npm test`

## Current Status
- ✅ Component selection detection
- ✅ AI integration with OpenAI GPT-4o
- ✅ AI integration with JetBrains (Grazie) API
- ✅ Basic UI functionality with grouped synonyms
- ✅ Synonym selection and application
- ✅ Empty description handling
- ✅ API key security
- ✅ Configurable API provider (OpenAI or JetBrains)
- ✅ Unit tests for AI functionality
- 🚧 Batch processing implementation

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License
This project is licensed under the MIT License.
