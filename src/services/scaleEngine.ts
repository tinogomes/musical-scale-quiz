// src/services/scaleEngine.ts

export type ScaleType = 'major' | 'minor' | 'dorian' | 'mixolydian' | 'chromatic';
export type Notation = 'latin' | 'english';

export interface ScaleConfig {
  scaleType: ScaleType;
  notation: Notation;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Question {
  tonic: string;
  degree: number;
  scaleType: ScaleType;
  notation: Notation;
}

export interface Answer {
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

// Notas cromáticas com equivalências enharmônicas
const CHROMATIC_NOTES = {
  latin: [
    'Dó', 'Dó#', 'Ré', 'Ré#', 'Mi', 'Fá', 'Fá#', 'Sol', 'Sol#', 'Lá', 'Lá#', 'Si',
    'Réb', 'Mib', 'Fáb', 'Solb', 'Láb', 'Sib'
  ],
  english: [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
    'Db', 'Eb', 'Gb', 'Ab', 'Bb'
  ]
};

// Equivalências enharmônicas
const ENHARMONIC_EQUIVALENTS: Record<string, string[]> = {
  // Sustenidos para bemóis
  'C#': ['Db'], 'Dó#': ['Réb'],
  'D#': ['Eb'], 'Ré#': ['Mib'],
  'F#': ['Gb'], 'Fá#': ['Solb'],
  'G#': ['Ab'], 'Sol#': ['Láb'],
  'A#': ['Bb'], 'Lá#': ['Sib'],
  // Bemóis para sustenidos
  'Db': ['C#'], 'Réb': ['Dó#'],
  'Eb': ['D#'], 'Mib': ['Ré#'],
  'Gb': ['F#'], 'Solb': ['Fá#'],
  'Ab': ['G#'], 'Láb': ['Sol#'],
  'Bb': ['A#'], 'Sib': ['Lá#']
};

// Intervalos para cada tipo de escala (em semitons)
const SCALE_INTERVALS: Record<ScaleType, number[]> = {
  major: [2, 2, 1, 2, 2, 2, 1],
  minor: [2, 1, 2, 2, 1, 2, 2],
  dorian: [2, 1, 2, 2, 2, 1, 2],
  mixolydian: [2, 2, 1, 2, 2, 1, 2],
  chromatic: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
};

// Tonalidades por dificuldade
const TONALITIES_BY_DIFFICULTY = {
  easy: ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb'],
  medium: ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'],
  hard: ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'G#', 'D#', 'A#', 'E#', 'B#']
};

export class ScaleEngine {
  private normalizeNote(note: string, notation: Notation): string {
    let normalized = note.trim().toLowerCase();
    
    // Remover acentos e normalizar
    normalized = normalized
      .replace(/[áàâãä]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[íìîï]/g, 'i')
      .replace(/[óòôõö]/g, 'o')
      .replace(/[úùûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ñ]/g, 'n');
    
    // Capitalizar primeira letra
    normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    
    // Converter abreviações
    const abbreviations: Record<string, string> = {
      'Do': notation === 'latin' ? 'Dó' : 'C',
      'Re': notation === 'latin' ? 'Ré' : 'D',
      'Mi': notation === 'latin' ? 'Mi' : 'E',
      'Fa': notation === 'latin' ? 'Fá' : 'F',
      'Sol': notation === 'latin' ? 'Sol' : 'G',
      'La': notation === 'latin' ? 'Lá' : 'A',
      'Si': notation === 'latin' ? 'Si' : 'B'
    };
    
    return abbreviations[normalized] || normalized;
  }

  private getNoteIndex(note: string, notation: Notation): number {
    const notes = CHROMATIC_NOTES[notation];
    const normalizedNote = this.normalizeNote(note, notation);
    
    let index = notes.findIndex(n => n === normalizedNote);
    
    // Se não encontrou, tentar equivalências enharmônicas
    if (index === -1) {
      for (const [baseNote, equivalents] of Object.entries(ENHARMONIC_EQUIVALENTS)) {
        if (baseNote === normalizedNote || equivalents.includes(normalizedNote)) {
          index = notes.findIndex(n => n === baseNote);
          if (index !== -1) break;
          
          // Tentar encontrar equivalente na notação atual
          const equivalentInNotation = equivalents.find(eq => 
            CHROMATIC_NOTES[notation].includes(eq)
          );
          if (equivalentInNotation) {
            index = notes.findIndex(n => n === equivalentInNotation);
            break;
          }
        }
      }
    }
    
    return index;
  }

  private getNoteName(index: number, notation: Notation): string {
    const notes = CHROMATIC_NOTES[notation];
    return notes[index % notes.length];
  }

  public generateScale(tonic: string, scaleType: ScaleType, notation: Notation): string[] {
    const tonicIndex = this.getNoteIndex(tonic, notation);
    if (tonicIndex === -1) throw new Error(`Tônica inválida: ${tonic}`);
    
    const intervals = SCALE_INTERVALS[scaleType];
    const scale: string[] = [this.getNoteName(tonicIndex, notation)];
    
    let currentIndex = tonicIndex;
    for (let i = 0; i < intervals.length - 1; i++) {
      currentIndex = (currentIndex + intervals[i]) % 12;
      scale.push(this.getNoteName(currentIndex, notation));
    }
    
    return scale;
  }

  public getDegreeNote(tonic: string, degree: number, scaleType: ScaleType, notation: Notation): string {
    const scale = this.generateScale(tonic, scaleType, notation);
    return scale[(degree - 1) % scale.length];
  }

  public validateAnswer(
    userAnswer: string, 
    correctNote: string, 
    notation: Notation
  ): boolean {
    const normalizedUserAnswer = this.normalizeNote(userAnswer, notation);
    const normalizedCorrectNote = this.normalizeNote(correctNote, notation);
    
    // Verificar se é exatamente igual
    if (normalizedUserAnswer === normalizedCorrectNote) return true;
    
    // Verificar equivalências enharmônicas
    const equivalents = ENHARMONIC_EQUIVALENTS[normalizedCorrectNote] || [];
    return equivalents.includes(normalizedUserAnswer);
  }

  public generateQuestion(config: ScaleConfig): Question {
    const { scaleType, notation, difficulty } = config;
    
    const availableTonalities = TONALITIES_BY_DIFFICULTY[difficulty];
    const tonic = availableTonalities[Math.floor(Math.random() * availableTonalities.length)];
    const degree = Math.floor(Math.random() * 7) + 1; // 1-7
    
    return { tonic, degree, scaleType, notation };
  }

  public getExplanation(question: Question, correctNote: string): string {
    const scale = this.generateScale(question.tonic, question.scaleType, question.notation);
    const scaleName = question.scaleType === 'major' ? 'maior' : 
                     question.scaleType === 'minor' ? 'menor' : question.scaleType;
    
    return `Escala ${scaleName} de ${question.tonic}: ${scale.join(', ')} — ${question.degree}ª = ${correctNote}`;
  }
}

export const scaleEngine = new ScaleEngine();
