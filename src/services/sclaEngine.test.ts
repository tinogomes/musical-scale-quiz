// src/services/scaleEngine.test.ts
import { scaleEngine } from './scaleEngine';

describe('ScaleEngine', () => {
  describe('generateScale', () => {
    test('should generate C major scale in latin notation', () => {
      const scale = scaleEngine.generateScale('C', 'major', 'latin');
      expect(scale).toEqual(['Dó', 'Ré', 'Mi', 'Fá', 'Sol', 'Lá', 'Si']);
    });

    test('should generate C major scale in english notation', () => {
      const scale = scaleEngine.generateScale('C', 'major', 'english');
      expect(scale).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
    });

    test('should generate G major scale', () => {
      const scale = scaleEngine.generateScale('G', 'major', 'english');
      expect(scale).toEqual(['G', 'A', 'B', 'C', 'D', 'E', 'F#']);
    });
  });

  describe('getDegreeNote', () => {
    test('should get 4th degree of C major', () => {
      const note = scaleEngine.getDegreeNote('C', 4, 'major', 'latin');
      expect(note).toBe('Fá');
    });

    test('should get 7th degree of G major', () => {
      const note = scaleEngine.getDegreeNote('G', 7, 'major', 'english');
      expect(note).toBe('F#');
    });

    test('should get 3rd degree of Bb major', () => {
      const note = scaleEngine.getDegreeNote('Bb', 3, 'major', 'english');
      expect(note).toBe('D');
    });
  });

  describe('validateAnswer', () => {
    test('should accept correct answer', () => {
      const isValid = scaleEngine.validateAnswer('Fá', 'Fá', 'latin');
      expect(isValid).toBe(true);
    });

    test('should accept enharmonic equivalents', () => {
      const isValid = scaleEngine.validateAnswer('Gb', 'F#', 'english');
      expect(isValid).toBe(true);
    });

    test('should normalize input', () => {
      const isValid = scaleEngine.validateAnswer('fa', 'Fá', 'latin');
      expect(isValid).toBe(true);
    });

    test('should reject incorrect answer', () => {
      const isValid = scaleEngine.validateAnswer('Sol', 'Fá', 'latin');
      expect(isValid).toBe(false);
    });
  });
});
