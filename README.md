# Icon Synonyms AI Plugin

A Figma plugin that uses AI to generate relevant synonyms for icon components and automatically adds them to component descriptions, improving searchability and usability of icon libraries.

## Features
- Generate contextually relevant synonyms for icons using AI
- Enhance component searchability 
- Improve icon library usability
- Support for both single components and batch processing
- Light/Dark theme support

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
   - Copy `src/config.template.ts` to `src/config.ts`
   - Copy `src/api-keys.template.ts` to `src/api-keys.ts`
   - Add your API keys to both files:
     - OpenAI API key (if using OpenAI)
     - JetBrains API key (if using JetBrains API)
   - Configure the API provider in `config.ts` by setting `API_PROVIDER` to either 'openai' or 'jetbrains'
   - These files are gitignored to prevent API keys from being committed

## Project Structure
```
icons-synonyms-AI/
├── code.ts              # Main plugin logic
├── code.js             # Bundled JavaScript (from esbuild)
├── ui.html             # Plugin interface
├── manifest.json       # Plugin configuration
├── src/
│   ├── ai-service.ts   # AI API integration (OpenAI and JetBrains)
│   ├── api-keys.ts     # API keys (gitignored)
│   ├── jetbrains-api-config.ts # JetBrains API configuration
│   ├── icon-exporter.ts # Icon export functionality
│   ├── components/     # UI components
│   └── __tests__/      # Unit tests
│       └── ai-service.test.ts # Tests for AI service
├── __mocks__/          # Mock files for testing
├── jest.config.js      # Jest configuration
├── jest.setup.js       # Jest setup file
├── esbuild.config.js   # esbuild configuration
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
