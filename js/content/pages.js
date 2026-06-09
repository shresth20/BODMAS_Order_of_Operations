/* pages.js — Level 1: × Before +
   Lesson plan: bodmas_lesson_plan_mechanics_sequence.md, Section 01–02 */

var CONTENT_PAGES = [

  // ═══════════════════════════════════════════════════════════
  // SECTION 01 — Level 1: × Before +
  // ═══════════════════════════════════════════════════════════

  {
    id: '1.0',
    type: 'l1-intro',
    scenario: 'A child buys 3 packets of crayons with 4 crayons each, and gets 2 extra crayons.',
    expression: '3 × 4 + 2',
    question: '🤔 How many crayons in all? Which part do you solve first?',
    buttonLabel: '🔍 Let\'s Investigate!',
    next: '2.1'
  },

  {
    id: '2.1',
    type: 'l1-lab',
    rounds: [
      {
        tokens:     ['3', '+', '4', '×', '2'],
        mulIndices: [2, 3, 4],
        mulResult:  8,
        finalResult: 11,
        hasCompare:  true,
        compareWrong: 14,
        compareRight: 11
      },
      {
        tokens:     ['5', '×', '2', '+', '6'],
        mulIndices: [0, 1, 2],
        mulResult:  10,
        finalResult: 16,
        hasCompare:  false
      },
      {
        tokens:     ['7', '+', '3', '×', '4'],
        mulIndices: [2, 3, 4],
        mulResult:  12,
        finalResult: 19,
        hasCompare:  true,
        compareWrong: 40,
        compareRight: 19
      },
      {
        tokens:     ['2', '×', '6', '+', '5'],
        mulIndices: [0, 1, 2],
        mulResult:  12,
        finalResult: 17,
        hasCompare:  false
      }
    ],
    next: '2.2'
  },

  {
    id: '2.2',
    type: 'l1-reveal',
    title: 'You Found the Rule!',
    ruleText: 'When a sum has × and +, solve × first, then +.',
    workedSteps: [
      { expr: '3 + 4 × 2', hlTokens: ['4', '×', '2'] },
      { expr: '= 3 + 8',   hlTokens: ['8'] },
      { expr: '= 11',      hlTokens: [] }
    ],
    bodmasTag: 'Part of BODMAS — Multiplication is done before Addition.',
    buttonLabel: 'See the Detectives ►',
    next: '2.3'
  },

  {
    id: '2.3',
    type: 'l1-practice',
    questions: [
      {
        kind: 'tap-operator',
        prompt: 'Which operator do you calculate FIRST?',
        expression: '3 + 4 × 2',
        tokens: ['+', '×'],
        correctIndex: 1,
        wrongHint: '× and ÷ always go before + and − in BODMAS.',
        okMsg: 'Correct! × is solved before +.'
      },
      {
        kind: 'choose-rule',
        prompt: 'Which rule applies here?',
        expression: '7 + 2 × 5',
        options: ['× Before +', 'Left to Right'],
        correctIndex: 0,
        wrongHint: 'There\'s a × here — does it go first?',
        okMsg: 'Right! Multiply comes before Add.'
      },
      {
        kind: 'step-by-step',
        prompt: 'Solve step by step.',
        expression: '5 + 3 × 4',
        steps: [
          { instruction: 'Do × first', subExpr: '3 × 4 = ?', choices: [12, 7, 20], correct: 12 },
          { instruction: 'Now add',    subExpr: '5 + 12 = ?', choices: [17, 9, 20], correct: 17 }
        ],
        okMsg: 'Perfect! 5 + 3 × 4 = 17.'
      },
      {
        kind: 'which-method',
        prompt: 'Which method is correct?',
        expression: '6 + 2 × 3',
        methods: [
          { label: '× first',      steps: ['6 + 2 × 3', '6 + 6 = 12'], answer: 12, correct: true  },
          { label: 'Left → right', steps: ['6 + 2 × 3', '8 × 3 = 24'], answer: 24, correct: false }
        ],
        okMsg: 'Correct! Always do × before +.',
        wrongHint: 'Look for the × sign — it goes first!'
      }
    ],
    completionMsg: 'Excellent! You\'ve mastered × Before +!',
    next: null
  }

];
