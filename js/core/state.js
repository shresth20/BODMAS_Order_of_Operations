/* GameState — singleton on global scope */

var GameState = {
  currentScreen:   'loading',
  currentQuestion: 0,
  score:           0,
  wrongCount:      0,
  selectedAnswer:  null,
  isSubmitted:     false,
  isAnimating:     false,

  reset: function() {
    this.currentScreen   = 'loading';
    this.currentQuestion = 0;
    this.score           = 0;
    this.wrongCount      = 0;
    this.selectedAnswer  = null;
    this.isSubmitted     = false;
    this.isAnimating     = false;
  },

  canSubmit: function() {
    return this.selectedAnswer !== null && !this.isSubmitted && !this.isAnimating;
  }
};
