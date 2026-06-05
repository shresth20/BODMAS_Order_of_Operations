/* frames.js — Programmatic frame switcher (no UI).
   frame--1: Explanation Frame  (intro slides, rule reveals, summary)
   frame--2: Question / Activity Frame  (interactive screens)
   Usage: FrameManager.switchTo(1) or FrameManager.switchTo(2) */

'use strict';

const FrameManager = {
  _current: 2,

  init() {
    document.body.classList.add(`frame--${this._current}`);
  },

  switchTo(id) {
    if (id !== 1 && id !== 2) return;
    if (id === this._current) return;
    document.body.classList.replace(`frame--${this._current}`, `frame--${id}`);
    this._current = id;
  },

  getCurrent() {
    return this._current;
  }
};

document.addEventListener('DOMContentLoaded', () => FrameManager.init());
