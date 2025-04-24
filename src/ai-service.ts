// AI Service for handling AI integration (OpenAI or JetBrains)
import { config } from './config';
import { getIconSynonymsPrompt } from './prompts/Prompt';
import { getJetBrainsApiEntryPoint } from './jetbrains-api-config';

interface AIResponse {
  synonyms: string[];
  error?: string;
}

interface GenerateSynonymsParams {
  name: string;
  imageBase64: string;
  existingDescription?: string;
}

/**
 * Parse the AI response text into structured format
 * @param text Raw text from AI response
 * @returns Array of formatted category lines
 */
function parseAIResponse(text: string): string[] {
  // Split the text into lines and clean them
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Initialize result array
  const result: string[] = [];

  // Process each line
  for (const line of lines) {
    // Check for each category
    if (line.toLowerCase().startsWith('usage:')) {
      result.push(line);
    }
    else if (line.toLowerCase().startsWith('object:')) {
      result.push(line);
    }
    else if (line.toLowerCase().startsWith('modificator:')) {
      result.push(line);
    }
    else if (line.toLowerCase().startsWith('shapes:')) {
      result.push(line);
    }
    // Handle cases where the category name might be on a separate line
    else if (line === 'Usage' || line === 'Object' || line === 'Modificator' || line === 'Shapes') {
      continue; // Skip category headers without values
    }
    // If line contains a colon, it might be a category
    else if (line.includes(':')) {
      const [category, ...rest] = line.split(':');
      const trimmedCategory = category.trim();
      if (['usage', 'object', 'modificator', 'shapes'].includes(trimmedCategory.toLowerCase())) {
        result.push(`${trimmedCategory}: ${rest.join(':').trim()}`);
      }
    }
  }

  console.log('Parsed response lines:', result);
  return result;
}

/**
 * Generate synonyms using OpenAI API
 * @param params Parameters for generating synonyms
 * @returns Response with synonyms or error
 */
async function generateSynonymsWithOpenAI(params: GenerateSynonymsParams): Promise<AIResponse> {
  try {
    // Check if API key is available
    if (!config.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not set. Please add it to your .env file.');
    }
    
    const prompt = getIconSynonymsPrompt(params.name, params.existingDescription);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${params.imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 300
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`OpenAI API error: ${response.statusText}${errorData ? ' - ' + JSON.stringify(errorData) : ''}`);
    }

    const data = await response.json();
    console.log('Response from OpenAI:', data.choices[0].message.content);

    // Parse the response text into structured format
    const parsedSynonyms = parseAIResponse(data.choices[0].message.content);

    if (!parsedSynonyms || parsedSynonyms.length === 0) {
      throw new Error('No valid synonyms generated');
    }

    return {
      synonyms: parsedSynonyms
    };
  } catch (error: any) {
    console.error('Error generating synonyms with OpenAI:', error);
    throw error;
  }
}

/**
 * Generate synonyms using JetBrains (Grazie) API
 * @param params Parameters for generating synonyms
 * @returns Response with synonyms or error
 */
async function generateSynonymsWithJetBrains(params: GenerateSynonymsParams): Promise<AIResponse> {
  try {
    const prompt = getIconSynonymsPrompt(params.name, params.existingDescription);

    // Use absolute URL for the proxy server from config
    // This is necessary in Figma plugin environment
    const endpoint = `${config.PROXY_URL}/api/jetbrains/chat/completions`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // The proxy server will add the Grazie-Authenticate-JWT header
      },
      body: JSON.stringify({
        model: 'jetbrains-chat',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${params.imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 300
      })
    });

    if (!response.ok) {
      throw new Error(`JetBrains API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Response from JetBrains API:', data);

    // Parse the response according to JetBrains API format
    const content = data.choices?.[0]?.message?.content || '';

    // Parse the response text into structured format
    const parsedSynonyms = parseAIResponse(content);

    if (!parsedSynonyms || parsedSynonyms.length === 0) {
      throw new Error('No valid synonyms generated');
    }

    return {
      synonyms: parsedSynonyms
    };
  } catch (error: any) {
    console.error('Error generating synonyms with JetBrains API:', error);
    throw error;
  }
}

/**
 * Generate synonyms using the configured AI provider
 * @param params Parameters for generating synonyms
 * @returns Response with synonyms or error
 */
export async function generateSynonyms(params: GenerateSynonymsParams): Promise<AIResponse> {
  try {
    // Use the configured API provider
    if (config.API_PROVIDER === 'jetbrains') {
      return await generateSynonymsWithJetBrains(params);
    } else {
      return await generateSynonymsWithOpenAI(params);
    }
  } catch (error: any) {
    console.error('Error generating synonyms:', error);
    return {
      synonyms: [],
      error: error.message || 'Unknown error occurred'
    };
  }
}
