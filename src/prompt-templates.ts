// Prompt template for AI service

export const DEFAULT_SYSTEM_MESSAGE = `You are a Figma plugin that creates icon descriptions to improve searchability.
Your only task is to analyze the icon and return a list of words separated by commas, all in lowercase.
Do not use markdown, formatting, bullets, or numbering. Just plain text.
Format your response as a simple comma-separated list in lowercase without bullets, numbering or other formatting.`;

export const DEFAULT_USER_PROMPT = `Look at the icon and generate a list of relevant keywords, separated by commas. Include:

- Split camelCase names (e.g., "projectStructure" → "project structure")
- Description of what the icon shows (e.g., "folder with blue gear")
- What the icon is typically used for (e.g., "settings", "delete", "add")
- All separate objects visible in the icon (e.g., "folder, gear, lock, arrow down")
- Basic shapes present (e.g., "circle", "square", "rectangle")

Always describe color, if it's not gray (e.g. "folder with blue gear")
Always describe direction of arrows (e.g., "arrow down", "arrow left")
Don't use words like "icon", "symbol", "image".
Don't repeat the name or existing description.`;

/**
 * Generate a prompt for icon synonym generation
 * @param iconName The name of the icon
 * @param existingDescription The existing description of the icon (if any)
 * @param systemMessage The system message to use (defaults to DEFAULT_SYSTEM_MESSAGE)
 * @param userPrompt The user prompt to use (defaults to DEFAULT_USER_PROMPT)
 * @returns An object with system message and user prompt
 */
export function getIconSynonymsPrompt(
  iconName: string, 
  existingDescription?: string,
  systemMessage: string = DEFAULT_SYSTEM_MESSAGE,
  userPrompt: string = DEFAULT_USER_PROMPT
): { systemMessage: string; userPrompt: string } {
  const iconInfo = `Info from Figma:
This is an icon named "${iconName}". 
${existingDescription ? `It currently has this description: "${existingDescription}"` : ''}

---
`;

  return {
    systemMessage,
    userPrompt: `${iconInfo}${userPrompt}`
  };
} 