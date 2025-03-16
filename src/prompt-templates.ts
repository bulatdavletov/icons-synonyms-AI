// Prompt template for AI service

/**
 * Generate a prompt for icon synonym generation
 * @param iconName The name of the icon
 * @param existingDescription The existing description of the icon (if any)
 * @returns A formatted prompt string
 */
export function getIconSynonymsPrompt(iconName: string, existingDescription?: string): string {
  return `
    This is an icon named "${iconName}". 
    ${existingDescription ? `It currently has this description: "${existingDescription}"` : ''}
    Please generate relevant synonyms or related terms that would help users find this icon when searching.
    Context: these icons are used in JetBrains IDEs.
    If name contain several words, use them as separate entities: moveToRightTop = move to right top. It increases the chance to find the icon.
    Describe the object from the image: trash bin, folder, heart, etc.
    Describe usual meaning of the object: delete, save, like, etc.
    Describe shapes that you see: circle, square, rectangle, arrow, etc.
    Don't use words like "icon", "symbol", "image", etc.
    Don't repeat the name of icon or existing description.
    Return only a JSON array of strings with no additional text.
  `;
} 