// AI Service for handling OpenAI integration
import { getIconSynonymsPrompt } from '../prompt';

// Set to true to enable two-pass generation (second message to verify and improve results)
const ENABLE_TWO_PASS_GENERATION = true;

interface OpenAIResponse {
  synonyms: string[];
  error?: string;
}

interface GenerateSynonymsParams {
  name: string;
  imageBase64: string;
  existingDescription?: string;
  apiKey: string;
  model?: string;
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
      throw new Error('OpenAI API key is not set. Please add it in the Settings tab.');
    }
    
    const promptData = getIconSynonymsPrompt(params.name, params.existingDescription);
    
    // Log the messages being sent to OpenAI
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${params.apiKey}`
      },
      body: JSON.stringify({
        model: params.model || 'gpt-4.1-mini',
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

    let data = await response.json();
    const firstResponse = data.choices[0].message.content;
    
    // If two-pass generation is enabled, send a follow-up message to verify and improve results
    if (ENABLE_TWO_PASS_GENERATION) {
      
      const verificationFetchResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${params.apiKey}`
        },
        body: JSON.stringify({
          model: params.model || 'gpt-4.1-mini',
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
            },
            {
              role: 'assistant',
              content: firstResponse
            },
            {
              role: 'user',
              content: 
                "Please review your previous answer. Make sure you've followed all the rules from the message. Return a comma-separated list of synonyms that are precise, concise, and relevant to the icon shown. If your previous answer already meets these criteria, you can return it unchanged."
            }
          ],
          max_tokens: 300
        })
      });
      
      if (!verificationFetchResponse.ok) {
        console.log('Verification response failed, using initial response');
      } else {
        const verificationData = await verificationFetchResponse.json();
        const secondResponse = verificationData.choices[0].message.content;
        
        // Display comparison between initial and verification results
        console.log('------------------------------------');
        console.log('First and second response:');
        console.log(firstResponse);
        console.log(secondResponse);
        console.log('------------------------------------');
        
        // Use the verification response instead
        data = verificationData;
      }
    } else {
      // If two-pass is disabled, just log the initial response
      console.log('------------------------------------');
      console.log('RESULT:');
      console.log(firstResponse);
      console.log('------------------------------------');
    }

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