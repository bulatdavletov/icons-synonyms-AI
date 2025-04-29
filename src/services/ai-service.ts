// AI Service for handling OpenAI integration
import { getIconSynonymsPrompt } from '../../prompt';

interface OpenAIResponse {
  synonyms: string[];
  error?: string;
}

interface GenerateSynonymsParams {
  name: string;
  imageBase64: string;
  existingDescription?: string;
  apiKey: string;
  systemMessage?: string;
  userPrompt?: string;
}

/**
 * Parse the AI response text into structured format
 * @param text Raw text from AI response
 * @returns Array of formatted category lines
 */
function parseAIResponse(text: string): string[] {
  
  // Clean up the response - remove any whitespace, newlines, etc.
  const cleanedText = text.trim();
  
  // For the new format (comma-separated list), we'll just split by commas
  // and format each item as a category.
  // If the response is already comma-separated, this will work directly
  const items = cleanedText.split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
  
  // Format each item with a category
  const result = items.map(item => `Item: ${item}`);
  return result;
}

/**
 * Generate synonyms for an icon using OpenAI
 * @param params Parameters including icon name, image, and API key
 * @returns Promise resolving to synonyms or error
 */
export async function generateSynonyms(params: GenerateSynonymsParams): Promise<OpenAIResponse> {
  try {
    // Check if API key is available
    if (!params.apiKey) {
      console.error('[ERROR] OpenAI API key is missing');
      throw new Error('OpenAI API key is not set. Please add it in the Settings tab.');
    }
    
    if (params.apiKey.trim().length < 20) {
      console.error('[ERROR] OpenAI API key is too short or invalid');
      throw new Error('The API key provided appears to be invalid. Please check your OpenAI API key in the Settings tab.');
    }
    
    // Use provided custom prompts if available, otherwise use defaults
    const promptData = getIconSynonymsPrompt(
      params.name, 
      params.existingDescription,
      params.systemMessage,
      params.userPrompt
    );
    
    // Log the messages being sent to OpenAI
    console.log('[API] Sending to OpenAI:');
    console.log('[API] System Message:', promptData.systemMessage);
    console.log('[API] User Prompt:', promptData.userPrompt);
    console.log('[API] Using API key (first 4 chars):', params.apiKey.substring(0, 4) + '...');
    
    console.log('[API] Making fetch request to OpenAI API');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${params.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: promptData.systemMessage
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: promptData.userPrompt
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

    console.log('[API] OpenAI response status:', response.status, response.statusText);

    if (!response.ok) {
      // Specific error message for common status codes
      if (response.status === 401) {
        console.error('[ERROR] OpenAI API authentication error (401)');
        throw new Error('Authentication failed. Please check your OpenAI API key in the Settings tab and make sure it is valid and has not expired.');
      }
      
      let errorMessage = `OpenAI API error: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        console.error('[ERROR] OpenAI API detailed error:', errorData);
        
        // Extract specific error information if available
        if (errorData.error) {
          if (errorData.error.code === 'invalid_api_key') {
            errorMessage = 'Invalid API key. Please check your OpenAI API key in the Settings tab.';
          } else if (errorData.error.message) {
            errorMessage += ` - ${errorData.error.message}`;
          } else {
            errorMessage += ` - ${JSON.stringify(errorData)}`;
          }
        } else {
          errorMessage += ` - ${JSON.stringify(errorData)}`;
        }
      } catch (jsonError) {
        console.error('[ERROR] Failed to parse error response:', jsonError);
        // If we can't parse the JSON, just use the original error message
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('[API] OpenAI response received successfully');
    console.log('------------------------------------');
    console.log('[API] RESPONSE FROM OPENAI:');
    console.log(data.choices[0].message.content);
    console.log('------------------------------------');

    // Parse the response text into structured format
    const parsedSynonyms = parseAIResponse(data.choices[0].message.content);
    console.log('[API] Parsed synonyms:', parsedSynonyms);
    
    if (!parsedSynonyms || parsedSynonyms.length === 0) {
      throw new Error('No valid synonyms generated. Try again or use a different icon.');
    }

    return {
      synonyms: parsedSynonyms
    };
  } catch (error: any) {
    console.error('[ERROR] Error generating synonyms:', error);
    return {
      synonyms: [],
      error: error.message || 'Unknown error occurred while generating synonyms.'
    };
  }
} 