import { describe, it, expect } from 'vitest';
import { validateBrief } from '@prism/shared';
import { PerplexityClient } from '../src/tools/perplexitySearch';

describe('Agent Tools', () => {
  describe('Brief validation', () => {
    it('should validate a correct brief', () => {
      const brief = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        query: 'What is AI?',
        title: 'Artificial Intelligence Overview',
        summary: 'AI is a field of computer science focused on creating intelligent machines.',
        bullets: ['Machine learning is a subset of AI', 'AI has many applications'],
        citations: [
          {
            title: 'What is AI?',
            url: 'https://example.com/ai',
            publisher: 'example.com',
          },
        ],
        createdAt: new Date().toISOString(),
      };

      const result = validateBrief(brief);
      expect(result.success).toBe(true);
    });

    it('should reject brief with invalid URL', () => {
      const brief = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        query: 'What is AI?',
        title: 'Artificial Intelligence Overview',
        summary: 'AI is a field of computer science.',
        bullets: ['Machine learning is a subset of AI'],
        citations: [
          {
            title: 'What is AI?',
            url: 'not-a-valid-url',
          },
        ],
        createdAt: new Date().toISOString(),
      };

      const result = validateBrief(brief);
      expect(result.success).toBe(false);
    });
  });

  describe('PerplexityClient', () => {
    it('should handle missing API key', () => {
      expect(() => {
        new PerplexityClient('');
      }).toThrow();
    });

    // Note: Real API tests would require API key
    it('should initialize with valid API key', () => {
      const client = new PerplexityClient('test-key');
      expect(client).toBeInstanceOf(PerplexityClient);
    });
  });
});