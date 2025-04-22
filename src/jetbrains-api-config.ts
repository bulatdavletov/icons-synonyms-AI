// JetBrains API configuration
// This file provides hardcoded configuration to avoid CORS issues

/**
 * Gets the JetBrains AI Platform configuration
 * No actual fetch is performed to avoid CORS issues
 * @returns The API entry point and other configuration details
 */
export async function fetchJetBrainsApiConfig() {
  // Skip attempting to fetch the config from platform.jetbrains.ai/config 
  // because of CORS limitations in browser environments
  
  // Return hardcoded configuration
  return {
    apiEntryPoint: 'https://platform.jetbrains.ai',
    // Add other configuration details as needed
  };
}

/**
 * Gets the appropriate API entry point for the JetBrains AI Platform
 * @returns The API entry point URL
 */
export async function getJetBrainsApiEntryPoint(): Promise<string> {
  const config = await fetchJetBrainsApiConfig();
  return config.apiEntryPoint;
}
