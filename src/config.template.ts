// Configuration template
// Copy this file to config.ts and add your API keys
// Or use the prebuild script that automatically copies it from .env

export const config = {
  // Add your OpenAI API key here or in .env file
  OPENAI_API_KEY: 'your-api-key-here',

  // Add your JetBrains API key here (if required)
  JETBRAINS_API_KEY: 'your-jetbrains-api-key-here',

  // API provider to use ('openai' or 'jetbrains')
  API_PROVIDER: 'openai',
  
  // Proxy URL for JetBrains API (if needed)
  PROXY_URL: 'http://localhost:3000'
}; 
