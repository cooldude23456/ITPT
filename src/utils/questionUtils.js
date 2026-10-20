/**
 * Question Utilities for ITPracticeTests
 * Provides robust, zero-fail parsing, normalization, and display helpers for:
 * 1. Multi-select (MSQ) & Multi-choice (MCQ) question type detection
 * 2. Correct answer parsing and index normalization (0-based integer indices)
 * 3. Question answer explanation extraction and formatting
 */

/**
 * Parses flexible answer inputs into a standardized array of 0-based integer option indices.
 * 
 * Supports all real-world formats:
 * - Option text matching: "Amazon CloudFront, AWS Direct Connect", "CloudFront\nDirect Connect", etc.
 * - Separated numbers: "1,2", "1, 2", "1;2", "1/2", "1-2", "1 and 2", "1 & 2", "1 2"
 * - Excel date auto-conversions: "1-Feb" (1-2), "1-Mar" (1-3), "2-Mar" (2-3), "1-Apr" (1-4), Date objects
 * - Excel float/fraction numbers: 0.5 (1/2), 0.75 (3/4), 0.25 (1/4), 1.2, 1.3, 2.3, 2.4, 1.23, "1.2", "1.3"
 * - Concatenated numbers: 12, 13, 14, 23, 24, 34, 123, "12", "13", "14", "23", "24", "123"
 * - Separated letters: "A, B", "A,B", "A, C", "A; C", "A / C", "A and C", "A & C", "A B"
 * - Concatenated letters: "AB", "AC", "BC", "AD", "BD", "CD", "ABC", "ABD", "ABCD"
 * - Option phrases: "Option 1, Option 2", "Option A and Option C", "Choice 1, Choice 2", "Options 1, 3"
 * - Arrays: [0, 1], ["0", "1"], ["1", "2"], ["A", "B"], ["1,2"]
 * 
 * @param {any} rawVal
 * @param {string[]} options
 * @returns {number[]} Array of unique, sorted 0-based integer indices (e.g. [0, 1])
 */
export function parseCorrectAnswers(rawVal, options = []) {
  if (rawVal === undefined || rawVal === null || rawVal === '') {
    return [0];
  }

  const optionsCount = Array.isArray(options) && options.length > 0 ? options.length : 4;
  const indices = new Set();

  // 1. Handle JS Date objects (Excel auto-converts "1-2" or "1/2" into a Date object)
  if (rawVal instanceof Date && !isNaN(rawVal.getTime())) {
    const day = rawVal.getDate();
    const month = rawVal.getMonth() + 1;
    if (day >= 1 && day <= optionsCount) indices.add(day - 1);
    if (month >= 1 && month <= optionsCount) indices.add(month - 1);
    if (indices.size > 0) return Array.from(indices).sort((a, b) => a - b);
  }

  // 2. Handle arrays
  if (Array.isArray(rawVal)) {
    const flat = rawVal.flat(Infinity);

    // If array has explicit 0 or '0': clearly 0-based indices e.g. [0, 1]
    const hasZero = flat.some(item => item === 0 || item === '0');
    const allNumeric = flat.every(item => {
      const n = Number(item);
      return !isNaN(n) && Number.isInteger(n);
    });

    if (allNumeric && hasZero) {
      flat.forEach(item => {
        const n = Number(item);
        if (n >= 0 && n < optionsCount) indices.add(n);
      });
      if (indices.size > 0) return Array.from(indices).sort((a, b) => a - b);
    }

    // If array of 1-based numbers: e.g. [1, 2] or ['1', '2'] without 0
    if (allNumeric && !hasZero) {
      const allBetween1AndCount = flat.every(item => {
        const n = Number(item);
        return n >= 1 && n <= optionsCount;
      });
      if (allBetween1AndCount) {
        flat.forEach(item => indices.add(Number(item) - 1));
        return Array.from(indices).sort((a, b) => a - b);
      }
    }

    // Process each element
    flat.forEach(item => {
      const subParsed = parseCorrectAnswers(item, options);
      subParsed.forEach(idx => indices.add(idx));
    });

    if (indices.size > 0) {
      return Array.from(indices).sort((a, b) => a - b);
    }
  }

  // 3. Handle pure numbers, fractions and decimals from Excel
  if (typeof rawVal === 'number' && !isNaN(rawVal)) {
    // Check common fractions produced when Excel reads "1/2", "3/4", "1/4", "1/3", "2/3"
    const rounded = Math.round(rawVal * 1000) / 1000;
    if (rounded === 0.5 && optionsCount >= 2) return [0, 1];
    if (rounded === 0.75 && optionsCount >= 4) return [2, 3];
    if (rounded === 0.25 && optionsCount >= 4) return [0, 3];
    if ((rounded === 0.333 || rounded === 0.334) && optionsCount >= 3) return [0, 2];
    if ((rounded === 0.667 || rounded === 0.666) && optionsCount >= 3) return [1, 2];

    // Excel decimal numbers: e.g. 1.2, 1.3, 2.3, 2.4, 1.23, etc.
    if (!Number.isInteger(rawVal)) {
      const strVal = String(rawVal);
      const parts = strVal.split('.');
      if (parts.length === 2 && parts[0] && parts[1]) {
        const d1 = parseInt(parts[0], 10);
        if (d1 >= 1 && d1 <= optionsCount) indices.add(d1 - 1);
        for (let i = 0; i < parts[1].length; i++) {
          const d = parseInt(parts[1][i], 10);
          if (d >= 1 && d <= optionsCount) indices.add(d - 1);
        }
        if (indices.size > 0) return Array.from(indices).sort((a, b) => a - b);
      }
    }

    // Integer concatenation: e.g. 12, 13, 23, 123
    if (Number.isInteger(rawVal) && rawVal > optionsCount) {
      const digitsStr = String(rawVal);
      const allDigitsValid = digitsStr.split('').every(d => {
        const n = parseInt(d, 10);
        return n >= 1 && n <= optionsCount;
      });
      if (allDigitsValid && digitsStr.length >= 2) {
        digitsStr.split('').forEach(d => indices.add(parseInt(d, 10) - 1));
        return Array.from(indices).sort((a, b) => a - b);
      }
    }

    // Single integer
    if (rawVal === 0) return [0];
    if (rawVal >= 1 && rawVal <= optionsCount) return [rawVal - 1];
    return [0];
  }

  let str = String(rawVal).trim();
  if (!str) return [0];

  // 4. Excel Date string check: e.g. "1-Feb", "01-Feb", "1-Mar", "2-Mar", "1-Apr", "2-Apr", "3-Apr"
  // When users enter "1-2" or "1-3" into Excel, Excel auto-formats it to "1-Feb" or "1-Mar"
  const monthMap = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
  const dateMatch = str.match(/^0?([1-9])-(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)$/i) ||
                    str.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)-0?([1-9])$/i);
  if (dateMatch) {
    const d1 = parseInt(dateMatch[1] || dateMatch[2], 10);
    const mStr = (dateMatch[2] || dateMatch[1]).toLowerCase();
    const mNum = monthMap[mStr];
    if (d1 >= 1 && d1 <= optionsCount) indices.add(d1 - 1);
    if (mNum && mNum >= 1 && mNum <= optionsCount) indices.add(mNum - 1);
    if (indices.size > 0) return Array.from(indices).sort((a, b) => a - b);
  }

  // 5. Option text matching (single option or multiple options in string)
  if (Array.isArray(options) && options.length > 0) {
    // Check if entire str matches one option exactly
    const directIdx = options.findIndex(
      opt => opt && opt.trim().toLowerCase() === str.toLowerCase()
    );
    if (directIdx >= 0) return [directIdx];

    // Check if str contains multiple option texts (e.g. "CloudFront, Direct Connect" or with newlines)
    const normStr = str.toLowerCase().replace(/[\s\-_]+/g, ' ');
    const matchedOptionIndices = new Set();

    options.forEach((opt, idx) => {
      if (!opt) return;
      const cleanOpt = String(opt)
        .replace(/^(?:Option|Choice|Opt)?\s*[A-F0-9][\.\)\:\-]\s*/i, '') // strip leading "A." or "Option A:"
        .trim();
      const normOpt = cleanOpt.toLowerCase().replace(/[\s\-_]+/g, ' ');
      if (normOpt.length >= 3 && normStr.includes(normOpt)) {
        matchedOptionIndices.add(idx);
      }
    });

    if (matchedOptionIndices.size >= 2) {
      return Array.from(matchedOptionIndices).sort((a, b) => a - b);
    }
  }

  // 6. Clean and sanitize string:
  // Replace brackets, parentheses, braces, quotes, backticks, hash with spaces
  let cleanStr = str
    .replace(/[\[\]\(\)\{\}<>"'#`]/g, ' ')
    // Replace fullwidth and international punctuation
    .replace(/[\uFF0C\u3001\u060C\u00B7]/g, ',')
    .replace(/[\u2013\u2014]/g, ',')
    // Replace word separators: and, or, both, all, plus, amp
    .replace(/\band\b/gi, ',')
    .replace(/\bor\b/gi, ',')
    .replace(/\bboth\b/gi, '')
    .replace(/\ball\b/gi, '')
    .replace(/\bplus\b/gi, ',')
    .replace(/[&|+;/\-]/g, ',')
    // Replace dots between digits: e.g. 1.2 or 1 . 2 -> 1,2
    .replace(/(\d)\s*\.\s*(\d)/g, '$1,$2');

  // Check concatenated letters: e.g. "AB", "AC", "BC", "ABD", "ABCD"
  const cleanNoPunct = str.replace(/[^A-Za-z]/g, '').toUpperCase();
  if (
    cleanNoPunct.length >= 2 &&
    cleanNoPunct.length <= optionsCount &&
    /^[A-F]+$/.test(cleanNoPunct) &&
    !cleanNoPunct.includes('OPTION') &&
    !cleanNoPunct.includes('CHOICE')
  ) {
    for (let i = 0; i < cleanNoPunct.length; i++) {
      const idx = cleanNoPunct.charCodeAt(i) - 65;
      if (idx >= 0 && idx < optionsCount) indices.add(idx);
    }
    if (indices.size > 0) return Array.from(indices).sort((a, b) => a - b);
  }

  // Check concatenated digits: e.g. "12", "13", "23", "123"
  const digitsOnly = str.replace(/[^0-9]/g, '');
  if (
    digitsOnly.length >= 2 &&
    digitsOnly.length <= optionsCount &&
    !str.includes(',') &&
    !str.includes(';') &&
    !str.includes('/') &&
    !str.includes('&') &&
    !str.includes('-') &&
    !str.includes('.')
  ) {
    const allDigitsValid = digitsOnly.split('').every(d => {
      const n = parseInt(d, 10);
      return n >= 1 && n <= optionsCount;
    });
    if (allDigitsValid) {
      digitsOnly.split('').forEach(d => indices.add(parseInt(d, 10) - 1));
      return Array.from(indices).sort((a, b) => a - b);
    }
  }

  // Tokenize
  const tokens = cleanStr
    .split(/[,;\s]+/)
    .map(t => t.trim().replace(/[.:]$/, ''))
    .filter(Boolean);

  tokens.forEach(token => {
    // Single letter A-F: "A", "B", "C", "D", "E", "F"
    if (/^[A-F]$/i.test(token)) {
      const idx = token.toUpperCase().charCodeAt(0) - 65;
      if (idx >= 0 && idx < optionsCount) {
        indices.add(idx);
        return;
      }
    }

    // Concatenated letters in token: e.g. "AC"
    if (/^[A-F]{2,6}$/i.test(token)) {
      const upper = token.toUpperCase();
      for (let i = 0; i < upper.length; i++) {
        const idx = upper.charCodeAt(i) - 65;
        if (idx >= 0 && idx < optionsCount) indices.add(idx);
      }
      return;
    }

    // Option phrases: "Option A", "Choice B", "Opt 2", "Option 1"
    const optMatch = token.match(/(?:Option|Opt|Choice|Answer|Ans)\s*([A-F0-9]+)/i);
    if (optMatch) {
      const val = optMatch[1];
      if (/^[A-F]$/i.test(val)) {
        const idx = val.toUpperCase().charCodeAt(0) - 65;
        if (idx >= 0 && idx < optionsCount) {
          indices.add(idx);
          return;
        }
      } else {
        const num = parseInt(val, 10);
        if (!isNaN(num)) {
          if (num >= 1 && num <= optionsCount) indices.add(num - 1);
          else if (num === 0 && optionsCount > 0) indices.add(0);
          return;
        }
      }
    }

    // Decimal inside token: e.g. "1.2"
    if (/^\d+\.\d+$/.test(token)) {
      const parts = token.split('.');
      parts.forEach(p => {
        const n = parseInt(p, 10);
        if (!isNaN(n) && n >= 1 && n <= optionsCount) indices.add(n - 1);
      });
      return;
    }

    // Pure number token: 1, 2, 3, 4
    const numMatch = token.match(/\b([1-9]\d*)\b/);
    if (numMatch) {
      const num = parseInt(numMatch[1], 10);
      if (!isNaN(num) && num >= 1 && num <= optionsCount) {
        indices.add(num - 1);
        return;
      }
    }

    const directNum = parseInt(token, 10);
    if (!isNaN(directNum)) {
      if (directNum >= 1 && directNum <= optionsCount) {
        indices.add(directNum - 1);
      } else if (directNum === 0 && optionsCount > 0) {
        indices.add(0);
      }
    }
  });

  if (indices.size > 0) {
    return Array.from(indices).sort((a, b) => a - b);
  }

  // Fallback to first option if nothing matched
  return [0];
}

/**
 * Normalizes correct answers from any question object into an array of 0-based integer indices.
 * Inspects all possible field names used across Excel imports, databases, and APIs.
 * Automatically self-heals stale objects where correctAnswers was saved with 1 answer
 * but rawCorrectAnswer / originalCorrectAnswer contains multi-select values (e.g. "1,2").
 * 
 * @param {object} q Question object
 * @returns {number[]} 0-based indices of correct options (e.g. [0, 1])
 */
export function normalizeCorrectAnswers(q) {
  if (!q) return [0];

  const options = Array.isArray(q.options) ? q.options : [];

  const candidateKeys = [
    'rawCorrectAnswer',
    'originalCorrectAnswer',
    'Correct Answer',
    'Correct Answers',
    'Correct Option',
    'Correct Options',
    'correctAnswers',
    'correctAnswer',
    'correct_answers',
    'correct_answer',
    'answer',
    'answers',
    'key',
    'rightAnswer',
    'Right Answer',
    'Answer Key',
    'Solution',
    'Solution 1',
    'Solution 2',
    'ans',
    'ans1',
    'ans2'
  ];

  let bestParsed = [];

  for (const k of candidateKeys) {
    if (q[k] !== undefined && q[k] !== null && q[k] !== '') {
      const parsed = parseCorrectAnswers(q[k], options);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // If this candidate gives multiple answers, it takes precedence!
        if (parsed.length > bestParsed.length) {
          bestParsed = parsed;
        }
        if (bestParsed.length === 0) {
          bestParsed = parsed;
        }
      }
    }
  }

  return bestParsed.length > 0 ? bestParsed : [0];
}

/**
 * Determines whether a question is a Multi-select question (requiring selecting more than 1 option).
 * Evaluates:
 * 1. Normalized correct answers count (> 1)
 * 2. Explicit questionType or type field (Multi-select, MSQ, Checkbox, Multiple Response)
 * 3. Question prompt text containing phrases like "(Choose two)", "(Select THREE)", etc.
 * 
 * @param {object} q Question object
 * @returns {boolean} True if multi-select, false if single choice
 */
export function isMultiSelectQuestion(q) {
  if (!q) return false;

  // 1. If it has multiple correct answers, it MUST be multi-select
  const correct = normalizeCorrectAnswers(q);
  if (correct.length > 1) {
    return true;
  }

  // 2. Check explicit questionType field
  const qType = String(
    q.questionType ||
    q.type ||
    q['Question Type'] ||
    q['Question_Type'] ||
    q['Type'] ||
    q['Select Type'] ||
    ''
  ).toLowerCase().trim();

  if (qType) {
    const isExplicitSingle = /^(?:single|one\b|radio|single[\s_-]*choice|multi[\s_-]*choice$)/i.test(qType);
    if (!isExplicitSingle) {
      if (
        /select|msq|mrq|multiple[\s_-]*select|multiple[\s_-]*response|multi[\s_-]*select|checkbox|choose/i.test(qType)
      ) {
        return true;
      }
    }
  }

  // 3. Inspect question text for common multi-select indicators (Udemy / AWS / Azure / CompTIA / Google standard)
  const qText = String(q.question || q.questionText || q.prompt || q['Question'] || '');
  if (qText) {
    const multiPatterns = [
      /\((?:choose|select)\s*(?:two|three|four|five|2|3|4|5|all)[^\)]*\)/i,
      /\[(?:choose|select)\s*(?:two|three|four|five|2|3|4|5|all)[^\]]*\]/i,
      /\b(?:choose|select)\s*(?:two|three|four|five|2|3|4|5|all)\b/i,
      /\bwhich\s*(?:two|three|four|2|3|4)\b/i,
      /\bwhich\s*of\s*the\s*following\s*(?:two|three|four|2|3|4)\b/i,
      /\b(?:two|three|four)\s*of\s*the\s*following\b/i,
      /\bselect\s*all\s*that\s*apply\b/i,
      /\bchoose\s*all\s*that\s*apply\b/i,
      /\ball\s*that\s*apply\b/i
    ];

    if (multiPatterns.some(p => p.test(qText))) {
      return true;
    }
  }

  return false;
}

/**
 * Extracts the comprehensive answer explanation from a question object.
 * Checks all possible field names from Excel imports, databases, and APIs.
 * 
 * @param {object} q Question object
 * @returns {string} The formatted explanation text
 */
export function getQuestionExplanation(q) {
  if (!q) {
    return 'Refer to official certification vendor documentation for detailed architecture and exam objectives.';
  }

  const candidate =
    q.overallExplanation ||
    q.explanation ||
    q.overall_explanation ||
    q.answerExplanation ||
    q.answer_explanation ||
    q.rationale ||
    q.solution ||
    q.feedback ||
    q.description ||
    q.notes ||
    q.why ||
    q.Explanation ||
    q.OverallExplanation ||
    q.AnswerExplanation ||
    q.Rationale ||
    q.Solution ||
    q['Overall Explanation'] ||
    q['Explanation'] ||
    q['Answer Explanation'] ||
    q['Rationale'] ||
    q['Solution'];

  if (candidate && String(candidate).trim().length > 0) {
    return String(candidate).trim();
  }

  // Fallback to option-by-option explanations if available
  const optExps = q.optionExplanations || q.option_explanations || q['Option Explanations'];
  if (Array.isArray(optExps) && optExps.some(e => e && String(e).trim().length > 0)) {
    return optExps
      .map((exp, i) => (exp && String(exp).trim() ? `Option ${String.fromCharCode(65 + i)}: ${String(exp).trim()}` : null))
      .filter(Boolean)
      .join('\n\n');
  }

  return 'Refer to official certification vendor documentation for detailed architecture and exam objectives.';
}

/**
 * Returns option-by-option explanations array if available.
 * 
 * @param {object} q Question object
 * @returns {string[]}
 */
export function getOptionExplanations(q) {
  if (!q) return [];
  const raw = q.optionExplanations || q.option_explanations || q['Option Explanations'];
  if (Array.isArray(raw)) return raw.map(e => String(e || '').trim());
  return [];
}

/**
 * Formats option indices as letters: [0, 1] -> ["A", "B"]
 * 
 * @param {number[]} indices
 * @returns {string[]}
 */
export function formatAnswerLetters(indices = []) {
  if (!Array.isArray(indices) || indices.length === 0) return ['A'];
  return indices.map(idx => String.fromCharCode(65 + Math.max(0, parseInt(idx, 10) || 0)));
}

/**
 * Formats option indices as numbers: [0, 1] -> ["1", "2"]
 * 
 * @param {number[]} indices
 * @returns {string[]}
 */
export function formatAnswerNumbers(indices = []) {
  if (!Array.isArray(indices) || indices.length === 0) return ['1'];
  return indices.map(idx => String(Math.max(0, parseInt(idx, 10) || 0) + 1));
}

/**
 * Formats full dual letter/number answer string:
 * e.g. [0, 1] -> "Option A, Option B (A, B / 1, 2)"
 * 
 * @param {number[]} indices
 * @returns {string}
 */
export function formatAnswerDisplay(indices = []) {
  const letters = formatAnswerLetters(indices);
  const numbers = formatAnswerNumbers(indices);
  const letterLabels = letters.map(l => `Option ${l}`).join(', ');
  return `${letterLabels} (${letters.join(', ')} / Choices ${numbers.join(', ')})`;
}
