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
    Please analyze this icon and provide information in the following format. Each line should start with the category name:

    1. Usage (required):
       - This is how the icon is used in the IDE
       - Usually it's the name of the action or feature
       - If name contains multiple words in camelCase, split them with spaces
       - Example: "projectStructure" -> "Usage: project structure"
       - Format: "Usage: your text here"

    2. Object (required):
       - The main object represented in the icon
       - Example: if named "projectStructure" but shows a folder icon -> "Object: folder"
       - Can include multiple related terms separated by commas
       - Format: "Object: term1, term2"

    3. Modificator (if found, leave empty if not):
       - Look for small icons/indicators in the corners (usually bottom right)
       - Example: folder with gear icon -> "Modificator: gear, settings"
       - Format: "Modificator: term1, term2" (or leave empty)

    4. Shapes (if found, leave empty if not):
       - List any simple shapes you see in the icon
       - Include circles, squares, rectangles, arrows, etc.
       - Example: "Shapes: circle, arrow, triangle"
       - Format: "Shapes: shape1, shape2, shape3"

    Example output:
    Usage: project structure
    Object: folder
    Modificator: gear
    Shapes: square, arrow

    Context: These icons are used in JetBrains IDEs.
    Don't use words like "icon", "symbol", "image", etc.
    Don't repeat the name of icon or existing description.
    Return only these four categories with their values, one per line.
    Leave empty lines for categories that don't apply (except required ones).
  `;
} 