/* pages.js - Page data for arithmetic large-numbers game.
   Add new pages section by section.
   Renderers live in content-renderer.js. */

var CONTENT_PAGES = [

  // ═══════════════════════════════════════════════════════════
  // SECTION 01 — Welcome / Mission Start
  // ═══════════════════════════════════════════════════════════

  {
    id: '1.0',
    type: 'welcome',
    title: 'Which step comes first?',
    subtitle: 'Crack the secret order of maths — by playing.',
    heroSum: '3 + 4 × 2 = ?',
    answerTags: [
      { label: '11?', side: 'left' },
      { label: '14?', side: 'right' }
    ],
    caption: 'Same sum. Two answers. Only one is right.',
    buttonLabel: 'Let\'s Begin →',
    next: '2.0',
    animation: 'welcomeIntro'
  },

  // ═══════════════════════════════════════════════════════════
  // SECTION 02 — BODMAS: Order of Operations
  // ═══════════════════════════════════════════════════════════

  {
    id: '2.0',
    type: 'bodmas-ask',
    title: 'Multiply before Add',
    expression: '3 × 4 + 2',
    question: 'Which part do you solve FIRST?',
    buttonLabel: "Let's Try →",
    animation: 'bodmasAsk',
    next: '2.1'
  },

  {
    id: '2.1',
    type: 'bodmas-try',
    title: 'Bodmas Try',
    examples: [
      {
        tokens: ['3', '+', '4', '×', '2'],
        multiplyIndices: [2, 3, 4],
        plusIndices: [0, 1],
        product: 8,
        productToken: '8',
        finalExpr: ['3', '+', '8'],
        answer: 11,
        hasCompare: true,
        compareLeft: 14,
        compareRight: 11
      },
      {
        tokens: ['5', '×', '2', '+', '6'],
        multiplyIndices: [0, 1, 2],
        plusIndices: [3, 4],
        product: 10,
        productToken: '10',
        finalExpr: ['10', '+', '6'],
        answer: 16,
        hasCompare: false
      },
      {
        tokens: ['7', '+', '3', '×', '4'],
        multiplyIndices: [2, 3, 4],
        plusIndices: [0, 1],
        product: 12,
        productToken: '12',
        finalExpr: ['7', '+', '12'],
        answer: 19,
        hasCompare: true,
        compareLeft: 40,
        compareRight: 19
      },
      {
        tokens: ['2', '×', '6', '+', '5'],
        multiplyIndices: [0, 1, 2],
        plusIndices: [3, 4],
        product: 12,
        productToken: '12',
        finalExpr: ['12', '+', '5'],
        answer: 17,
        hasCompare: false
      }
    ],
    animation: 'bodmasTry',
    next: '2.2'
  },

  {
    id: '2.2',
    type: 'bodmas-reveal',
    title: 'You found the rule!',
    ruleText: 'When a sum has × and +, do × first, then +.',
    workedSteps: [
      { expr: '3 + 4 × 2', highlight: [2, 3, 4] },
      { expr: '3 + 8',     highlight: [2, 3]   },
      { expr: '11',        highlight: [0]       }
    ],
    bodmasTag: 'This is part of BODMAS — Multiply is done before Add.',
    chips: ["Don't always go left → right.", 'Multiply first, then add.'],
    buttonPractice: 'Practice →',
    buttonNext: 'Next Mission ▶',
    animation: 'bodmasReveal',
    next: '2.3'
  },

  {
    id: '2.3',
    type: 'bodmas-practice',
    title: 'Bodmas Practice',
    questions: [
      {
        kind: 'tap-operator',
        prompt: 'Which operator do you calculate FIRST?',
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
        wrongHint: "There's a × here — does it go first?",
        okMsg: 'Right! Multiply comes before Add.'
      },
      {
        kind: 'step-by-step',
        prompt: 'Solve step by step.',
        expression: '5 + 3 × 4',
        steps: [
          { instruction: 'Do × first',  subExpr: '3 × 4 = ?', choices: [12, 7, 20],  correct: 12 },
          { instruction: 'Now add',     subExpr: '5 + 12 = ?', choices: [17, 9, 20], correct: 17 }
        ],
        okMsg: 'Perfect! 5 + 3 × 4 = 17.'
      },
      {
        kind: 'which-method',
        prompt: 'Which method is right?',
        expression: '6 + 2 × 3',
        methods: [
          { label: 'Left to right', steps: '(6+2)×3 = 8×3 = 24', correct: false },
          { label: '× first',       steps: '6+(2×3) = 6+6 = 12',  correct: true  }
        ],
        correctIndex: 1,
        okMsg: 'Correct! Method B is right.'
      }
    ],
    completionMsg: 'Well done! You answered all 4 correctly.',
    animation: 'bodmasPractice',
    next: '3.0'
  },

  // ═══════════════════════════════════════════════════════════
  // SECTION 03 — Micro-Skill: × before −
  // ═══════════════════════════════════════════════════════════

  {
    id: '3.0',
    type: 'mbs-ask',
    title: 'Multiply before Subtract',
    expression: '20 − 3 × 4',
    question: 'Which part do you solve FIRST?',
    buttonLabel: "Let's Try →",
    animation: 'mbsAsk',
    next: '3.1'
  },

  {
    id: '3.1',
    type: 'mbs-try',
    title: 'Mbs Try',
    examples: [
      {
        tokens: ['10', '−', '3', '×', '2'],
        multiplyIndices: [2, 3, 4],
        minusIndices: [0, 1],
        product: 6,
        productToken: '6',
        finalExpr: ['10', '−', '6'],
        answer: 4,
        hasCompare: true,
        compareLeft: 14,
        compareRight: 4
      },
      {
        tokens: ['4', '×', '3', '−', '7'],
        multiplyIndices: [0, 1, 2],
        minusIndices: [3, 4],
        product: 12,
        productToken: '12',
        finalExpr: ['12', '−', '7'],
        answer: 5,
        hasCompare: false
      },
      {
        tokens: ['20', '−', '4', '×', '3'],
        multiplyIndices: [2, 3, 4],
        minusIndices: [0, 1],
        product: 12,
        productToken: '12',
        finalExpr: ['20', '−', '12'],
        answer: 8,
        hasCompare: true,
        compareLeft: 48,
        compareRight: 8
      },
      {
        tokens: ['5', '×', '4', '−', '9'],
        multiplyIndices: [0, 1, 2],
        minusIndices: [3, 4],
        product: 20,
        productToken: '20',
        finalExpr: ['20', '−', '9'],
        answer: 11,
        hasCompare: false
      }
    ],
    animation: 'mbsTry',
    next: '3.2'
  },

  {
    id: '3.2',
    type: 'mbs-reveal',
    title: 'You found the rule!',
    ruleText: 'When a sum has × and −, do × first, then −.',
    workedSteps: [
      { expr: '10 − 3 × 2', highlight: [2, 3, 4] },
      { expr: '10 − 6',     highlight: [2, 3]     },
      { expr: '4',          highlight: [0]         }
    ],
    bodmasTag: 'Part of BODMAS — Multiply is done before Subtract too.',
    connectLine: 'Same as last time: times before plus, times before take-away. Multiply just goes first!',
    chips: ['Times beats take-away.', 'Multiply first, then subtract — same rule, different sign.'],
    buttonPractice: 'Practice →',
    buttonNext: 'Next Mission ▶',
    animation: 'mbsReveal',
    next: '3.3'
  },

  {
    id: '3.3',
    type: 'mbs-practice',
    title: 'Mbs Practice',
    questions: [
      {
        kind: 'tap-operator',
        prompt: 'Which operator do you calculate FIRST?',
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
        wrongHint: "There's a × here — does it go first?",
        okMsg: 'Right! Multiplication comes before Subtraction.'
      },
      {
        kind: 'step-by-step',
        prompt: 'Solve step by step.',
        expression: '9 − 2 × 4',
        steps: [
          { instruction: 'Do × first',   subExpr: '2 × 4 = ?', choices: [8, 6, 12], correct: 8 },
          { instruction: 'Now subtract', subExpr: '9 − 8 = ?', choices: [1, 17, 2], correct: 1 }
        ],
        okMsg: 'Perfect! 9 − 2 × 4 = 1.'
      },
      {
        kind: 'which-method',
        prompt: 'Which method is right?',
        expression: '15 − 3 × 4',
        methods: [
          { label: 'Left to right', steps: '(15−3)×4 = 12×4 = 48', correct: false },
          { label: '× first',       steps: '15−(3×4) = 15−12 = 3',  correct: true  }
        ],
        correctIndex: 1,
        okMsg: 'Correct! Method B is right.'
      }
    ],
    completionMsg: 'Well done! You answered all 4 correctly.',
    animation: 'mbsPractice',
    next: '4.0'
  },

  // ═══════════════════════════════════════════════════════════
  // SECTION 04 — Multiplication
  // ═══════════════════════════════════════════════════════════

  {
    id: '4.0',
    type: 'section-intro',
    icon: '×',
    title: 'Multiplication',
    subhint: "Let's learn fast adding — many times over!",
    autoDelay: 2500,
    animation: 'sectionIntroMultiplication',
    sfxLoad: 'playLevelUpDing',
    sfxExit: 'playWhooshSoft',
    next: '4.1'
  },

  {
    id: '4.1',
    type: 'multiplication-lab',
    title: 'Multiplication Lab',
    headers: ['C', 'TL', 'L', 'TTh', 'Th', 'H', 'T', 'O'],
    randomNumbers: true,
    animation: 'multiplicationLab',
    next: '4.2'
  },

  {
    id: '4.2',
    type: 'multiplication-builder',
    title: 'Multiplication Builder',
    animation: 'multiplicationBuilder',
    next: '4.3'
  },

  {
    id: '4.3',
    type: 'multiply-and-check',
    title: 'Multiply and Check',
    animation: 'multiplyAndCheck',
    next: '5.0'
  },

  // ═══════════════════════════════════════════════════════════
  // SECTION 05 — Division
  // ═══════════════════════════════════════════════════════════

  {
    id: '5.0',
    type: 'section-intro',
    icon: '÷',
    title: 'Division',
    subhint: "Let's learn to share big numbers into equal groups!",
    autoDelay: 2500,
    animation: 'sectionIntroDivision',
    sfxLoad: 'playLevelUpDing',
    sfxExit: 'playWhooshSoft',
    next: '5.1'
  },

  {
    id: '5.1',
    type: 'division-lab',
    title: 'Division Lab',
    animation: 'divisionLab',
    sfxLoad: 'playLevelUpDing',
    sfxExit: 'playWhooshSoft',
    next: '5.2'
  },

  {
    id: '5.2',
    type: 'division-practice-zero-trick',
    title: 'Division Practice',
    animation: 'divisionPracticeZeroTrick',
    sfxLoad: 'playLevelUpDing',
    sfxExit: 'playWhooshSoft',
    next: '6.0'
  },

  // ═══════════════════════════════════════════════════════════
  // SECTION 06 — Two-Step Stories (capstone transition)
  // ═══════════════════════════════════════════════════════════

  {
    id: '6.0',
    type: 'hint-card',
    operators: ['+', '−', '×', '÷'],
    title: 'Two-Step Stories',
    subhint: 'Use TWO operations to solve real puzzles!',
    autoDelay: 2800,
    animation: 'hintCardTypewriter',
    next: '6.1'
  },

  {
    id: '6.1',
    type: 'two-step-story',
    title: 'Two-Step Story 1',
    story: [
      'A school library received 18,450 new books.',
      'It sent 6,275 books to senior classes and 4,860 books to junior classes.',
    ],
    steps: [
      {
        chip: 'Step 1',
        lead: 'Step 1: First find how many books were sent out in total.',
        ask:  'Choose the operation for step 1, then write the answer.',
        correctOp:  '+',
        expectedAns: 11135,
        summary: 'Step 1: 6,275 + 4,860 = 11,135 books were sent out.',
        statusOpCorrect:  'Correct operation. Now solve this step.',
        statusOpWrong:    'Think about what the step is asking first, then choose the operation that matches it.',
        statusAnsCorrect: 'Step 1 solved. Now think about step 2.',
        statusAnsWrong:   'Use the operation you chose and compute this step carefully.'
      },
      {
        chip: 'Step 2',
        lead: 'Step 2: Now find how many books are left.',
        ask:  'Choose the next operation, then write the final answer.',
        correctOp:  '−',
        expectedAns: 7315,
        summary: 'Step 2: 18,450 − 11,135 = 7,315 books are left.',
        doneText: 'Correct! The library still has 7,315 books.',
        statusOpCorrect:  'Correct operation. Now solve this step.',
        statusOpWrong:    'Think about what the step is asking first, then choose the operation that matches it.',
        statusAnsCorrect: 'Correct! The library still has 7,315 books.',
        statusAnsWrong:   'Use the operation you chose and compute this step carefully.'
      }
    ],
    animation: 'twoStepStory1',
    next: '6.2'
  },

  // ═══════════════════════════════════════════════════════════
  // SECTION 06 continued — Operation HQ (4 rounds)
  // ═══════════════════════════════════════════════════════════

  {
    id: '6.2',
    type: 'operation-hq',
    title: 'Operation HQ',
    rounds: [
      {
        title: 'Round 1: Revenue',
        correctOp: '+',
        expectedAns: 1683045,
        successMsg: 'Revenue approved.',
        desc: 'Counter A: Rs 13,45,620\nCounter B: Rs 2,78,950\nCounter C: Rs 58,475\n\nFind Total.'
      },
      {
        title: 'Round 2: Budget',
        correctOp: '−',
        expectedAns: 706155,
        successMsg: 'Budget safe.',
        desc: 'Available: Rs 16,83,045\nSpent: Rs 9,76,890\n\nFind Balance.'
      },
      {
        title: 'Round 3: Printing',
        correctOp: '×',
        expectedAns: 143760,
        successMsg: 'Printing started.',
        desc: 'Copies: 11,980\nPages each: 12\n\nTotal pages?'
      },
      {
        title: 'Round 4: Packing',
        correctOp: '÷',
        expectedAns: 3000,
        successMsg: 'Packing complete.',
        desc: 'Pages: 6,00,000\nPer notebook: 200\n\nTotal notebooks?'
      }
    ],
    statusWrongOp:  'match the story to the operation: total means add, balance means subtract, repeated groups means multiply, equal sharing means divide.',
    statusWrongAns: 'use the operation you selected and solve the whole scenario step by step.',
    animation: 'operationHQ',
    next: '6.3'
  },

  /* ══════════════════════════════════════════════════════
     PAGE 6.3 — Number Solver (4 Free-Order Cards)
  ══════════════════════════════════════════════════════ */
  {
    id: '6.3',
    type: 'number-solver',
    title: 'Number Solver',
    subtitle: 'Tap a card to solve the scenario.',
    cards: [
      {
        id: 'library',
        title: 'Library Books',
        body: ['Old stock: 1,48,250', 'New books: 37,890', 'Find total books.'],
        op: '+',
        answer: 186140
      },
      {
        id: 'water',
        title: 'Water Bottles',
        body: ['Made: 9,25,000', 'Sold: 8,68,450', 'Find bottles left.'],
        op: '-',
        answer: 56550
      },
      {
        id: 'bus',
        title: 'Bus Seats',
        body: ['Buses: 1,275', 'Seats each: 48', 'Find total seats.'],
        op: 'x',
        answer: 61200
      },
      {
        id: 'rice',
        title: 'Rice Bags',
        body: ['Rice: 4,86,000 kg', 'Kg per bag: 90', 'Find total bags.'],
        op: '/',
        answer: 5400
      }
    ],
    statusWrongOp:  'pick the operation that matches the situation on the card before solving.',
    statusWrongAns: 'use the correct operation for this card and then recompute the answer carefully.',
    animation: 'numberSolver',
    next: '6.4'
  },

  /* ══════════════════════════════════════════════════════
     PAGE 6.4 — Operation Rush (5 Rapid Mixed Questions)
  ══════════════════════════════════════════════════════ */
  {
    id: '6.4',
    type: 'operation-rush',
    title: 'Operation Rush',
    questions: [
      {
        text: 'A metro station recorded 4,86,750 passengers on Saturday and 2,79,865 passengers on Sunday. How many passengers travelled over the weekend altogether?',
        answer: 766615,
        hint: 'Add both day totals carefully and check each carry.'
      },
      {
        text: 'A warehouse stored 6,52,430 juice boxes. It sent 4,78,965 juice boxes to stores. How many juice boxes are still left in the warehouse?',
        answer: 173465,
        hint: 'Subtract the shipped boxes from the total stock and check borrowing.'
      },
      {
        text: 'A newspaper company prints 1,28,450 copies every day for 31 days. How many copies are printed in all?',
        answer: 3981950,
        hint: 'Split 31 into 30 + 1, then add both partial products.'
      },
      {
        text: 'A relief team packed 2,40,000 food packets equally into 30 trucks. How many food packets went into each truck?',
        answer: 8000,
        hint: 'Divide 24 by 3 first, then bring back the remaining zeros.'
      },
      {
        text: 'A cricket academy wants to reach 10,000 practice runs this month. The team already has 6,980 runs, and it scored 145 more runs today. How many more runs are still needed to reach 10,000?',
        answer: 2875,
        hint: "Add today’s runs to the current score, then subtract from 10,000."
      }
    ],
    animation: 'operationRush',
    next: '6.5'
  },

  /* ══════════════════════════════════════════════════════
     PAGE 6.5 — Operation Master (Final Celebration)
  ══════════════════════════════════════════════════════ */
  {
    id: '6.5',
    type: 'operation-master',
    title: 'Operation Master',
    subtitle: 'You solved large-number problems using all four operations.',
    badges: [
      { icon: '+',  label: 'Addition Expert' },
      { icon: '−', label: 'Borrowing Solver' },
      { icon: '×', label: 'Multiplication Builder' },
      { icon: '÷', label: 'Division Organizer' },
      { icon: '⇄', label: 'Two-Step Thinker' }
    ],
    animation: 'operationMaster',
    next: null
  }

];
