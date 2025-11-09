export type WritingTone = 'student' | 'ai';

export interface Profile {
  name: string;
  preferredTone: WritingTone;
}

export type View = 'chat' | 'ppt-maker' | 'converter' | 'analyzer' | 'profile';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  tone: WritingTone;
  attachment?: {
    name: string;
  };
}

export interface Slide {
  title: string;
  bullets: string[];
  speakerNotes: string;
}

export interface PptContent {
  slides: Slide[];
}

export interface AnalysisHighlight {
  sentence: string;
  reason: string;
}

export interface SpellingError {
  word: string;
  suggestions: string[];
}

export interface GrammarSuggestion {
  sentence: string;
  suggestion: string;
}

export interface AnalysisReport {
  aiScore: number; // 0-100
  aiHighlights: AnalysisHighlight[];
  spellingErrors: SpellingError[];
  grammarSuggestions: GrammarSuggestion[];
  readability: {
    flesch: number;
  };
}
