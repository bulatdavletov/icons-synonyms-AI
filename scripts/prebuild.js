// prebuild.js - Script to copy API key from .env to config.ts
const fs = require('fs');
const path = require('path');

// Read .env file
try {
  const envPath = path.resolve(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Extract OPENAI_API_KEY
  const apiKeyMatch = envContent.match(/OPENAI_API_KEY=([^\r\n]+)/);
  const apiKey = apiKeyMatch && apiKeyMatch[1] ? apiKeyMatch[1].trim() : '';
  
  // For logging only - mask the actual key if present
  const maskedKey = apiKey ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}` : 'not found';
  
  // Create config.ts file
  const configPath = path.resolve(__dirname, '..', 'src', 'config.ts');
  const configContent = `// Auto-generated from .env by prebuild script
// DO NOT EDIT DIRECTLY - make changes to .env instead

export const config = {
  // OpenAI API key from .env - actual value is loaded at build time
  OPENAI_API_KEY: '${apiKey}'
};

// Log warning if API key is not available
if (!config.OPENAI_API_KEY) {
  console.warn('OpenAI API key is not set in .env file');
}
`;
  
  // Write config.ts file
  fs.writeFileSync(configPath, configContent, 'utf8');
  
  console.log(`✅ Successfully copied API key (${maskedKey}) from .env to config.ts`);
} catch (error) {
  console.error('❌ Error creating config.ts from .env:', error);
  process.exit(1);
} 