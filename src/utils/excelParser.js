import * as XLSX from 'xlsx';
import {
  parseCorrectAnswers,
  normalizeCorrectAnswers,
  isMultiSelectQuestion,
  getQuestionExplanation,
  getOptionExplanations,
  formatAnswerLetters,
  formatAnswerNumbers,
  formatAnswerDisplay
} from './questionUtils.js';

export {
  parseCorrectAnswers,
  normalizeCorrectAnswers,
  isMultiSelectQuestion,
  getQuestionExplanation,
  getOptionExplanations,
  formatAnswerLetters,
  formatAnswerNumbers,
  formatAnswerDisplay
};

/**
 * Universal Parser for Excel (.xlsx, .xls) and CSV files.
 * Intelligently recognizes:
 * 1. Multi-select (MSQ) questions with multiple correct options:
 *    - Option text matching: "Amazon CloudFront, AWS Direct Connect", "CloudFront\nDirect Connect", etc.
 *    - "1,2", "1, 2", "1;2", "1/2", "1-2", "1 and 2", "1 & 2", "1 2"
 *    - "A, B", "A, C", "AB", "AC", "ABD", "12", "13", "14"
 *    - Multiple separate answer columns: "Answer 1", "Answer 2", "Correct 1", "Correct 2", etc.
 *    - Per-option boolean/flag columns: "Option 1 Correct", "Is Correct A", "Correct 1", etc.
 *    - Excel decimal numbers (e.g. 1.2 or 12 from unquoted/locale cells)
 *    - Excel Date conversions (e.g. "1-Feb" from typing "1-2" in Excel)
 * 2. Unquoted CSV shift auto-recovery
 * 3. ITPT Standard Multi-explanation format (Option A..F, Explanation A..F, Overall Explanation)
 * 4. Flexible column headers: handles "Explanation", "Answer Explanation", "Rationale", "Solution", etc.
 * 5. Single-letter column headers: "A", "B", "C", "D" or "Opt A", "Option 1"
 * 6. Shifted or headless spreadsheets with automatic structure recovery
 *
 * @param {File} file
 * @returns {Promise<{ questions: Array, rawCount: number, error?: string, cappedNotice?: string }>}
 */
export async function parseExcelOrCsvFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          resolve({ questions: [], rawCount: 0, error: 'The uploaded spreadsheet contains no sheets.' });
          return;
        }

        // Read first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to matrix of rows using both raw: false (for formatted text) and raw: true (for unrounded decimals/dates/floats)
        const matrix = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false });
        const matrixRaw = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: true });

        if (!matrix || matrix.length < 2) {
          resolve({ questions: [], rawCount: 0, error: 'The uploaded file is empty or does not contain question rows.' });
          return;
        }

        // Find actual header row (in case row 0 is blank or has a title banner)
        let headerRowIdx = 0;
        for (let i = 0; i < Math.min(6, matrix.length); i++) {
          const rowStrings = (matrix[i] || []).map(cell => String(cell || '').toLowerCase().trim());
          const hasKeyHeader = rowStrings.some(s =>
            s.includes('question') ||
            s.includes('prompt') ||
            s.includes('option') ||
            s.includes('choice') ||
            s.includes('answer')
          );
          if (hasKeyHeader) {
            headerRowIdx = i;
            break;
          }
        }

        const rawHeader = (matrix[headerRowIdx] || []).map(h => String(h || '').trim());
        // Clean header by removing all non-alphanumeric characters for bulletproof matching
        const headerClean = rawHeader.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

        // Check if header is shifted: e.g. Column 0 is labeled 'Option A', but row 1 cell 0 is question text
        const isShiftedHeader = headerClean[0] &&
          (headerClean[0] === 'optiona' || headerClean[0] === 'answeroption1' || headerClean[0] === 'choicea') &&
          matrix.slice(headerRowIdx + 1, headerRowIdx + 10).some(r => r[0] && (String(r[0]).includes('?') || String(r[0]).length > 25));

        const questions = [];
        const optLetters = ['a', 'b', 'c', 'd', 'e', 'f'];

        // Determine whether spreadsheet uses dedicated option headers (e.g. Option A, Option 1, Choice 1)
        const hasDedicatedOptionHeaders = headerClean.some(h =>
          h.startsWith('option') || h.startsWith('choice') || h.startsWith('opt') || h.startsWith('answeroption')
        );

        for (let r = headerRowIdx + 1; r < matrix.length; r++) {
          const row = matrix[r];
          const rowRaw = (matrixRaw && matrixRaw[r]) ? matrixRaw[r] : [];
          if (!row || row.length === 0 || !row.some(cell => String(cell || '').trim() !== '')) {
            continue; // Skip blank rows
          }

          let qText = '';
          const options = [];
          const optionExplanations = [];
          let correctRaw = '';
          let explanation = '';
          let domain = 'General Exam Objectives';
          let parsedTestNumber = 1;
          let explicitType = '';
          let hasExplicitTestNumber = false;

          if (isShiftedHeader) {
            // Shifted structure fallback:
            // Col 0: Question text
            // Last non-empty cell: Explanation
            // Second to last non-empty cell: Correct Answer
            // Cells in between: Options
            const cleanCells = row
              .map(c => (c !== undefined && c !== null ? String(c).trim() : ''))
              .filter((c, idx) => c !== '' || idx < row.length - 2);

            if (cleanCells.length >= 4) {
              qText = cleanCells[0];
              explanation = cleanCells[cleanCells.length - 1] || '';
              correctRaw = cleanCells[cleanCells.length - 2];
              for (let i = 1; i < cleanCells.length - 2; i++) {
                if (cleanCells[i]) options.push(cleanCells[i]);
              }
            }
          } else {
            // Standard column matching with prioritized exact match then fuzzy lookup
            const getVal = (patterns, excludePatterns = []) => {
              const cleanPatterns = patterns.map(p => p.toLowerCase().replace(/[^a-z0-9]/g, ''));
              const cleanExcludes = excludePatterns.map(p => p.toLowerCase().replace(/[^a-z0-9]/g, ''));

              // 1. Try exact match first
              const exactIdx = headerClean.findIndex(hc =>
                !cleanExcludes.some(ex => hc.includes(ex)) &&
                cleanPatterns.some(p => hc === p)
              );
              if (exactIdx >= 0 && row[exactIdx] !== undefined) {
                if (rowRaw && rowRaw[exactIdx] !== undefined) {
                  const val = rowRaw[exactIdx];
                  if (val instanceof Date) return val;
                  if (typeof val === 'number') {
                    if (!Number.isInteger(val) || (val > 6 && String(row[exactIdx]).trim().length === 1)) {
                      return val;
                    }
                  }
                }
                return String(row[exactIdx]).trim();
              }

              // 2. Try prefix or substring match
              const subIdx = headerClean.findIndex(hc =>
                !cleanExcludes.some(ex => hc.includes(ex)) &&
                cleanPatterns.some(p => hc.startsWith(p) || hc.includes(p))
              );
              if (subIdx >= 0 && row[subIdx] !== undefined) {
                if (rowRaw && rowRaw[subIdx] !== undefined) {
                  const val = rowRaw[subIdx];
                  if (val instanceof Date) return val;
                  if (typeof val === 'number') {
                    if (!Number.isInteger(val) || (val > 6 && String(row[subIdx]).trim().length === 1)) {
                      return val;
                    }
                  }
                }
                return String(row[subIdx]).trim();
              }
              return '';
            };

            qText = getVal(['question', 'questiontext', 'questions', 'prompt', 'problem', 'item', 'query', 'title']);
            if (!qText && row[0] && String(row[0]).trim().length > 15) {
              qText = String(row[0]).trim();
            }

            // Extract Answer Options 1..6 or A..F
            for (let i = 1; i <= 6; i++) {
              const letter = optLetters[i - 1];
              const optVal = getVal(
                [
                  `answeroption${i}`, `option${i}`, `choice${i}`, `opt${i}`,
                  `answeroption${letter}`, `option${letter}`, `choice${letter}`, `opt${letter}`,
                  ...(!hasDedicatedOptionHeaders ? [`answer${i}`, `answer${letter}`, letter] : [])
                ],
                ['explanation', 'rationale', 'solution', 'feedback', 'reason', 'correct', 'why', 'note']
              );

              const expVal = getVal([
                `explanation${i}`, `explanation${letter}`, `optionexplanation${i}`, `optionexplanation${letter}`,
                `exp${letter}`, `exp${i}`, `reason${letter}`, `rationale${letter}`
              ]);

              if (optVal) {
                options.push(optVal);
                optionExplanations.push(expVal);
              }
            }

            // If options weren't found by named columns, inspect adjacent cells
            if (options.length < 2 && row.length >= 4) {
              for (let i = 1; i < Math.min(row.length, 7); i++) {
                const cell = String(row[i] || '').trim();
                if (cell && cell.length > 0 && !cell.match(/^\d+$/)) {
                  options.push(cell);
                }
              }
            }

            // Check per-option boolean columns: e.g. "Option 1 Correct", "Is Correct A", "Correct 1" (when options exist)
            const perOptionCorrectIndices = [];
            for (let i = 1; i <= Math.max(options.length, 4); i++) {
              const letter = optLetters[i - 1];
              const isCorrectVal = getVal([
                `option${i}correct`, `option${letter}correct`,
                `iscorrect${i}`, `iscorrect${letter}`,
                `correct${i}`, `correct${letter}`,
                `choice${i}correct`, `choice${letter}correct`
              ], ['explanation', 'text']);

              if (isCorrectVal) {
                const lower = String(isCorrectVal).toLowerCase().trim();
                if (['true', 'yes', 'y', '1', 'correct', 'x', '✓'].includes(lower)) {
                  perOptionCorrectIndices.push(i - 1);
                }
              }
            }

            const answerColVals = [];
            if (perOptionCorrectIndices.length > 0) {
              correctRaw = perOptionCorrectIndices.map(idx => String(idx + 1)).join(', ');
            } else {
              // Collect all answer columns (including Answer 1, Answer 2 or multiple Correct columns)
              headerClean.forEach((hc, colIdx) => {
                if (
                  hc.includes('explanation') || hc.includes('rationale') || hc.includes('solution') ||
                  hc.includes('feedback') || hc.includes('reason') || hc.includes('note') || hc.includes('desc')
                ) return;

                // Skip option columns unless explicitly marked as correct
                if (hc.startsWith('option') || hc.startsWith('choice') || hc.startsWith('answeroption')) {
                  if (!hc.includes('correct')) return;
                }

                const isAnswerCol =
                  hc === 'correctanswers' || hc === 'correctanswer' ||
                  hc === 'correctoptions' || hc === 'correctoption' ||
                  hc === 'correctchoices' || hc === 'correctchoice' ||
                  hc === 'rightanswers'   || hc === 'rightanswer' ||
                  hc === 'answers'        || hc === 'answer' ||
                  hc === 'correct'        || hc === 'key' || hc === 'ans' ||
                  hc.startsWith('correctanswer') || hc.startsWith('correctoption') ||
                  hc.startsWith('correctchoice') || hc.startsWith('rightanswer') ||
                  (hasDedicatedOptionHeaders && (hc.startsWith('answer') || hc.startsWith('ans') || hc.startsWith('correct')));

                if (isAnswerCol) {
                  const val = (rowRaw && rowRaw[colIdx] !== undefined) ? rowRaw[colIdx] : row[colIdx];
                  if (val !== undefined && val !== null && String(val).trim() !== '') {
                    answerColVals.push(val);
                  }
                }
              });

              if (answerColVals.length > 1) {
                // Multiple answer columns found (e.g. Answer 1 = A, Answer 2 = B)
                correctRaw = answerColVals
                  .map(v => (v instanceof Date ? `${v.getDate()}-${v.getMonth() + 1}` : String(v).trim()))
                  .join(', ');
              } else if (answerColVals.length === 1) {
                correctRaw = answerColVals[0];
              } else {
                correctRaw = getVal([
                  'correctanswers', 'correctanswer', 'correctoptions', 'correctoption',
                  'correctchoices', 'correctchoice', 'answers', 'answer', 'key', 'rightanswer', 'ans', 'correct'
                ], ['explanation', 'rationale', 'solution', 'feedback', 'reason', 'note', 'why']);
              }
            }

            // Extract Explanation — prioritize overall/answer explanation
            explanation = getVal([
              'overallexplanation', 'answerexplanation', 'correctanswerexplanation', 'detailedexplanation',
              'explanation', 'rationale', 'solution', 'feedback', 'reason', 'notes', 'why',
              'clarification', 'justification', 'exp'
            ]);

            // Unquoted CSV Comma-Shift Recovery (only when answer column is strictly matched)
            const strictCorrectIdx = headerClean.findIndex(hc =>
              !hc.includes('explanation') && !hc.includes('rationale') && !hc.includes('option') &&
              ['correctanswers', 'correctanswer', 'correctoptions', 'correctoption'].includes(hc)
            );

            if (strictCorrectIdx >= 0 && answerColVals.length <= 1) {
              const answerTokens = [String(correctRaw || '')];
              let nextIdx = strictCorrectIdx + 1;
              while (nextIdx < row.length) {
                const nextVal = String(row[nextIdx] || '').trim();
                if (nextVal && nextVal.length <= 6 && (/^[A-F0-9,\s\.\(\)\[\]\-]+$/i.test(nextVal) || /^(?:Option|Choice|Opt)\s*[A-F0-9]+/i.test(nextVal))) {
                  answerTokens.push(nextVal);
                  nextIdx++;
                } else {
                  break;
                }
              }

              if (answerTokens.length > 1) {
                correctRaw = answerTokens.join(', ');
              }

              if (!explanation || explanation.length <= 4 || /^\d+$/.test(explanation)) {
                for (let k = nextIdx; k < row.length; k++) {
                  const val = String(row[k] || '').trim();
                  if (val && val.length > 10 && !options.includes(val) && val !== qText) {
                    explanation = val;
                    break;
                  }
                }
              }
            }

            if (!explanation && row.length >= 4) {
              const lastCell = String(row[row.length - 1] || '').trim();
              if (lastCell && lastCell.length > 25 && !options.includes(lastCell) && lastCell !== qText) {
                explanation = lastCell;
              }
            }

            domain = getVal(['domain', 'topic', 'subject', 'category', 'module', 'section', 'chapter']) || 'General Exam Objectives';

            const rawTestNum = getVal(['practicetest', 'testnumber', 'testno', 'test', 'exam', 'paper']);
            if (rawTestNum) {
              const match = String(rawTestNum).match(/\d+/);
              if (match) {
                const num = parseInt(match[0], 10);
                if (num >= 1 && num <= 6) {
                  parsedTestNumber = num;
                  hasExplicitTestNumber = true;
                }
              }
            }

            explicitType = getVal([
              'questiontype', 'type', 'qtype', 'answertype', 'selecttype', 'kind', 'typeofquestion', 'questionformat'
            ]);
          }

          if (!qText || options.length < 2) {
            continue; // Must have question text and at least 2 options
          }

          // Parse correct answers using universal parser
          const correctAnswers = parseCorrectAnswers(correctRaw, options);

          // Detect Question Type (MSQ vs MCQ)
          const isMulti = isMultiSelectQuestion({
            question: qText,
            questionType: explicitType,
            type: explicitType,
            correctAnswers
          });

          const finalType = isMulti ? 'multiple' : 'single';
          const typeLabel = isMulti ? 'Multi-select' : 'Multi-choice';

          // Combine explanation if overall explanation is empty but option explanations are provided
          let combinedExplanation = explanation;
          if (!combinedExplanation && optionExplanations.some(Boolean)) {
            combinedExplanation = optionExplanations
              .map((exp, i) => (exp ? `Option ${String.fromCharCode(65 + i)}: ${exp}` : null))
              .filter(Boolean)
              .join(' ');
          }

          const defaultFallbackExplanation = 'Refer to official vendor documentation for detailed architecture and exam objectives.';
          const finalExplanation = combinedExplanation || defaultFallbackExplanation;

          questions.push({
            id: `imported-q-${r}-${Date.now().toString().slice(-4)}`,
            testNumber: parsedTestNumber,
            hasExplicitTestNumber,
            question: qText,
            type: finalType,
            questionType: typeLabel,
            options,
            optionExplanations: optionExplanations.length > 0 ? optionExplanations : options.map(() => ''),
            correctAnswers,
            originalCorrectAnswer: String(correctRaw ?? ''),
            rawCorrectAnswer: String(correctRaw ?? ''),
            explanation: finalExplanation,
            overallExplanation: finalExplanation,
            domain: domain || 'General Exam Objectives',
            reference: 'https://itpracticetests.com'
          });
        }

        if (questions.length === 0) {
          resolve({
            questions: [],
            rawCount: matrix.length - 1,
            error: 'No valid questions could be extracted. Please ensure each row has question text, at least two options (e.g. Option A, Option B), and a Correct Answer.'
          });
          return;
        }

        // Enforce Udemy Standard: Maximum 250 questions per practice test
        let cappedAt250 = false;
        const questionsByTest = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

        questions.forEach(q => {
          const tNum = q.testNumber || 1;
          if (questionsByTest[tNum].length < 250) {
            questionsByTest[tNum].push(q);
          } else {
            cappedAt250 = true;
          }
        });

        // Flatten valid questions capped at 250 per test
        const validQuestions = [];
        Object.keys(questionsByTest).forEach(tNum => {
          validQuestions.push(...questionsByTest[tNum]);
        });

        resolve({
          questions: validQuestions,
          questionsByTest,
          rawCount: matrix.length - (headerRowIdx + 1),
          cappedAt250,
          cappedNotice: cappedAt250
            ? 'Note: Practice tests are capped at 250 questions per test in accordance with Udemy standards.'
            : null
        });
      } catch (err) {
        console.error('Error parsing spreadsheet:', err);
        resolve({ questions: [], rawCount: 0, error: `Failed to parse file: ${err.message}` });
      }
    };

    reader.onerror = () => {
      resolve({ questions: [], rawCount: 0, error: 'Could not read the uploaded spreadsheet file.' });
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generate a pre-formatted Excel template matching the official specification:
 * Supports both standard 4-choice columns and multi-explanation headers with multi-select examples.
 */
export function downloadSampleExcelTemplate() {
  const sampleData = [
    {
      'Practice Test': '1',
      'Question': 'Which AWS service provides low-latency content delivery and caching at global edge locations?',
      'Question Type': 'Multi-choice',
      'Option A': 'Amazon CloudFront',
      'Explanation A': 'CloudFront is a global CDN that caches data at hundreds of edge locations.',
      'Option B': 'AWS Direct Connect',
      'Explanation B': 'Direct Connect provides dedicated private network connections, not edge caching.',
      'Option C': 'Amazon Route 53',
      'Explanation C': 'Route 53 is a DNS service, not a static file cache.',
      'Option D': 'AWS Transit Gateway',
      'Explanation D': 'Transit Gateway interconnects VPCs and on-premises networks.',
      'Correct Answer': 'A',
      'Overall Explanation': 'Amazon CloudFront delivers static and dynamic web content with low latency via edge points of presence (PoPs).',
      'Domain': 'Domain 1: Design Resilient Architectures'
    },
    {
      'Practice Test': '1',
      'Question': 'An enterprise requires encryption at rest for Amazon S3 objects. Keys must be rotated annually by compliance teams with every key use recorded. Which TWO configurations satisfy these requirements? (Choose TWO)',
      'Question Type': 'Multi-select',
      'Option A': 'Use Server-Side Encryption with Customer Managed Keys in AWS KMS (SSE-KMS)',
      'Explanation A': 'Customer Managed Keys in KMS allow compliance-mandated key rotation and access policies.',
      'Option B': 'Use Server-Side Encryption with Amazon S3-Managed Keys (SSE-S3)',
      'Explanation B': 'SSE-S3 keys are fully managed by AWS without customer rotation control.',
      'Option C': 'Enable AWS CloudTrail to log all AWS KMS cryptographic API events',
      'Explanation C': 'CloudTrail captures all Decrypt and GenerateDataKey API calls for audit compliance.',
      'Option D': 'Enable S3 Versioning without lifecycle rules',
      'Explanation D': 'Versioning preserves object history but does not govern encryption rotation or key logging.',
      'Correct Answer': '1, 2',
      'Overall Explanation': 'Combining SSE-KMS with Customer Managed Keys and AWS CloudTrail guarantees cryptographic control, key rotation policies, and a comprehensive audit trail of key access.',
      'Domain': 'Domain 2: Design Secure Architectures'
    },
    {
      'Practice Test': '2',
      'Question': 'In Kubernetes, which controller ensures that a specified number of identical pod replicas are running across worker nodes at all times?',
      'Question Type': 'Multi-choice',
      'Option A': 'Deployment / ReplicaSet',
      'Explanation A': 'ReplicaSets maintain a stable set of replica Pods running at any given time.',
      'Option B': 'ConfigMap',
      'Explanation B': 'ConfigMaps store non-confidential key-value configuration data.',
      'Option C': 'Ingress Controller',
      'Explanation C': 'Ingress manages external HTTP/S routing to services within the cluster.',
      'Option D': 'NetworkPolicy',
      'Explanation D': 'NetworkPolicy specifies how groups of pods are allowed to communicate.',
      'Correct Answer': '1',
      'Overall Explanation': 'A Deployment controller provides declarative updates for Pods and ReplicaSets, continuously monitoring and self-healing pods to maintain the desired replica count.',
      'Domain': 'Domain 3: Workloads & Scheduling'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ITPT_Practice_Tests');

  XLSX.writeFile(workbook, 'ITPracticeTests_Questions_Format_Template.xlsx');
}
