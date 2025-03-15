"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSynonyms = generateSynonyms;
function generateSynonyms(iconData, apiKey) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            // OpenAI API endpoint for GPT-4 Vision
            const endpoint = 'https://api.openai.com/v1/chat/completions';
            // Create the prompt with the icon information
            const prompt = `
      This is an icon named "${iconData.name}". 
      ${iconData.existingDescription ? `It currently has this description: "${iconData.existingDescription}"` : ''}
      Please generate a list of 5-10 relevant synonyms or related terms that would help users find this icon when searching.
      Focus on the visual appearance and common use cases for this icon.
      Return only a JSON array of strings with no additional text.
    `;
            // Prepare the request payload
            const payload = {
                model: "gpt-4-vision-preview",
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
            // Make the API request
            const response = yield fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(payload)
            });
            // Parse the response
            const data = yield response.json();
            if (!response.ok) {
                throw new Error(((_a = data.error) === null || _a === void 0 ? void 0 : _a.message) || 'Unknown error from OpenAI API');
            }
            // Extract the synonyms from the response
            const content = data.choices[0].message.content;
            // Parse the JSON array from the response
            try {
                const synonyms = JSON.parse(content);
                return { synonyms };
            }
            catch (parseError) {
                // If parsing fails, try to extract an array from the text
                // Using a regular expression without the 's' flag for compatibility
                const matches = content.match(/\[([\s\S]*)\]/);
                if (matches && matches[1]) {
                    try {
                        const synonyms = JSON.parse(`[${matches[1]}]`);
                        return { synonyms };
                    }
                    catch (e) {
                        throw new Error('Failed to parse synonyms from response');
                    }
                }
                else {
                    throw new Error('Response format not recognized');
                }
            }
        }
        catch (error) {
            console.error('Error generating synonyms:', error);
            return {
                synonyms: [],
                error: error.message || 'Unknown error occurred'
            };
        }
    });
}
