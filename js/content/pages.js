/* pages.js — Level 1: × Before + | Level 2: × Before − | ... | Level 6: Brackets First
   Lesson plan: bodmas_lesson_plan_mechanics_sequence.md, Section 01–06
   NOTE: translatable text fields hold i18n KEYS (resolved by ContentRenderer
   via I18n.t at render time). Expressions, tokens and numeric data are literal. */

var GAME_HTP = {
  subtitle: 'htpSubtitle',
  steps: [
    'htpStep1',
    'htpStep2',
    'htpStep3',
    'htpStep4',
    'htpStep5',
    'htpStep6'
  ]
};

var CONTENT_PAGES = [

  // ═══════════════════════════════════════════════════════════
  // SECTION 01 — Level 1: × Before +
  // ═══════════════════════════════════════════════════════════

  {
    id: '1.0',
    type: 'l1-intro',
    scenario: 'lvl1Scenario',
    scenarioHtml: 'lvl1ScenarioHtml',
    expression: '3 × 4 + 2',
    question: 'lvl1Question',
    questionHtml: 'lvl1QuestionHtml',
    buttonLabel: 'btnStartExploring',
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
    title: 'revealTitle',
    ruleText: 'lvl1RuleText',
    workedSteps: [
      { expr: '3 + 4 × 2', hlTokens: ['4', '×', '2'] },
      { expr: '= 3 + 8', hlTokens: ['8'] },
      { expr: '= 11', hlTokens: [] }
    ],
    bodmasTag: 'lvl1BodmasTag',
    buttonLabel: 'btnContinue',
    next: '1.3'
  },

  {
    id: '1.3',
    type: 'l1-practice',
    animation: 'l1PracticeEntrance',
    questions: [
      {
        kind: 'tap-operator',
        prompt: 'promptWhichOpFirst',
        expression: '3 + 4 × 2',
        tokens: ['+', '×'],
        correctIndex: 1,
        wrongHint: 'hintMulDivFirst',
        okMsg: 'okMulBeforeAdd'
      },
      {
        kind: 'choose-rule',
        prompt: 'promptWhichRule',
        expression: '7 + 2 × 5',
        options: ['optMulBeforeAdd', 'optLeftToRight'],
        correctIndex: 0,
        wrongHint: 'hintXHereFirst',
        okMsg: 'okMultiplyBeforeAdd'
      },
      {
        kind: 'which-method',
        prompt: 'promptWhichMethod',
        expression: '6 + 2 × 3',
        methods: [
          { label: 'methodMultiplicationFirst', steps: ['6 + 2 × 3', '6 + 6 = 12'], answer: 12, correct: true },
          { label: 'methodLeftToRight', steps: ['6 + 2 × 3', '8 × 3 = 24'], answer: 24, correct: false }
        ],
        okMsg: 'okAlwaysMulBeforeAdd',
        wrongHint: 'hintLookForMul'
      }
    ],
    completionMsg: 'lvl1Completion',
    next: '2.0'
  },

  // ═══════════════════════════════════════════════════════════
  // SECTION 02 — Level 2: × Before −
  // ═══════════════════════════════════════════════════════════

  {
    id: '2.0',
    type: 'l2-intro',
    scenario: 'lvl2Scenario',
    scenarioHtml: 'lvl2ScenarioHtml',
    expression: '20 − 3 × 4',
    question: 'lvl2Question',
    questionHtml: 'lvl2QuestionHtml',
    buttonLabel: 'btnStartExploring',
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
    title: 'revealTitle',
    ruleText: 'lvl2RuleText',
    workedSteps: [
      { expr: '10 − 3 × 2', hlTokens: ['3', '×', '2'] },
      { expr: '= 10 − 6', hlTokens: ['6'] },
      { expr: '= 4', hlTokens: [] }
    ],
    bodmasTag: 'lvl2BodmasTag',
    buttonLabel: 'btnContinue',
    next: '2.3'
  },

  {
    id: '2.3',
    type: 'l2-practice',
    animation: 'l2PracticeEntrance',
    questions: [
      {
        kind: 'tap-operator',
        prompt: 'promptWhichOpFirst',
        expression: '10 − 3 × 2',
        tokens: ['−', '×'],
        correctIndex: 1,
        wrongHint: 'hintMulDivFirst',
        okMsg: 'okMulBeforeSub'
      },
      {
        kind: 'choose-rule',
        prompt: 'promptWhichRule',
        expression: '8 − 2 × 3',
        options: ['optMulBeforeSub', 'optLeftToRight'],
        correctIndex: 0,
        wrongHint: 'hintXHereFirst',
        okMsg: 'okMultiplyBeforeSubtract'
      },
      {
        kind: 'which-method',
        prompt: 'promptWhichMethod',
        expression: '15 − 3 × 4',
        methods: [
          { label: 'methodMultiplicationFirst', steps: ['15 − 3 × 4', '3 × 4 = 12', '15 − 12 = 3'], answer: 3, correct: true },
          { label: 'methodLeftToRight', steps: ['15 − 3 × 4', '15 − 3 = 12', '12 × 4 = 48'], answer: 48, correct: false }
        ],
        okMsg: 'okAlwaysMulBeforeSub',
        wrongHint: 'hintLookForMul'
      }
    ],
    completionMsg: 'lvl2Completion',
    next: '3.0'
  },

  // ═══════════════════════════════════════════════════════════
  // SECTION 03 — Level 3: ÷ Before + and −
  // ═══════════════════════════════════════════════════════════

  {
    id: '3.0',
    type: 'l3-intro',
    scenarioHtml: 'lvl3ScenarioHtml',
    expression: '12 ÷ 3 + 5',
    question: 'lvl3Question',
    questionHtml: 'lvl3QuestionHtml',
    buttonLabel: 'btnStartExploring',
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
    title: 'revealTitle',
    ruleText: 'lvl3RuleText',
    workedSteps: [
      { expr: '10 + 12 ÷ 3', hlTokens: ['12', '÷', '3'] },
      { expr: '= 10 + 4', hlTokens: ['4'] },
      { expr: '= 14', hlTokens: [] }
    ],
    bodmasTag: 'lvl3BodmasTag',
    buttonLabel: 'btnContinue',
    next: '3.3'
  },

  {
    id: '3.3',
    type: 'l3-practice',
    animation: 'l3PracticeEntrance',
    questions: [
      {
        kind: 'tap-operator',
        prompt: 'promptWhichOpFirst',
        expression: '8 + 6 ÷ 2',
        tokens: ['+', '÷'],
        correctIndex: 1,
        wrongHint: 'hintDivMulFirst',
        okMsg: 'okDivBeforeAdd'
      },
      {
        kind: 'choose-rule',
        prompt: 'promptWhichRule',
        expression: '5 + 9 ÷ 3',
        options: ['optDivBeforeAdd', 'optLeftToRight'],
        correctIndex: 0,
        wrongHint: 'hintDivHereFirst',
        okMsg: 'okDivisionBeforeAddition'
      },
      {
        kind: 'which-method',
        prompt: 'promptWhichMethod',
        expression: '12 + 8 ÷ 4',
        methods: [
          { label: 'methodDivisionFirst', steps: ['12 + 8 ÷ 4', '8 ÷ 4 = 2', '12 + 2 = 14'], answer: 14, correct: true },
          { label: 'methodLeftToRight', steps: ['12 + 8 ÷ 4', '12 + 8 = 20', '20 ÷ 4 = 5'], answer: 5, correct: false }
        ],
        okMsg: 'okAlwaysDivBeforeAdd',
        wrongHint: 'hintLookForDiv'
      }
    ],
    completionMsg: 'lvl3Completion',
    next: '4.0'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 04 — + and − Have Equal Priority (Left to Right)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: '4.0',
    type: 'l4-intro',
    scenarioHtml: 'lvl4ScenarioHtml',
    expression: '10 − 4 + 3',
    question: 'lvl4Question',
    questionHtml: 'lvl4QuestionHtml',
    buttonLabel: 'btnStartExploring',
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
    ruleTitle: 'revealTitle',
    ruleText: 'lvl4RuleText',
    workedSteps: [
      { expr: '10 − 4 + 3', hlTokens: ['10', '−', '4'] },
      { expr: '= 6 + 3', hlTokens: ['6'] },
      { expr: '= 9', hlTokens: [] }
    ],
    bodmasTag: 'lvl4BodmasTag',
    buttonLabel: 'btnContinue',
    next: '4.3'
  },

  {
    id: '4.3',
    type: 'l4-practice',
    animation: 'l4PracticeEntrance',
    questions: [
      {
        kind: 'tap-operator',
        prompt: 'promptTapOpFirst',
        expression: '10 − 4 + 3',
        tokens: ['−', '+'],
        correctIndex: 0,
        okMsg: 'okLeftmostSubFirst',
        wrongHint: 'hintAddSubEqualSolveLtr'
      },
      {
        kind: 'choose-rule',
        prompt: 'promptWhichRule',
        expression: '8 − 3 + 5',
        options: ['optLeftToRight', 'optAddBeforeSub'],
        correctIndex: 0,
        okMsg: 'okAddSubLtr',
        wrongHint: 'hintAddSubNoPriority'
      },
      {
        kind: 'which-method',
        prompt: 'promptWhichMethod',
        expression: '10 − 3 + 5',
        methods: [
          { label: 'methodLeftToRight', steps: ['10 − 3 + 5', '10 − 3 = 7', '7 + 5 = 12'], answer: 12, correct: true },
          { label: 'methodAdditionFirst', steps: ['10 − 3 + 5', '3 + 5 = 8', '10 − 8 = 2'], answer: 2, correct: false }
        ],
        okMsg: 'okAlwaysAddSubLtr',
        wrongHint: 'hintAddSubGoLtr'
      }
    ],
    completionMsg: 'lvl4Completion',
    next: '5.0'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 05 — × and ÷ Have Equal Priority (Left to Right)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: '5.0',
    type: 'l5-intro',
    scenarioHtml: 'lvl5ScenarioHtml',
    expression: '12 ÷ 2 × 3',
    question: 'lvl5Question',
    questionHtml: 'lvl5QuestionHtml',
    buttonLabel: 'btnStartExploring',
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
    ruleTitle: 'revealTitle',
    ruleText: 'lvl5RuleText',
    workedSteps: [
      { expr: '12 ÷ 2 × 3', hlTokens: ['12', '÷', '2'] },
      { expr: '= 6 × 3', hlTokens: ['6'] },
      { expr: '= 18', hlTokens: [] }
    ],
    bodmasTag: 'lvl5BodmasTag',
    buttonLabel: 'btnContinue',
    next: '5.3'
  },

  {
    id: '5.3',
    type: 'l5-practice',
    animation: 'l5PracticeEntrance',
    questions: [
      {
        kind: 'tap-operator',
        prompt: 'promptTapOpFirst',
        expression: '12 ÷ 4 × 3',
        tokens: ['÷', '×'],
        correctIndex: 0,
        okMsg: 'okLeftmostDivFirst',
        wrongHint: 'hintMulDivEqualSolveLtr'
      },
      {
        kind: 'choose-rule',
        prompt: 'promptWhichRule',
        expression: '8 ÷ 2 × 3',
        options: ['optLeftToRight', 'optMulBeforeDiv'],
        correctIndex: 0,
        okMsg: 'okMulDivLtr',
        wrongHint: 'hintMulDivNoPriority'
      },
      {
        kind: 'which-method',
        prompt: 'promptWhichMethod',
        expression: '24 ÷ 4 × 2',
        methods: [
          { label: 'methodLeftToRight', steps: ['24 ÷ 4 × 2', '24 ÷ 4 = 6', '6 × 2 = 12'], answer: 12, correct: true },
          { label: 'methodMultiplicationFirst', steps: ['24 ÷ 4 × 2', '4 × 2 = 8', '24 ÷ 8 = 3'], answer: 3, correct: false }
        ],
        okMsg: 'okAlwaysMulDivLtr',
        wrongHint: 'hintMulDivGoLtr'
      }
    ],
    completionMsg: 'lvl5Completion',
    next: '6.0'
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SECTION 06 — Brackets First
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: '6.0',
    type: 'l6-intro',
    scenarioHtml: 'lvl6ScenarioHtml',
    expression: '3 \xd7 (4 + 2)',
    question: 'lvl6Question',
    questionHtml: 'lvl6QuestionHtml',
    buttonLabel: 'btnStartExploring',
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
    ruleTitle: 'revealTitle',
    ruleText: 'lvl6RuleText',
    workedSteps: [
      { expr: '(2 + 3) \xd7 4', hlTokens: ['(2', '+', '3)'] },
      { expr: '= 5 \xd7 4', hlTokens: ['5'] },
      { expr: '= 20', hlTokens: [] }
    ],
    bodmasTag: 'lvl6BodmasTag',
    buttonLabel: 'btnContinue',
    next: '6.3'
  },

  {
    id: '6.3',
    type: 'l6-practice',
    animation: 'l6PracticeEntrance',
    questions: [
      {
        kind: 'tap-operator',
        prompt: 'promptWhichOpFirst',
        expression: '(3 + 4) \xd7 2',
        tokens: ['+', '\xd7'],
        correctIndex: 0,
        wrongHint: 'hintBracketsFirstSolveInside',
        okMsg: 'okPlusInsideFirst'
      },
      {
        kind: 'choose-rule',
        prompt: 'promptWhichRule',
        expression: '(5 + 1) \xd7 3',
        options: ['optBracketsFirst', 'optMulBeforeAdd'],
        correctIndex: 0,
        wrongHint: 'hintSeeBrackets',
        okMsg: 'okBracketsBeforeMul'
      },
      {
        kind: 'which-method',
        prompt: 'promptWhichMethod',
        expression: '(4 + 2) \xd7 3',
        methods: [
          { label: 'methodBracketsFirst', steps: ['(4 + 2) \xd7 3', '4 + 2 = 6', '6 \xd7 3 = 18'], answer: 18, correct: true },
          { label: 'methodMultiplicationFirst', steps: ['(4 + 2) \xd7 3', '2 \xd7 3 = 6', '4 + 6 = 10'], answer: 10, correct: false }
        ],
        okMsg: 'okAlwaysBracketsFirst',
        wrongHint: 'hintLookForBrackets'
      }
    ],
    completionMsg: 'lvl6Completion',
    next: '8.0'
  },

  // ═══════════════════════════════════════════════════════════
  // SECTION 08 — BODMAS Ladder (Slide 14)
  // ═══════════════════════════════════════════════════════════

  {
    id: '8.0',
    type: 'l8-bodmas-ladder',
    instruction: 'lvl8Instruction',
    tiles: [
      { id: 'O', letter: 'O', word: 'wordOrders',         label: 'tileLabelOrders',         colorKey: 'blue'   },
      { id: 'B', letter: 'B', word: 'wordBrackets',       label: 'tileLabelBrackets',       colorKey: 'orange' },
      { id: 'S', letter: 'S', word: 'wordSubtraction',    label: 'tileLabelSubtraction',    colorKey: 'teal'   },
      { id: 'A', letter: 'A', word: 'wordAddition',       label: 'tileLabelAddition',       colorKey: 'green'  },
      { id: 'D', letter: 'D', word: 'wordDivision',       label: 'tileLabelDivision',       colorKey: 'pink'   },
      { id: 'M', letter: 'M', word: 'wordMultiplication', label: 'tileLabelMultiplication', colorKey: 'purple' }
    ],
    correctOrder: ['B', 'O', 'D', 'M', 'A', 'S'],
    wrongHint: 'lvl8WrongHint',
    completionMsg: 'lvl8Completion',
    next: '9.0'
  },

  // ═══════════════════════════════════════════════════════════
  // SECTION 09 — Nested Brackets Challenge (Slide 15)
  // ═══════════════════════════════════════════════════════════

  {
    id: '9.0',
    type: 'l9-nested-brackets',
    instruction: 'lvl9NbInstruction',
    hintInner: 'lvl9HintInner',
    hintMiddle: 'lvl9HintMiddle',
    hintLast: 'lvl9HintLast',
    wrongHint: 'lvl9NbWrongHint',
    questions: [
      {
        label: 'lvl9bQ1Label',
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
        label: 'lvl9bQ2Label',
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
    title: 'lvl9IbTitle',
    instruction: 'lvl9IbInstruction',
    subInstruction: 'lvl9IbSubInstruction',
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
    title: 'lvl9BrTitle',
    questions: [
      {
        n: 1, rule: 'ruleMulBeforeAdd', expr: '7 + 2 × 3', correctOp: '×', answer: 13,
        okMsg: 'lvl9BrQ1Ok'
      },
      {
        n: 2, rule: 'ruleMulBeforeSub', expr: '15 − 2 × 4', correctOp: '×', answer: 7,
        okMsg: 'lvl9BrQ2Ok'
      },
      {
        n: 3, rule: 'ruleDivBeforeAddSub', expr: '5 + 12 ÷ 4', correctOp: '÷', answer: 8,
        okMsg: 'lvl9BrQ3Ok'
      },
      {
        n: 4, rule: 'ruleAddSubLtr', expr: '11 − 4 + 2', correctOp: '−', answer: 9,
        okMsg: 'lvl9BrQ4Ok'
      },
      {
        n: 5, rule: 'ruleMulDivLtr', expr: '18 ÷ 3 × 2', correctOp: '÷', answer: 12,
        okMsg: 'lvl9BrQ5Ok'
      },
      {
        n: 6, rule: 'ruleBracketsFirst', expr: '( 5 + 3 ) × 4', correctOp: '+', answer: 32,
        okMsg: 'lvl9BrQ6Ok'
      }
    ],
    stepOrder: {
      n: 7,
      label: 'lvl9StepOrderLabel',
      expression: '24 ÷ (6 − 2) + 3 × 2',
      steps: [
        { id: 'brackets', label: 'lvl9Step1Label' },
        { id: 'div', label: 'lvl9Step2Label' },
        { id: 'mul', label: 'lvl9Step3Label' },
        { id: 'add', label: 'lvl9Step4Label' }
      ],
      correctOrder: ['brackets', 'div', 'mul', 'add'],
      wrongHint: 'lvl9StepWrongHint',
      successMsg: 'lvl9StepSuccess'
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
