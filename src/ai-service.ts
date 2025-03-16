// AI Service for handling OpenAI integration
import { OPENAI_API_KEY } from './api-keys';
import { getIconSynonymsPrompt } from './prompt-templates';

interface OpenAIResponse {
  synonyms: string[];
  error?: string;
}

interface IconData {
  name: string;
  imageBase64: string;
  existingDescription?: string;
}

// Use imported API key from separate file that's gitignored
const HARDCODED_API_KEY = OPENAI_API_KEY;

export async function generateSynonyms(iconData: IconData, apiKey: string = ""): Promise<OpenAIResponse> {
  try {
    // Use the provided API key or fall back to the hardcoded one
    const effectiveApiKey = apiKey.trim() || HARDCODED_API_KEY;
    
    // OpenAI API endpoint for GPT-4 Vision
    const endpoint = 'https://api.openai.com/v1/chat/completions';
    
    // Get the prompt for icon synonyms
    const prompt = getIconSynonymsPrompt(iconData.name, iconData.existingDescription);
    
    // Prepare the request payload
    const payload = {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${iconData.imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 300
    };
    
    // Log the final message being sent to OpenAI (excluding the image data for brevity)
    console.log("Sending to OpenAI:", {
      model: payload.model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: "[BASE64_IMAGE_DATA]" } }
          ]
        }
      ],
      max_tokens: payload.max_tokens
    });
    
    // Make the API request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${effectiveApiKey}`
      },
      body: JSON.stringify(payload)
    });
    
    // Parse the response
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Unknown error from OpenAI API');
    }
    
    // Extract the synonyms from the response
    const content = data.choices[0].message.content;
    
    // Log the response from OpenAI
    console.log("Response from OpenAI:", content);
    
    // Parse the JSON array from the response
    try {
      const synonyms = JSON.parse(content);
      return { synonyms };
    } catch (parseError) {
      // If parsing fails, try to extract an array from the text
      // Using a regular expression without the 's' flag for compatibility
      const matches = content.match(/\[([\s\S]*)\]/);
      if (matches && matches[1]) {
        try {
          const synonyms = JSON.parse(`[${matches[1]}]`);
          return { synonyms };
        } catch (e) {
          throw new Error('Failed to parse synonyms from response');
        }
      } else {
        throw new Error('Response format not recognized');
      }
    }
  } catch (error: any) {
    console.error('Error generating synonyms:', error);
    return {
      synonyms: [],
      error: error.message || 'Unknown error occurred'
    };
  }
} 