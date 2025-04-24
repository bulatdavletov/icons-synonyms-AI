// check-secrets.js - Script to check for secrets in build files
const fs = require('fs');
const path = require('path');

// Pattern to detect API keys - adjust as needed
const API_KEY_PATTERN = /sk-[a-zA-Z0-9]{32,}/g;

// Function to check a file for API keys
function checkFileForSecrets(filePath) {
  try {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return { safe: true };
    }
    
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for API keys
    const matches = content.match(API_KEY_PATTERN);
    
    return {
      safe: !matches,
      matches: matches || []
    };
  } catch (error) {
    console.error(`Error checking file ${filePath}:`, error);
    return { safe: false, error };
  }
}

// Files to check
const filesToCheck = [
  path.resolve(__dirname, '../build/main.js'),
  path.resolve(__dirname, '../build/ui.js')
];

// Check all files
let allSafe = true;
for (const file of filesToCheck) {
  const result = checkFileForSecrets(file);
  
  if (!result.safe) {
    allSafe = false;
    console.error(`❌ Found potential API keys in ${file}:`);
    if (result.matches) {
      result.matches.forEach((match, index) => {
        console.error(`  ${index + 1}. ${match.substring(0, 5)}...${match.substring(match.length - 4)}`);
      });
    }
  }
}

// Exit with error if any secrets found
if (!allSafe) {
  console.error('❌ Secrets found in build files. Please rebuild with clean API keys.');
  process.exit(1);
} else {
  console.log('✅ No secrets found in build files.');
} 