import * as XLSX from 'xlsx';

/**
 * Expected columns format:
 * Question,Question Type,Answer Option 1,Explanation 1,Answer Option 2,Explanation 2,Answer Option 3,Explanation 3,Answer Option 4,Explanation 4,Answer Option 5,Explanation 5,Answer Option 6,Explanation 6,Correct Answers,Overall Explanation,Domain
 */

export function parseCorrectAnswers(rawVal, optionsCount) {
  if (rawVal === undefined || rawVal === null) return [0];

  const str = String(rawVal).trim();
  // Split on commas, semicolons, slashes, or whitespace
  const tokens = str.split(/[,;\/\s]+/).map(t => t.trim()).filter(Boolean);
  const indices = [];

  tokens.forEach(token => {
    // Check for letter (A, B, C, D, E, F)
    const letterMatch = token.match(/^[A-F]$/i);
    if (letterMatch) {
      const idx = letterMatch[0].toUpperCase().charCodeAt(0) - 65;
      if (idx >= 0 && idx < optionsCount) {
        indices.push(idx);
        return;
      }
    }

    // Check for "Option 1", "Option A", "Opt 2"
    const optMatch = token.match(/(?:Option|Opt)\s*([A-F0-9]+)/i);
    if (optMatch) {
      const sub = optMatch[1];
      if (/^[A-F]$/i.test(sub)) {
        const idx = sub.toUpperCase().charCodeAt(0) - 65;
        if (idx >= 0 && idx < optionsCount) {
          indices.push(idx);
          return;
        }
      } else {
        const num = parseInt(sub);
        if (!isNaN(num) && num >= 1 && num <= optionsCount) {
          indices.push(num - 1);
          return;
        }
      }
    }

    // Check for 1-based number (1, 2, 3, 4, 5, 6)
    const num = parseInt(token);
    if (!isNaN(num) && num >= 1 && num <= optionsCount) {
      indices.push(num - 1);
    }
  });

  return indices.length > 0 ? Array.from(new Set(indices)) : [0];
}

/**
 * Parse an Excel file (.xlsx, .xls) or CSV file
 * @param {File} file
 * @returns {Promise<{ questions: Array, rawCount: number, error?: string }>}
 */
export async function parseExcelOrCsvFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Read first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON array of objects
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          resolve({ questions: [], rawCount: 0, error: 'The uploaded file contains no rows or is empty.' });
          return;
        }

        const questions = [];

        rawRows.forEach((row, idx) => {
          // Normalize column names by trimming and case-insensitive lookup
          const getCol = (namePattern) => {
            const key = Object.keys(row).find(k =>
              k.trim().toLowerCase().replace(/[\s_-]+/g, '') === namePattern.toLowerCase().replace(/[\s_-]+/g, '')
            );
            return key ? row[key] : '';
          };

          const questionText = getCol('Question') || row['Question'] || '';
          if (!String(questionText).trim()) return; // skip empty rows

          // Optional Practice Test number (1 to 6, max 6 tests)
          const rawTestNum = getCol('Practice Test') || getCol('Test Number') || row['Practice Test'] || row['Test Number'] || '';
          let parsedTestNumber = 1;
          if (rawTestNum) {
            const match = String(rawTestNum).match(/\d+/);
            if (match) {
              const num = parseInt(match[0]);
              if (num >= 1 && num <= 6) parsedTestNumber = num;
            }
          }

          const rawType = String(getCol('Question Type') || row['Question Type'] || '').trim();
          const isMultiSelect = /select/i.test(rawType) || /msq/i.test(rawType) || /multiple[\s_-]*select/i.test(rawType);

          // Collect options and per-option explanations
          const options = [];
          const optionExplanations = [];

          for (let optNum = 1; optNum <= 6; optNum++) {
            const optVal = getCol(`Answer Option ${optNum}`) || row[`Answer Option ${optNum}`] || '';
            const expVal = getCol(`Explanation ${optNum}`) || row[`Explanation ${optNum}`] || '';

            if (String(optVal).trim()) {
              options.push(String(optVal).trim());
              optionExplanations.push(String(expVal).trim());
            }
          }

          if (options.length < 2) {
            // Need at least 2 options
            return;
          }

          const rawCorrect = getCol('Correct Answers') || row['Correct Answers'] || '';
          const correctAnswers = parseCorrectAnswers(rawCorrect, options.length);

          const overallExplanation = String(getCol('Overall Explanation') || row['Overall Explanation'] || '').trim();
          const domain = String(getCol('Domain') || row['Domain'] || 'General Exam Objectives').trim();

          // Type definition
          const finalType = isMultiSelect ? 'multiple' : 'single';
          const typeLabel = isMultiSelect ? 'Multi-select' : 'Multi-choice';

          // Combine explanation if overall explanation is empty
          let combinedExplanation = overallExplanation;
          if (!combinedExplanation && optionExplanations.some(Boolean)) {
            combinedExplanation = optionExplanations
              .map((exp, i) => exp ? `Option ${String.fromCharCode(65 + i)}: ${exp}` : null)
              .filter(Boolean)
              .join(' ');
          }

          questions.push({
            id: `imported-q-${idx + 1}-${Date.now().toString().slice(-4)}`,
            testNumber: parsedTestNumber,
            question: String(questionText).trim(),
            type: finalType, // 'multiple' or 'single'
            questionType: typeLabel, // 'Multi-select' or 'Multi-choice'
            options,
            optionExplanations,
            correctAnswers,
            explanation: combinedExplanation || 'Review the correct choices and official vendor architectural guidance.',
            overallExplanation,
            domain: domain || 'General Exam Objectives',
            reference: 'https://itpracticetests.com'
          });
        });

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
          rawCount: rawRows.length,
          cappedAt250,
          cappedNotice: cappedAt250
            ? 'Note: Practice tests on Udemy are limited to a maximum of 250 questions per test. Questions exceeding 250 were safely capped.'
            : null
        });
      } catch (err) {
        console.error('Error parsing spreadsheet:', err);
        resolve({ questions: [], rawCount: 0, error: `Failed to parse file: ${err.message}` });
      }
    };

    reader.onerror = (err) => {
      resolve({ questions: [], rawCount: 0, error: 'Could not read file.' });
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generate a pre-formatted Excel template matching the user's specification with optional Practice Test column (1-6):
 * Practice Test,Question,Question Type,Answer Option 1,Explanation 1,Answer Option 2,Explanation 2,Answer Option 3,Explanation 3,Answer Option 4,Explanation 4,Answer Option 5,Explanation 5,Answer Option 6,Explanation 6,Correct Answers,Overall Explanation,Domain
 */
export function downloadSampleExcelTemplate() {
  const sampleData = [
    {
      'Practice Test': '1',
      'Question': 'Which AWS service provides low-latency content delivery and caching at global edge locations?',
      'Question Type': 'Multi-choice',
      'Answer Option 1': 'Amazon CloudFront',
      'Explanation 1': 'CloudFront is a global CDN that caches data at hundreds of edge locations.',
      'Answer Option 2': 'AWS Direct Connect',
      'Explanation 2': 'Direct Connect provides dedicated private network connections, not edge caching.',
      'Answer Option 3': 'Amazon Route 53',
      'Explanation 3': 'Route 53 is a DNS service, not a static file cache.',
      'Answer Option 4': 'AWS Transit Gateway',
      'Explanation 4': 'Transit Gateway interconnects VPCs and on-premises networks.',
      'Answer Option 5': '',
      'Explanation 5': '',
      'Answer Option 6': '',
      'Explanation 6': '',
      'Correct Answers': '1',
      'Overall Explanation': 'Amazon CloudFront delivers static and dynamic web content with low latency via edge points of presence (PoPs).',
      'Domain': 'Domain 1: Design Resilient Architectures'
    },
    {
      'Practice Test': '1',
      'Question': 'An enterprise requires encryption at rest for Amazon S3 objects. Keys must be rotated annually by compliance teams with every key use recorded. Which TWO configurations satisfy these requirements? (Choose TWO)',
      'Question Type': 'Multi-select',
      'Answer Option 1': 'Use Server-Side Encryption with Customer Managed Keys in AWS KMS (SSE-KMS)',
      'Explanation 1': 'Customer Managed Keys in KMS allow compliance-mandated key rotation and access policies.',
      'Answer Option 2': 'Use Server-Side Encryption with Amazon S3-Managed Keys (SSE-S3)',
      'Explanation 2': 'SSE-S3 keys are fully managed by AWS without customer rotation control.',
      'Answer Option 3': 'Enable AWS CloudTrail to log all AWS KMS cryptographic API events',
      'Explanation 3': 'CloudTrail captures all Decrypt and GenerateDataKey API calls for audit compliance.',
      'Answer Option 4': 'Enable S3 Versioning without lifecycle rules',
      'Explanation 4': 'Versioning preserves object history but does not govern encryption rotation or key logging.',
      'Answer Option 5': 'Use Client-Side plaintext hashing',
      'Explanation 5': 'Hashing does not provide reversible encryption at rest.',
      'Answer Option 6': '',
      'Explanation 6': '',
      'Correct Answers': '1, 3',
      'Overall Explanation': 'Combining SSE-KMS with Customer Managed Keys and AWS CloudTrail guarantees cryptographic control, key rotation policies, and a comprehensive audit trail of key access.',
      'Domain': 'Domain 2: Design Secure Architectures'
    },
    {
      'Practice Test': '2',
      'Question': 'In Kubernetes, which controller ensures that a specified number of identical pod replicas are running across worker nodes at all times?',
      'Question Type': 'Multi-choice',
      'Answer Option 1': 'Deployment / ReplicaSet',
      'Explanation 1': 'ReplicaSets maintain a stable set of replica Pods running at any given time.',
      'Answer Option 2': 'ConfigMap',
      'Explanation 2': 'ConfigMaps store non-confidential key-value configuration data.',
      'Answer Option 3': 'Ingress Controller',
      'Explanation 3': 'Ingress manages external HTTP/S routing to services within the cluster.',
      'Answer Option 4': 'NetworkPolicy',
      'Explanation 4': 'NetworkPolicy specifies how groups of pods are allowed to communicate.',
      'Answer Option 5': '',
      'Explanation 5': '',
      'Answer Option 6': '',
      'Explanation 6': '',
      'Correct Answers': 'A',
      'Overall Explanation': 'A Deployment controller provides declarative updates for Pods and ReplicaSets, continuously monitoring and self-healing pods to maintain the desired replica count.',
      'Domain': 'Domain 3: Workloads & Scheduling'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'ITPT_Practice_Tests');

  // Trigger download
  XLSX.writeFile(workbook, 'ITPracticeTests_Questions_Format_Template.xlsx');
}
