/* pages.js — Level 1: × Before + | Level 2: × Before − | ... | Level 6: Brackets First
   Lesson plan: bodmas_lesson_plan_mechanics_sequence.md, Section 01–06 */

var GAME_HTP = {
  subtitle: 'Learn to solve maths using BODMAS order of operations!',
  steps: [
    'Read the real-life scenario and find the expression.',
    'In the Lab, tap to highlight which part to solve first.',
    '<strong>×</strong> and <strong>÷</strong> always come before <strong>+</strong> and <strong>−</strong>.',
    '<strong>Brackets ( )</strong> have the highest priority.',
    'Practice questions after each level.',
    'Complete all 6 levels and the <strong>BODMAS Challenge</strong>.'
  ]
};

var CONTENT_PAGES = [

  // ═══════════════════════════════════════════════════════════
  // SECTION 01 — Level 1: × Before +
  // ═══════════════════════════════════════════════════════════

  {
    id: '1.0',
    type: 'l1-intro',
    scenario: 'A child buys 3 packets of crayons with 4 crayons each, and gets 2 extra crayons.',
    scenarioHtml: 'A child buys <span class="cp-l1i-hl">3 packets</span> of crayons with <span class="cp-l1i-hl">4 crayons</span> each, and gets <span class="cp-l1i-hl">2 extra</span> crayons.',
    expression: '3 × 4 + 2',
    question: 'How many crayons in all? Which part do you solve first?',
    questionHtml: '<img class="cp-l1i-question-icon" src="assets/face-emotions/Confused.webp" alt="" aria-hidden="true"> How many crayons in all? Which part do you solve first?',
    buttonLabel: '🔍 Start Exploring',
    next: '1.1'
  },

  {
    id: '1.1',
    type: 'l1-lab',
    rounds: [
      {
        tokens: ['3', '+', '4', '×', '2'],
        mulIndices: [2, 3, 4],
        mulResult: 8,
        finalResult: 11,
        hasCompare: true,
        compareWrong: 14,
        compareRight: 11
      },
      {
        tokens: ['5', '×', '2', '+', '6'],
        mulIndices: [0, 1, 2],
        mulResult: 10,
        finalResult: 16,
        hasCompare: false
      },
      {
        tokens: ['7', '+', '3', '×', '4'],
        mulIndices: [2, 3, 4],
        mulResult: 12,
        finalResult: 19,
        hasCompare: true,
        compareWrong: 40,
        compareRight: 19
      },
      {
        tokens: ['2', '×', '6', '+', '5'],
        mulIndices: [0, 1, 2],
        mulResult: 12,
        finalResult: 17,
        hasCompare: false
      }
    ],
    next: '1.2'
  },

  {
    id: '1.2',
    type: 'l1-reveal',
    title: 'You Found the Rule!',
    ruleText: 'When a sum has × and +, solve Multiplication first, then +.',
    workedSteps: [
      { expr: '3 + 4 × 2', hlTokens: ['4', '×', '2'] },
      { expr: '= 3 + 8', hlTokens: ['8'] },
      { expr: '= 11', hlTokens: [] }
    ],
    bodmasTag: 'Multiplication is done before Addition.',
    buttonLabel: 'Continue',
    next: '1.3'
  },

  {
    id: '1.3',
    type: 'l1-practice',
    animation: 'l1PracticeEntrance',
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
        kind: 'which-method',
        prompt: 'Which method is correct?',
        expression: '6 + 2 × 3',
        methods: [
          { label: 'Multiplication first', steps: ['6 + 2 × 3', '6 + 6 = 12'], answer: 12, correct: true },
          { label: 'Left → right', steps: ['6 + 2 × 3', '8 × 3 = 24'], answer: 24, correct: false }
        ],
        okMsg: 'Correct! Always do × before +.',
        wrongHint: 'Look for the × sign — it goes first!'
      }
    ],
    completionMsg: 'Excellent! You\'ve mastered × Before +!',
    next: '2.0'
  },

  // ═══════════════════════════════════════════════════════════
  // SECTION 02 — Level 2: × Before −
  // ═══════════════════════════════════════════════════════════

  {
    id: '2.0',
    type: 'l2-intro',
    scenario: 'A shopkeeper has 20 bananas. He sells 3 baskets with 4 bananas each.',
    scenarioHtml: 'A shopkeeper has <span class="cp-l2i-hl">20 bananas</span>. He sells <span class="cp-l2i-hl">3 baskets</span> with <span class="cp-l2i-hl">4 bananas</span> each.',
    expression: '20 − 3 × 4',
    question: 'How many bananas are left? Which part do you solve first?',
    questionHtml: '<img class="cp-l1i-question-icon" src="assets/face-emotions/Confused.webp" alt="" aria-hidden="true"> How many bananas are left? Which part do you solve first?',
    buttonLabel: '🔍 Start Exploring',
    next: '2.1'
  },

  {
    id: '2.1',
    type: 'l2-lab',
    rounds: [
      {
        tokens: ['10', '−', '3', '×', '2'],
        mulIndices: [2, 3, 4],
        mulResult: 6,
        finalResult: 4,
        hasCompare: true,
        compareWrong: 14,
        compareRight: 4
      },
      {
        tokens: ['4', '×', '3', '−', '7'],
        mulIndices: [0, 1, 2],
        mulResult: 12,
        finalResult: 5,
        hasCompare: false
      },
      {
        tokens: ['20', '−', '4', '×', '3'],
        mulIndices: [2, 3, 4],
        mulResult: 12,
        finalResult: 8,
        hasCompare: true,
        compareWrong: 48,
        compareRight: 8
      },
      {
        tokens: ['5', '×', '4', '−', '9'],
        mulIndices: [0, 1, 2],
        mulResult: 20,
        finalResult: 11,
        hasCompare: false
      }
    ],
    next: '2.2'
  },

  {
    id: '2.2',
    type: 'l2-reveal',
    title: 'You Found the Rule!',
    ruleText: 'When a sum has × and −, solve × first, then −.',
    workedSteps: [
      { expr: '10 − 3 × 2', hlTokens: ['3', '×', '2'] },
      { expr: '= 10 − 6', hlTokens: ['6'] },
      { expr: '= 4', hlTokens: [] }
    ],
    bodmasTag: 'Multiplication is done before Subtraction.',
    buttonLabel: 'Continue',
    next: '2.3'
  },

  {
    id: '2.3',
    type: 'l2-practice',
    animation: 'l2PracticeEntrance',
    questions: [
      {
        kind: 'tap-operator',
        prompt: 'Which operator do you calculate FIRST?',
        expression: '10 − 3 × 2',
        tokens: ['−', '×'],
        correctIndex: 1,
        wrongHint: '× and ÷ always go before + and − in BODMAS.',
        okMsg: 'Correct! × is solved before −.'
      },
      {
        kind: 'choose-rule',
        prompt: 'Which rule applies here?',
        expression: '8 − 2 × 3',
        options: ['× Before −', 'Left to Right'],
        correctIndex: 0,
        wrongHint: 'There\'s a × here — does it go first?',
        okMsg: 'Right! Multiply comes before Subtract.'
      },
      {
        kind: 'which-method',
        prompt: 'Which method is correct?',
        expression: '15 − 3 × 4',
        methods: [
          { label: 'Multiplication first', steps: ['15 − 3 × 4', '3 × 4 = 12', '15 − 12 = 3'], answer: 3, correct: true },
          { label: 'Left → right', steps: ['15 − 3 × 4', '15 − 3 = 12', '12 × 4 = 48'], answer: 48, correct: false }
        ],
        okMsg: 'Correct! Always do × before −.',
        wrongHint: 'Look for the × sign — it goes first!'
      }
    ],
    completionMsg: 'Excellent! You\'ve mastered × Before −!',
    next: '3.0'
  },

  // ═══════════════════════════════════════════════════════════
  // SECTION 03 — Level 3: ÷ Before + and −
  // ═══════════════════════════════════════════════════════════

  {
    id: '3.0',
    type: 'l3-intro',
    scenarioHtml: '<span style="color:#3BC6FF;font-weight:800">12 laddoos</span> are shared equally among <span style="color:#3BC6FF;font-weight:800">3 children</span>, and <span style="color:#3BC6FF;font-weight:800">5 more laddoos</span> are added.',
    expression: '12 ÷ 3 + 5',
    question: 'How many laddoos in total? Which part do you solve first?',
    questionHtml: '<img class="cp-l1i-question-icon" src="assets/face-emotions/Confused.webp" alt="" aria-hidden="true"> How many laddoos in total? Which part do you solve first?',
    buttonLabel: '🔍 Start Exploring',
    next: '3.1'
  },

  {
    id: '3.1',
    type: 'l3-lab',
    rounds: [
      {
        tokens: ['6', '+', '9', '÷', '3'],
        divIndices: [2, 3, 4],
        divResult: 3,
        finalResult: 9,
        hasCompare: true,
        compareWrong: 5,
        compareRight: 9
      },
      {
        tokens: ['10', '÷', '2', '+', '7'],
        divIndices: [0, 1, 2],
        divResult: 5,
        finalResult: 12,
        hasCompare: false
      },
      {
        tokens: ['10', '−', '6', '÷', '2'],
        divIndices: [2, 3, 4],
        divResult: 3,
        finalResult: 7,
        hasCompare: true,
        compareWrong: 2,
        compareRight: 7
      },
      {
        tokens: ['15', '÷', '3', '−', '2'],
        divIndices: [0, 1, 2],
        divResult: 5,
        finalResult: 3,
        hasCompare: false
      }
    ],
    next: '3.2'
  },

  {
    id: '3.2',
    type: 'l3-reveal',
    title: 'You Found the Rule!',
    ruleText: 'When a sum has ÷ and + or −, solve ÷ first.',
    workedSteps: [
      { expr: '10 + 12 ÷ 3', hlTokens: ['12', '÷', '3'] },
      { expr: '= 10 + 4', hlTokens: ['4'] },
      { expr: '= 14', hlTokens: [] }
    ],
    bodmasTag: 'Division is done before Addition and Subtraction.',
    buttonLabel: 'Continue',
    next: '3.3'
  },

  {
    id: '3.3',
    type: 'l3-practice',
    animation: 'l3PracticeEntrance',
    questions: [
      {
        kind: 'tap-operator',
        prompt: 'Which operator do you calculate FIRST?',
        expression: '8 + 6 ÷ 2',
        tokens: ['+', '÷'],
        correctIndex: 1,
        wrongHint: '÷ and × always go before + and − in BODMAS.',
        okMsg: 'Correct! ÷ is solved before +.'
      },
      {
        kind: 'choose-rule',
        prompt: 'Which rule applies here?',
        expression: '5 + 9 ÷ 3',
        options: ['÷ Before +', 'Left to Right'],
        correctIndex: 0,
        wrongHint: 'There\'s a ÷ here — does it go first?',
        okMsg: 'Right! Division comes before Addition.'
      },
      {
        kind: 'which-method',
        prompt: 'Which method is correct?',
        expression: '12 + 8 ÷ 4',
        methods: [
          { label: 'Division first', steps: ['12 + 8 ÷ 4', '8 ÷ 4 = 2', '12 + 2 = 14'], answer: 14, correct: true },
          { label: 'Left → right', steps: ['12 + 8 ÷ 4', '12 + 8 = 20', '20 ÷ 4 = 5'], answer: 5, correct: false }
        ],
        okMsg: 'Correct! Always do ÷ before +.',
        wrongHint: 'Look for the ÷ sign — it goes first!'
      }
    ],
    completionMsg: 'Excellent! You\'ve mastered ÷ Before + and −!',
    next: '4.0'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 04 — + and − Have Equal Priority (Left to Right)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: '4.0',
    type: 'l4-intro',
    scenarioHtml: 'Riya has <span style="color:#18D6A0;font-weight:800">10 stickers</span>, gives away <span style="color:#18D6A0;font-weight:800">4</span>, then gets <span style="color:#18D6A0;font-weight:800">3 more</span>.',
    expression: '10 − 4 + 3',
    question: 'How many stickers does Riya have now? Which part do you solve first?',
    questionHtml: '<img class="cp-l1i-question-icon" src="assets/face-emotions/Confused.webp" alt="" aria-hidden="true"> How many stickers does Riya have now? Which part do you solve first?',
    buttonLabel: '🔍 Start Exploring',
    next: '4.1'
  },

  {
    id: '4.1',
    type: 'l4-lab',
    rounds: [
      {
        tokens: ['10', '−', '4', '+', '3'],
        ltrIndices: [0, 1, 2],
        ltrResult: 6,
        finalResult: 9,
        hasCompare: true,
        compareWrong: 3,
        compareRight: 9
      },
      {
        tokens: ['8', '+', '5', '−', '6'],
        ltrIndices: [0, 1, 2],
        ltrResult: 13,
        finalResult: 7,
        hasCompare: false
      },
      {
        tokens: ['15', '−', '3', '+', '5'],
        ltrIndices: [0, 1, 2],
        ltrResult: 12,
        finalResult: 17,
        hasCompare: true,
        compareWrong: 7,
        compareRight: 17
      },
      {
        tokens: ['9', '+', '7', '−', '4'],
        ltrIndices: [0, 1, 2],
        ltrResult: 16,
        finalResult: 12,
        hasCompare: false
      }
    ],
    next: '4.2'
  },

  {
    id: '4.2',
    type: 'l4-reveal',
    ruleTitle: 'You Found the Rule!',
    ruleText: 'When a sum has + and −, solve from LEFT to RIGHT.',
    workedSteps: [
      { expr: '10 − 4 + 3', hlTokens: ['10', '−', '4'] },
      { expr: '= 6 + 3', hlTokens: ['6'] },
      { expr: '= 9', hlTokens: [] }
    ],
    bodmasTag: 'Addition and Subtraction are solved left to right.',
    next: '4.3'
  },

  {
    id: '4.3',
    type: 'l4-practice',
    animation: 'l4PracticeEntrance',
    questions: [
      {
        kind: 'tap-operator',
        prompt: 'Tap the operator you should solve FIRST.',
        expression: '10 − 4 + 3',
        tokens: ['−', '+'],
        correctIndex: 0,
        okMsg: 'Correct! The leftmost − is solved first.',
        wrongHint: '+ and − have equal priority — solve left to right.'
      },
      {
        kind: 'choose-rule',
        prompt: 'Which rule applies here?',
        expression: '8 − 3 + 5',
        options: ['Left to Right', '+ Before −'],
        correctIndex: 0,
        okMsg: 'Right! Addition and subtraction are solved left to right.',
        wrongHint: 'When + and − appear together, no one has higher priority.'
      },
      {
        kind: 'which-method',
        prompt: 'Which method is correct?',
        expression: '10 − 3 + 5',
        methods: [
          { label: 'Left → right', steps: ['10 − 3 + 5', '10 − 3 = 7', '7 + 5 = 12'], answer: 12, correct: true },
          { label: 'Addition first', steps: ['10 − 3 + 5', '3 + 5 = 8', '10 − 8 = 2'], answer: 2, correct: false }
        ],
        okMsg: 'Correct! Always solve + and − left to right.',
        wrongHint: '+ and − have equal priority — go left to right!'
      }
    ],
    completionMsg: 'Excellent! You\'ve mastered + and − Left to Right!',
    next: '5.0'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 05 — × and ÷ Have Equal Priority (Left to Right)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: '5.0',
    type: 'l5-intro',
    scenarioHtml: '<span style="color:#6F8BFF;font-weight:800">12 chocolates</span> are divided into <span style="color:#6F8BFF;font-weight:800">2 groups</span>, then each group is tripled.',
    expression: '12 ÷ 2 × 3',
    question: 'How many chocolates in total? Which part do you solve first?',
    questionHtml: '<img class="cp-l1i-question-icon" src="assets/face-emotions/Confused.webp" alt="" aria-hidden="true"> How many chocolates in total? Which part do you solve first?',
    buttonLabel: '🔍 Start Exploring',
    next: '5.1'
  },

  {
    id: '5.1',
    type: 'l5-lab',
    rounds: [
      {
        tokens: ['12', '÷', '2', '×', '3'],
        ltrIndices: [0, 1, 2],
        ltrResult: 6,
        finalResult: 18,
        hasCompare: true,
        compareWrong: 2,
        compareRight: 18
      },
      {
        tokens: ['4', '×', '5', '÷', '2'],
        ltrIndices: [0, 1, 2],
        ltrResult: 20,
        finalResult: 10,
        hasCompare: false
      },
      {
        tokens: ['30', '÷', '5', '×', '2'],
        ltrIndices: [0, 1, 2],
        ltrResult: 6,
        finalResult: 12,
        hasCompare: true,
        compareWrong: 3,
        compareRight: 12
      },
      {
        tokens: ['6', '×', '4', '÷', '3'],
        ltrIndices: [0, 1, 2],
        ltrResult: 24,
        finalResult: 8,
        hasCompare: false
      }
    ],
    next: '5.2'
  },

  {
    id: '5.2',
    type: 'l5-reveal',
    ruleTitle: 'You Found the Rule!',
    ruleText: 'When a sum has × and ÷, solve from LEFT to RIGHT.',
    workedSteps: [
      { expr: '12 ÷ 2 × 3', hlTokens: ['12', '÷', '2'] },
      { expr: '= 6 × 3', hlTokens: ['6'] },
      { expr: '= 18', hlTokens: [] }
    ],
    bodmasTag: 'Multiplication and Division are solved left to right.',
    next: '5.3'
  },

  {
    id: '5.3',
    type: 'l5-practice',
    animation: 'l5PracticeEntrance',
    questions: [
      {
        kind: 'tap-operator',
        prompt: 'Tap the operator you should solve FIRST.',
        expression: '12 ÷ 4 × 3',
        tokens: ['÷', '×'],
        correctIndex: 0,
        okMsg: 'Correct! The leftmost ÷ is solved first.',
        wrongHint: '× and ÷ have equal priority — solve left to right.'
      },
      {
        kind: 'choose-rule',
        prompt: 'Which rule applies here?',
        expression: '8 ÷ 2 × 3',
        options: ['Left to Right', '× Before ÷'],
        correctIndex: 0,
        okMsg: 'Right! Multiplication and division are solved left to right.',
        wrongHint: 'When × and ÷ appear together, no one has higher priority.'
      },
      {
        kind: 'which-method',
        prompt: 'Which method is correct?',
        expression: '24 ÷ 4 × 2',
        methods: [
          { label: 'Left → right', steps: ['24 ÷ 4 × 2', '24 ÷ 4 = 6', '6 × 2 = 12'], answer: 12, correct: true },
          { label: 'Multiplication first', steps: ['24 ÷ 4 × 2', '4 × 2 = 8', '24 ÷ 8 = 3'], answer: 3, correct: false }
        ],
        okMsg: 'Correct! Always solve × and ÷ left to right.',
        wrongHint: '× and ÷ have equal priority — go left to right!'
      }
    ],
    completionMsg: 'Excellent! You\'ve mastered × and ÷ Left to Right!',
    next: '6.0'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 06 — Brackets First
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: '6.0',
    type: 'l6-intro',
    scenarioHtml: 'A teacher makes <span style="color:#FF6FA8;font-weight:800">3 groups</span>. Each group has <span style="color:#FF6FA8;font-weight:800">4 boys</span> and <span style="color:#FF6FA8;font-weight:800">2 girls</span>.',
    expression: '3 \xd7 (4 + 2)',
    question: 'How many students in all? Which part do you solve first?',
    questionHtml: '<img class="cp-l1i-question-icon" src="assets/face-emotions/Confused.webp" alt="" aria-hidden="true"> How many students in all? Which part do you solve first?',
    buttonLabel: '🔍 Start Exploring',
    next: '6.1'
  },

  {
    id: '6.1',
    type: 'l6-lab',
    rounds: [
      {
        tokens: ['(', '2', '+', '3', ')', '\xd7', '4'],
        bracketOpen: 0,
        bracketClose: 4,
        bracketOpIdx: 2,
        bracketResult: 5,
        finalResult: 20,
        hasCompare: true,
        compareWrong: 14,
        compareRight: 20,
        wrongSteps: ['3 \xd7 4 = 12', '2 + 12 = 14']
      },
      {
        tokens: ['3', '\xd7', '(', '4', '+', '2', ')'],
        bracketOpen: 2,
        bracketClose: 6,
        bracketOpIdx: 4,
        bracketResult: 6,
        finalResult: 18,
        hasCompare: false
      },
      {
        tokens: ['(', '5', '+', '1', ')', '\xd7', '6'],
        bracketOpen: 0,
        bracketClose: 4,
        bracketOpIdx: 2,
        bracketResult: 6,
        finalResult: 36,
        hasCompare: true,
        compareWrong: 11,
        compareRight: 36,
        wrongSteps: ['1 \xd7 6 = 6', '5 + 6 = 11']
      },
      {
        tokens: ['2', '\xd7', '(', '7', '+', '3', ')'],
        bracketOpen: 2,
        bracketClose: 6,
        bracketOpIdx: 4,
        bracketResult: 10,
        finalResult: 20,
        hasCompare: false
      }
    ],
    next: '6.2'
  },

  {
    id: '6.2',
    type: 'l6-reveal',
    ruleTitle: 'You Found the Rule!',
    ruleText: 'When a sum has ( ), solve inside the ( ) first.',
    workedSteps: [
      { expr: '(2 + 3) \xd7 4', hlTokens: ['(2', '+', '3)'] },
      { expr: '= 5 \xd7 4', hlTokens: ['5'] },
      { expr: '= 20', hlTokens: [] }
    ],
    bodmasTag: 'Brackets are solved before everything else.',
    buttonLabel: 'Continue',
    next: '6.3'
  },

  {
    id: '6.3',
    type: 'l6-practice',
    animation: 'l6PracticeEntrance',
    questions: [
      {
        kind: 'tap-operator',
        prompt: 'Which operator do you calculate FIRST?',
        expression: '(3 + 4) \xd7 2',
        tokens: ['+', '\xd7'],
        correctIndex: 0,
        wrongHint: 'Brackets go first — solve what\'s inside ( ) before anything else.',
        okMsg: 'Correct! The + inside ( ) is solved first.'
      },
      {
        kind: 'choose-rule',
        prompt: 'Which rule applies here?',
        expression: '(5 + 1) \xd7 3',
        options: ['( ) Brackets First', '\xd7 Before +'],
        correctIndex: 0,
        wrongHint: 'See the brackets? Everything inside goes first.',
        okMsg: 'Right! Brackets come before multiplication.'
      },
      {
        kind: 'which-method',
        prompt: 'Which method is correct?',
        expression: '(4 + 2) \xd7 3',
        methods: [
          { label: 'Brackets first', steps: ['(4 + 2) \xd7 3', '4 + 2 = 6', '6 \xd7 3 = 18'], answer: 18, correct: true },
          { label: 'Multiplication first', steps: ['(4 + 2) \xd7 3', '2 \xd7 3 = 6', '4 + 6 = 10'], answer: 10, correct: false }
        ],
        okMsg: 'Correct! Always solve inside brackets first.',
        wrongHint: 'Look for the brackets — they change what goes first!'
      }
    ],
    completionMsg: 'Excellent! You\'ve mastered Brackets First!',
    next: '8.0'
  },

  // ═══════════════════════════════════════════════════════════
  // SECTION 08 — BODMAS Ladder (Slide 14)
  // ═══════════════════════════════════════════════════════════

  {
    id: '8.0',
    type: 'l8-bodmas-ladder',
    instruction: 'Arrange The Boxes in Corrent Sequence',
    tiles: [
      { id: 'O', letter: 'O', word: 'Orders',         label: 'O — Orders',         colorKey: 'blue'   },
      { id: 'B', letter: 'B', word: 'Brackets',       label: 'B — Brackets',       colorKey: 'orange' },
      { id: 'S', letter: 'S', word: 'Subtraction',    label: 'S — Subtraction',    colorKey: 'teal'   },
      { id: 'A', letter: 'A', word: 'Addition',       label: 'A — Addition',       colorKey: 'green'  },
      { id: 'D', letter: 'D', word: 'Division',       label: 'D — Division',       colorKey: 'pink'   },
      { id: 'M', letter: 'M', word: 'Multiplication', label: 'M — Multiplication', colorKey: 'purple' }
    ],
    correctOrder: ['B', 'O', 'D', 'M', 'A', 'S'],
    wrongHint: 'Not quite! Think about which operation comes first in BODMAS.',
    completionMsg: '🎉 You discovered the order rule. Mathematicians call it BODMAS!',
    next: '9.0'
  },

  // ═══════════════════════════════════════════════════════════
  // SECTION 09 — Nested Brackets Challenge (Slide 15)
  // ═══════════════════════════════════════════════════════════

  {
    id: '9.0',
    type: 'l9-nested-brackets',
    instruction: 'Tap which operator to solve FIRST!',
    hintInner: '🔍 Find the innermost ( ) brackets and tap the operator inside!',
    hintMiddle: '✨ Inner brackets solved! Tap the next operator to use.',
    hintLast: '🎯 Almost done — tap the last remaining operator!',
    wrongHint: 'That\'s not inside the innermost brackets — look for the ( ) with no other ( ) inside it.',
    questions: [
      {
        label: 'Question 1 of 2',
        expression: '( 2 + ( 3 × 4 ) ) − 5',
        steps: [
          {
            correctOp: '×', subExpr: '3 × 4', answer: 12,
            reducedExpression: '( 2 + 12 ) − 5', phase: 'inner'
          },
          {
            correctOp: '+', subExpr: '2 + 12', answer: 14,
            reducedExpression: '14 − 5', phase: 'middle'
          },
          {
            correctOp: '−', subExpr: '14 − 5', answer: 9,
            phase: 'last', isFinal: true
          }
        ],
        finalAnswer: 9,
        fullExpression: '(2 + (3 × 4)) − 5 = 9'
      },
      {
        label: 'Question 2 of 2',
        expression: '3 × ( 2 + ( 8 ÷ 4 ) )',
        steps: [
          {
            correctOp: '÷', subExpr: '8 ÷ 4', answer: 2,
            reducedExpression: '3 × ( 2 + 2 )', phase: 'inner'
          },
          {
            correctOp: '+', subExpr: '2 + 2', answer: 4,
            reducedExpression: '3 × 4', phase: 'middle'
          },
          {
            correctOp: '×', subExpr: '3 × 4', answer: 12,
            phase: 'last', isFinal: true
          }
        ],
        finalAnswer: 12,
        fullExpression: '3 × (2 + (8 ÷ 4)) = 12'
      }
    ],
    next: '9.1',
    animation: 'l9nbEntrance'
  },

  // ═══════════════════════════════════════════════════════════
  // Page 9.1 — Insert the Brackets (Slide 16)
  // ═══════════════════════════════════════════════════════════

  {
    id: '9.1',
    type: 'l9-insert-brackets',
    title: 'Insert The Brackets!',
    instruction: 'Place the brackets to make it true!',
    subInstruction: 'Tap where ( goes, then where ) goes.',
    puzzles: [
      {
        id: 1, tokens: ['2', '+', '3', '×', '4'], target: 20,
        solution: { open: 0, close: 3 }, working: '(2 + 3) × 4 = 5 × 4 = 20'
      },
      {
        id: 2, tokens: ['8', '−', '2', '×', '3'], target: 18,
        solution: { open: 0, close: 3 }, working: '(8 − 2) × 3 = 6 × 3 = 18'
      },
      {
        id: 3, tokens: ['3', '×', '4', '+', '2'], target: 18,
        solution: { open: 2, close: 5 }, working: '3 × (4 + 2) = 3 × 6 = 18'
      },
      {
        id: 4, tokens: ['10', '−', '2', '+', '3'], target: 5,
        solution: { open: 2, close: 5 }, working: '10 − (2 + 3) = 10 − 5 = 5'
      }
    ],
    animation: 'l9ibEntrance',
    next: '9.2'
  },

  // ═══════════════════════════════════════════════════════════
  // Page 9.2 — Final BODMAS Review (Slide 17)
  // ═══════════════════════════════════════════════════════════

  {
    id: '9.2',
    type: 'l9-bodmas-review',
    title: 'FINAL BODMAS REVIEW',
    questions: [
      {
        n: 1, rule: '× before +', expr: '7 + 2 × 3', correctOp: '×', answer: 13,
        okMsg: '✓ Correct! × is solved first → 7 + 6 = 13'
      },
      {
        n: 2, rule: '× before −', expr: '15 − 2 × 4', correctOp: '×', answer: 7,
        okMsg: '✓ Correct! × is solved first → 15 − 8 = 7'
      },
      {
        n: 3, rule: '÷ before + and −', expr: '5 + 12 ÷ 4', correctOp: '÷', answer: 8,
        okMsg: '✓ Correct! ÷ is solved first → 5 + 3 = 8'
      },
      {
        n: 4, rule: '+ and − left to right', expr: '11 − 4 + 2', correctOp: '−', answer: 9,
        okMsg: '✓ Correct! Leftmost − is solved first → 7 + 2 = 9'
      },
      {
        n: 5, rule: '× and ÷ left to right', expr: '18 ÷ 3 × 2', correctOp: '÷', answer: 12,
        okMsg: '✓ Correct! Leftmost ÷ is solved first → 6 × 2 = 12'
      },
      {
        n: 6, rule: 'Brackets ( ) come FIRST', expr: '( 5 + 3 ) × 4', correctOp: '+', answer: 32,
        okMsg: '✓ Correct! + inside ( ) is solved first → 8 × 4 = 32'
      }
    ],
    stepOrder: {
      n: 7,
      label: 'Full BODMAS Challenge!',
      expression: '24 ÷ (6 − 2) + 3 × 2',
      steps: [
        { id: 'brackets', label: 'Step: (6 − 2) = 4' },
        { id: 'div', label: 'Step: 24 ÷ 4 = 6' },
        { id: 'mul', label: 'Step: 3 × 2 = 6' },
        { id: 'add', label: 'Step: 6 + 6 = 12' }
      ],
      correctOrder: ['brackets', 'div', 'mul', 'add'],
      wrongHint: 'Not quite — remember: brackets first, then × and ÷, then + and −.',
      successMsg: '🎉 Perfect BODMAS order! You got it!'
    },
    animation: 'l9brEntrance',
    next: '9.3'
  },

  // ═══════════════════════════════════════════════════════════
  // Page 9.3 — BODMAS Champion Results
  // ═══════════════════════════════════════════════════════════

  {
    id: '9.3',
    type: 'l9-results',
    next: null
  }

];
