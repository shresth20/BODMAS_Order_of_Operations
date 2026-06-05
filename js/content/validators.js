/* validators.js - Validation stubs, populated per page type.
   Pure functions only. No DOM access. */

var ContentValidation = {

  /* Entry point: returns { valid: bool, reason: string } */
  validate: function (pageId, input) {
    var validator = this._validators[pageId];
    if (!validator) return { valid: false, reason: 'no-validator' };
    return validator(input);
  },

  /* Per-page validators added here as pages are implemented */
  _validators: {
    /* Example shape:
    '3.0': function(input) {
      var norm = String(input || '').trim().toLowerCase();
      if (!norm) return { valid: false, reason: 'empty' };
      return norm === '7,23,891' ? { valid: true, reason: 'correct' }
                                 : { valid: false, reason: 'wrong' };
    }
    */
  }

};
