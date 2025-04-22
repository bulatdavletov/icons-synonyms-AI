import { generateSynonyms } from '../ai-service';
import { config } from '../config';

// Mock the config module
jest.mock('../config', () => ({
  config: {
    API_PROVIDER: 'openai',
    OPENAI_API_KEY: 'test-api-key',
    JETBRAINS_API_KEY: 'test-jetbrains-api-key'
  }
}));

// Mock the prompt-templates module
jest.mock('../prompt-templates', () => ({
  getIconSynonymsPrompt: jest.fn().mockReturnValue('Test prompt')
}));

// Mock the jetbrains-api-config module
jest.mock('../jetbrains-api-config', () => ({
  getJetBrainsApiEntryPoint: jest.fn().mockResolvedValue('https://test-jetbrains-api.com')
}));

describe('AI Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe('generateSynonyms with OpenAI', () => {
    beforeEach(() => {
      // Set API provider to OpenAI
      (config as any).API_PROVIDER = 'openai';
    });

    it('should successfully generate synonyms with OpenAI', async () => {
      // Mock successful OpenAI API response
      const mockResponse = {
        choices: [
          {
            message: {
              content: `
                Usage: file explorer
                Object: folder, directory
                Modificator: search
                Shapes: rectangle
              `
            }
          }
        ]
      };

      // Setup fetch mock
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse)
      });

      // Test parameters
      const params = {
        name: 'fileExplorer',
        imageBase64: 'base64-encoded-image',
        existingDescription: 'A file explorer icon'
      };

      // Call the function
      const result = await generateSynonyms(params);

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key'
          })
        })
      );

      // Verify the result
      expect(result).toEqual({
        synonyms: [
          'Usage: file explorer',
          'Object: folder, directory',
          'Modificator: search',
          'Shapes: rectangle'
        ]
      });
    });

    it('should handle errors from OpenAI API', async () => {
      // Mock failed OpenAI API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request'
      });

      // Test parameters
      const params = {
        name: 'fileExplorer',
        imageBase64: 'base64-encoded-image'
      };

      // Call the function
      const result = await generateSynonyms(params);

      // Verify the error is handled
      expect(result).toEqual({
        synonyms: [],
        error: expect.stringContaining('OpenAI API error')
      });
    });
  });

  describe('generateSynonyms with JetBrains', () => {
    beforeEach(() => {
      // Set API provider to JetBrains
      (config as any).API_PROVIDER = 'jetbrains';
    });

    it('should successfully generate synonyms with JetBrains API', async () => {
      // Mock successful JetBrains API response
      const mockResponse = {
        choices: [
          {
            message: {
              content: `
                Usage: settings
                Object: gear, cog
                Modificator: wrench
                Shapes: circle
              `
            }
          }
        ]
      };

      // Setup fetch mock
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse)
      });

      // Test parameters
      const params = {
        name: 'settings',
        imageBase64: 'base64-encoded-image'
      };

      // Call the function
      const result = await generateSynonyms(params);

      // Verify fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-jetbrains-api.com/api/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-jetbrains-api-key'
          })
        })
      );

      // Verify the result
      expect(result).toEqual({
        synonyms: [
          'Usage: settings',
          'Object: gear, cog',
          'Modificator: wrench',
          'Shapes: circle'
        ]
      });
    });

    it('should handle errors from JetBrains API', async () => {
      // Mock failed JetBrains API response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized'
      });

      // Test parameters
      const params = {
        name: 'settings',
        imageBase64: 'base64-encoded-image'
      };

      // Call the function
      const result = await generateSynonyms(params);

      // Verify the error is handled
      expect(result).toEqual({
        synonyms: [],
        error: expect.stringContaining('JetBrains API error')
      });
    });
  });

  // Test the parseAIResponse function directly by exposing it for testing
  describe('parseAIResponse', () => {
    // We need to get access to the private parseAIResponse function
    // One way is to mock the fetch response and check the result
    it('should correctly parse AI response text', async () => {
      // Set API provider to OpenAI
      (config as any).API_PROVIDER = 'openai';

      // Mock successful OpenAI API response with various formats
      const mockResponse = {
        choices: [
          {
            message: {
              content: `
                Usage: project structure
                Object: folder, directory
                Modificator: gear
                Shapes: square, arrow

                Some extra text that should be ignored
              `
            }
          }
        ]
      };

      // Setup fetch mock
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce(mockResponse)
      });

      // Test parameters
      const params = {
        name: 'projectStructure',
        imageBase64: 'base64-encoded-image'
      };

      // Call the function
      const result = await generateSynonyms(params);

      // Verify the parsing result
      expect(result).toEqual({
        synonyms: [
          'Usage: project structure',
          'Object: folder, directory',
          'Modificator: gear',
          'Shapes: square, arrow'
        ]
      });
    });
  });
});
