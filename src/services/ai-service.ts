// AI Service for handling OpenAI integration
import { getIconSynonymsPrompt } from '../prompt-templates';

interface OpenAIResponse {
  synonyms: string[];
  error?: string;
}

interface GenerateSynonymsParams {
  name: string;
  imageBase64: string;
  existingDescription?: string;
  apiKey: string;
}

/**
 * Parse the AI response text into structured format
 * @param text Raw text from AI response
 * @returns Array of formatted category lines
 */
function parseAIResponse(text: string): string[] {
  console.log('Raw AI response:', text);
  
  // Clean up the response - remove any whitespace, newlines, etc.
  const cleanedText = text.trim();
  
  // For the new format (comma-separated list), we'll just split by commas
  // and format each item as a category.
  // If the response is already comma-separated, this will work directly
  const items = cleanedText.split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
  
  console.log('Parsed items:', items);
  
  // Format each item with a category
  const result = items.map(item => `Item: ${item}`);
  
  console.log('Formatted response:', result);
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
      throw new Error('OpenAI API key is not set. Please add it in the Settings tab.');
    }
    
    const promptData = getIconSynonymsPrompt(params.name, params.existingDescription);
    
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

    if (!response.ok) {
      let errorMessage = `OpenAI API error: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage += ` - ${JSON.stringify(errorData)}`;
      } catch (jsonError) {
        // If we can't parse the JSON, just use the original error message
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Response from OpenAI:', data.choices[0].message.content);

    // Parse the response text into structured format
    const parsedSynonyms = parseAIResponse(data.choices[0].message.content);
    
    if (!parsedSynonyms || parsedSynonyms.length === 0) {
      throw new Error('No valid synonyms generated. Try again or use a different icon.');
    }

    return {
      synonyms: parsedSynonyms
    };
  } catch (error: any) {
    console.error('Error generating synonyms:', error);
    return {
      synonyms: [],
      error: error.message || 'Unknown error occurred while generating synonyms.'
    };
  }
} 