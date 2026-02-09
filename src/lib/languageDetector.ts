// Language detection utility
export type Language = 'en' | 'hi' | 'es' | 'fr' | 'de' | 'pt' | 'ja' | 'zh';

interface LanguageDetectionResult {
  language: Language;
  confidence: number;
}

// Common words/patterns for language detection
const languagePatterns: Record<Language, RegExp> = {
  en: /\b(the|is|are|be|a|an|and|or|in|on|at|to|for|of|with|by|from|up|about|out|if|so|no|yes|hello|hi|what|how|why)\b/i,
  hi: /[\u0900-\u097F]/,  // Devanagari script
  es: /\b(el|la|de|que|y|a|en|un|una|los|las|ese|esto|hola|qué|cómo|por|con|para)\b/i,
  fr: /\b(le|la|de|et|un|une|est|que|les|pour|par|plus|bien|très|bonjour|comment|quoi|pourquoi)\b/i,
  de: /\b(der|die|das|und|ein|eine|ist|in|von|zu|den|mit|sich|des|auf|für|an|auch|es|an)\b/i,
  pt: /\b(o|a|de|que|e|do|da|em|um|para|é|com|não|uma|os|no|se|na|sua|ou|ele|has|como)\b/i,
  ja: /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/,  // Hiragana, Katakana, Kanji
  zh: /[\u4E00-\u9FFF\u3400-\u4DB5]/,  // CJK Unified Ideographs
};

const commonPhrases: Record<Language, string[]> = {
  en: ['hello', 'hi', 'help', 'thanks', 'please', 'excuse me', 'why', 'how', 'what', 'when'],
  hi: ['नमस्ते', 'धन्यवाद', 'कृपया', 'कैसे', 'क्या', 'कब', 'क्यों', 'मदद', 'सवाल', 'समझाओ'],
  es: ['hola', 'gracias', 'por favor', 'ayuda', 'cómo', 'qué', 'cuándo', 'por qué', 'excusa'],
  fr: ['bonjour', 'merci', 's\'il vous plaît', 'aide', 'comment', 'quoi', 'quand', 'pourquoi'],
  de: ['hallo', 'danke', 'bitte', 'hilfe', 'wie', 'was', 'wann', 'warum', 'entschuldigung'],
  pt: ['olá', 'obrigado', 'por favor', 'ajuda', 'como', 'o que', 'quando', 'por quê'],
  ja: ['こんにちは', 'ありがとう', 'お願いします', 'どう', 'なに', 'いつ', 'なぜ', '助けて'],
  zh: ['你好', '谢谢', '请', '帮助', '怎么', '什么', '什么时候', '为什么'],
};

/**
 * Detect language from text input
 */
export function detectLanguage(text: string): LanguageDetectionResult {
  if (!text || text.trim().length === 0) {
    return { language: 'en', confidence: 0 };
  }

  const scores: Record<Language, number> = {
    en: 0, hi: 0, es: 0, fr: 0, de: 0, pt: 0, ja: 0, zh: 0,
  };

  // Check for script-specific characters
  const languages: Language[] = ['hi', 'ja', 'zh'];
  for (const lang of languages) {
    if (languagePatterns[lang].test(text)) {
      scores[lang] += 50;
    }
  }

  // Check for common patterns
  for (const [lang, pattern] of Object.entries(languagePatterns) as [Language, RegExp][]) {
    const matches = text.match(pattern);
    if (matches) {
      scores[lang] += matches.length * 5;
    }
  }

  // Check for common phrases
  const lowerText = text.toLowerCase();
  for (const [lang, phrases] of Object.entries(commonPhrases) as [Language, string[]][]) {
    for (const phrase of phrases) {
      if (lowerText.includes(phrase.toLowerCase())) {
        scores[lang] += 10;
      }
    }
  }

  // Find language with highest score
  const detectedLang = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || 'en') as Language;
  const maxScore = Math.max(...Object.values(scores));
  const confidence = maxScore > 0 ? Math.min(maxScore / 100, 1) : 0;

  return { language: detectedLang, confidence };
}

/**
 * Get language name for display
 */
export function getLanguageName(lang: Language): string {
  const names: Record<Language, string> = {
    en: 'English',
    hi: 'हिंदी (Hindi)',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    pt: 'Português',
    ja: '日本語',
    zh: '中文',
  };
  return names[lang] || 'Unknown';
}

/**
 * Get communication style from text (formal, casual, excited, etc.)
 */
export function detectCommunicationStyle(text: string): string {
  const excitation = (text.match(/!+/g) || []).length;
  const questions = (text.match(/\?+/g) || []).length;
  const caps = (text.match(/[A-Z]/g) || []).length;
  const emojis = (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;

  if (excitation >= 2 || emojis >= 1 || (caps / text.length > 0.3)) {
    return 'enthusiastic';
  }
  if (questions >= 2) {
    return 'inquisitive';
  }
  if (text.length < 20) {
    return 'brief';
  }
  return 'neutral';
}

/**
 * Get appropriate response tone based on detected style
 */
export function getResponseTone(style: string): string {
  const tones: Record<string, string> = {
    enthusiastic: 'Be enthusiastic and engaging with exclamation marks and emojis where appropriate.',
    inquisitive: 'Provide detailed, thorough explanations with examples and encourage deeper exploration.',
    brief: 'Keep responses concise and to the point.',
    neutral: 'Be friendly and professional.',
  };
  return tones[style] || tones.neutral;
}
