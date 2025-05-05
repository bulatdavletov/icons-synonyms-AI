// Prompt template for AI service

export const DEFAULT_SYSTEM_MESSAGE = `
  You are a Figma plugin that creates icon descriptions and synonyms to improve icon searchability.
  Your only task is to analyze the icon and return a list of relevant keywords separated by commas, all in lowercase.
  Do not use markdown, formatting, bullets, or numbering. Just plain text.
  Format your response as a simple comma-separated list.
`;

export const DEFAULT_USER_PROMPT = `
  Look at the icon and generate a list of relevant keywords, separated by commas. Include:

- [Required] First item: Description of WHAT is shown in the icon, without commas (e.g., "folder with blue gear"). 
  - Most importantly to describe objects in the icon, not what it means or does.
  - Don't separate words here, just describe the icon as a whole (e.g., "folder with blue gear" instead of "folder, blue, gear")
  - Use numbers instead of words in counts (e.g., "2 squares" instead of "two squares")
  - Don't use words like "icon", "symbol", "image", "outline", "shape", because they are not relevant to the icon's purpose
  - Always describe color, if it's other than gray (e.g. "folder with blue gear"). Don't add grey as a color, because all icons are gray by default.
  - Always describe direction of arrows (e.g., "arrow down with bracket")
  Good examples: "arrow up right with corner", "trash bin", "arrow down with letters A and letter Z", "2 rectangles with horizontal line", "blue isometric cube"

- [Optional] Other items: What the icon is typically used for in UI (e.g., "settings", "delete", "add")
`;

export const SECOND_PROMPT = `
  Please review the answer. 
  Make sure that all the rules from the first message are followed. 
  Double check:
  - Color is included if it's not gray
  - Direction of arrows is included
  - Words like "outlined", "filled" are excluded
  - Numbers are used as numbers, not words, e.g. "2" instead of "two"
  If your previous answer already meets these criteria, you can return it unchanged.
`;

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