# VO Narration Table — MT06A01_L01_S07 — BODMAS (Order of Operations)

Drop all MP3 files into: assets/sounds/vo/

## Summary

| Screen | JS Function | Clips | Sheet tab |
|--------|-------------|-------|-----------|
| S1.0 — L1 Intro (× before +) | _renderL1Intro() | 2 | S1.0 — L1 Intro (× before +) |
| S1.1 — L1 Math Lab | _renderL1Lab() | 7 | S1.1 — L1 Math Lab |
| S1.2 — L1 Rule Reveal | _renderL1Reveal() | 3 | S1.2 — L1 Rule Reveal |
| S1.3 — L1 Practice | _renderL1Practice() | 10 | S1.3 — L1 Practice |
| S2.0 — L2 Intro (× before −) | _renderL2Intro() | 2 | S2.0 — L2 Intro (× before −) |
| S2.1 — L2 Math Lab | _renderL2Lab() | 7 | S2.1 — L2 Math Lab |
| S2.2 — L2 Rule Reveal | _renderL2Reveal() | 3 | S2.2 — L2 Rule Reveal |
| S2.3 — L2 Practice | _renderL2Practice() | 10 | S2.3 — L2 Practice |
| S3.0 — L3 Intro (÷ before + −) | _renderL3Intro() | 2 | S3.0 — L3 Intro (÷ before + −) |
| S3.1 — L3 Math Lab | _renderL3Lab() | 7 | S3.1 — L3 Math Lab |
| S3.2 — L3 Rule Reveal | _renderL3Reveal() | 3 | S3.2 — L3 Rule Reveal |
| S3.3 — L3 Practice | _renderL3Practice() | 10 | S3.3 — L3 Practice |
| S4.0 — L4 Intro (+ − left to right) | _renderL4Intro() | 2 | S4.0 — L4 Intro (+ − left to right) |
| S4.1 — L4 Math Lab | _renderL4Lab() | 7 | S4.1 — L4 Math Lab |
| S4.2 — L4 Rule Reveal | _renderL4Reveal() | 3 | S4.2 — L4 Rule Reveal |
| S4.3 — L4 Practice | _renderL4Practice() | 10 | S4.3 — L4 Practice |
| S5.0 — L5 Intro (× ÷ left to right) | _renderL5Intro() | 2 | S5.0 — L5 Intro (× ÷ left to right) |
| S5.1 — L5 Math Lab | _renderL5Lab() | 7 | S5.1 — L5 Math Lab |
| S5.2 — L5 Rule Reveal | _renderL5Reveal() | 3 | S5.2 — L5 Rule Reveal |
| S5.3 — L5 Practice | _renderL5Practice() | 10 | S5.3 — L5 Practice |
| S6.0 — L6 Intro (brackets first) | _renderL6Intro() | 2 | S6.0 — L6 Intro (brackets first) |
| S6.1 — L6 Math Lab | _renderL6Lab() | 7 | S6.1 — L6 Math Lab |
| S6.2 — L6 Rule Reveal | _renderL6Reveal() | 3 | S6.2 — L6 Rule Reveal |
| S6.3 — L6 Practice | _renderL6Practice() | 10 | S6.3 — L6 Practice |
| S8.0 — BODMAS Ladder | _renderL8BodmasLadder() | 4 | S8.0 — BODMAS Ladder |
| S9.0 — Nested Brackets | _renderL9NestedBrackets() | 8 | S9.0 — Nested Brackets |
| S9.1 — Insert the Brackets | _renderL9InsertBrackets() | 6 | S9.1 — Insert the Brackets |
| S9.2 — Final BODMAS Review | _renderL9BodmasReview() | 9 | S9.2 — Final BODMAS Review |
| S9.3 — BODMAS Champion Results | _renderL9Results() | 2 | S9.3 — BODMAS Champion Results |

## S1.0 — L1 Intro (× before +)   —   _renderL1Intro()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s1_0_scenario | s1_0_scenario.mp3 | Screen mounts | 0 ms | A child buys 3 packets of crayons with 4 crayons each, and gets 2 extra crayons. |  | fresh entry only; Start button is gated on narration end; verbatim scenario text |
| 2 | s1_0_question | s1_0_question.mp3 | Question appears | on appear | How many crayons in all? Which part do you solve first? |  | chained off previous clip's ended event; verbatim question text |

## S1.1 — L1 Math Lab   —   _renderL1Lab()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s1_1_intro | s1_1_intro.mp3 | Screen mounts | 0 ms | Watch the board! Which part should we solve first? Tap it! |  | fresh entry only; verbatim guide-bar line |
| 2 | s1_1_wrong_tap | s1_1_wrong_tap.mp3 | Wrong group tapped | on wrong | Look again. Is there a multiplication sign in the sum? |  | deterministic — same wrong tap replays this cue; verbatim Meera bubble (magnifier emoji stripped, "×" folded into "multiplication sign") |
| 3 | s1_1_correct_tap | s1_1_correct_tap.mp3 | Correct × group tapped | on correct | Yes! Times goes first! Brilliant! Watch them come together! |  | reads Meera's praise bubble + guide bar (star emoji stripped, × voiced "times") |
| 4 | s1_1_tap_finish | s1_1_tap_finish.mp3 | Merged tile shown, one operator left | on update | Great! Now tap plus to finish. |  | verbatim guide bar ("+" voiced "plus" — fixed for this level) |
| 5 | s1_1_compare | s1_1_compare.mp3 | Compare panel appears | on reveal | Two different answers for the same sum! Multiplication first gives [answer]. |  | rounds 1 and 3 only (hasCompare); reads compare caption + method card; sum and answer vary — voiced generically; the wrong-path value is never rendered on screen, so it is not voiced |
| 6 | s1_1_next_round | s1_1_next_round.mp3 | Next round loads | on load | Next round! Tap what to solve first! |  | fires when rounds 2–4 load; "Next round" voices the round counter generically ("Round [n] of 4"); rest verbatim Meera bubble |
| 7 | s1_1_complete | s1_1_complete.mp3 | All 4 rounds done | on complete | Lab complete! You found the rule yourself. |  | authored — no on-screen text for this moment (guide bar clears; "See the Rule" button appears) |

## S1.2 — L1 Rule Reveal   —   _renderL1Reveal()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s1_2_rule | s1_2_rule.mp3 | Screen mounts | 0 ms | You found the rule! When a sum has times and plus, solve multiplication first, then plus. |  | fresh entry only; verbatim title + rule line (symbols voiced as words) |
| 2 | s1_2_worked | s1_2_worked.mp3 | Worked steps animate | on reveal | 3 plus 4 times 2 becomes 3 plus 8. That's 11. |  | reads the worked rows as spoken; values fixed in storyboard — voiced exactly |
| 3 | s1_2_bodmas_tag | s1_2_bodmas_tag.mp3 | BODMAS tag appears | on reveal | Multiplication is done before addition. |  | verbatim tag line |

## S1.3 — L1 Practice   —   _renderL1Practice()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s1_3_q1 | s1_3_q1.mp3 | Screen mounts (Q1 shows) | 0 ms | Which operator do you calculate first? |  | fresh entry only; verbatim Q1 prompt only — counter and expression not voiced; answer interactions stay usable |
| 2 | s1_3_q1_correct | s1_3_q1_correct.mp3 | Correct operator tapped (Q1) | on correct | Correct! |  | confirmation word only — the rule/answer stays on-screen text, never voiced in practice |
| 3 | s1_3_q1_wrong | s1_3_q1_wrong.mp3 | Wrong operator tapped (Q1) | on wrong | Try again! |  | deterministic; authored neutral retry — the on-screen hint contains the answer and is not voiced |
| 4 | s1_3_q2 | s1_3_q2.mp3 | Question 2 loads | on load | Which rule applies here? |  | verbatim Q2 prompt only — counter and expression not voiced; answer options stay on-screen text, not voiced |
| 5 | s1_3_q2_correct | s1_3_q2_correct.mp3 | Correct rule chosen (Q2) | on correct | Right! |  | confirmation word only — the rule/answer stays on-screen text, never voiced in practice |
| 6 | s1_3_q2_wrong | s1_3_q2_wrong.mp3 | Wrong rule chosen (Q2) | on wrong | Try again! |  | deterministic; authored neutral retry — the on-screen hint contains the answer and is not voiced |
| 7 | s1_3_q3 | s1_3_q3.mp3 | Question 3 loads | on load | Which method is correct? |  | verbatim Q3 prompt only — counter and expression not voiced; the two method cards contain answers and are not voiced |
| 8 | s1_3_q3_correct | s1_3_q3_correct.mp3 | Correct method chosen (Q3) | on correct | Correct! |  | confirmation word only — the rule/answer stays on-screen text, never voiced in practice |
| 9 | s1_3_q3_wrong | s1_3_q3_wrong.mp3 | Wrong method chosen (Q3) | on wrong | Try again! |  | deterministic; authored neutral retry — the on-screen hint contains the answer and is not voiced |
| 10 | s1_3_complete | s1_3_complete.mp3 | All 3 questions done | on complete | Excellent! You've mastered times before plus! |  |  |

## S2.0 — L2 Intro (× before −)   —   _renderL2Intro()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s2_0_scenario | s2_0_scenario.mp3 | Screen mounts | 0 ms | A shopkeeper has 20 bananas. He sells 3 baskets with 4 bananas each. |  | fresh entry only; Start button is gated on narration end; verbatim scenario text |
| 2 | s2_0_question | s2_0_question.mp3 | Question appears | on appear | How many bananas are left? Which part do you solve first? |  | chained off previous clip's ended event |

## S2.1 — L2 Math Lab   —   _renderL2Lab()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s2_1_intro | s2_1_intro.mp3 | Screen mounts | 0 ms | Watch the board! Which part should we solve first? Tap it! |  | fresh entry only; verbatim guide-bar line |
| 2 | s2_1_wrong_tap | s2_1_wrong_tap.mp3 | Wrong group tapped | on wrong | Look again. Is there a multiplication sign in the sum? |  | deterministic; verbatim Meera bubble (magnifier emoji stripped, "×" folded into "multiplication sign") |
| 3 | s2_1_correct_tap | s2_1_correct_tap.mp3 | Correct × group tapped | on correct | Yes! Times goes first! Brilliant! Watch them come together! |  | reads Meera's praise bubble + guide bar (star emoji stripped, × voiced "times") |
| 4 | s2_1_tap_finish | s2_1_tap_finish.mp3 | Merged tile shown, one operator left | on update | Great! Now tap minus to finish. |  | verbatim guide bar ("−" voiced "minus" — fixed for this level) |
| 5 | s2_1_compare | s2_1_compare.mp3 | Compare panel appears | on reveal | Two different answers for the same sum! Multiplication first gives [answer]. |  | rounds 1 and 3 only (hasCompare); reads compare caption + method card; sum and answer vary — voiced generically; the wrong-path value is never rendered on screen, so it is not voiced |
| 6 | s2_1_next_round | s2_1_next_round.mp3 | Next round loads | on load | Next round! Tap what to solve first! |  | fires when rounds 2–4 load; "Next round" voices the round counter generically; rest verbatim Meera bubble |
| 7 | s2_1_complete | s2_1_complete.mp3 | All 4 rounds done | on complete | Lab complete! You found the rule yourself. |  | authored — no on-screen text for this moment (guide bar clears; "See the Rule" button appears) |

## S2.2 — L2 Rule Reveal   —   _renderL2Reveal()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s2_2_rule | s2_2_rule.mp3 | Screen mounts | 0 ms | You found the rule! When a sum has times and minus, solve times first, then minus. |  | fresh entry only; verbatim title + rule line (symbols voiced as words) |
| 2 | s2_2_worked | s2_2_worked.mp3 | Worked steps animate | on reveal | 10 minus 3 times 2 becomes 10 minus 6. That's 4. |  | reads the worked rows as spoken; values fixed in storyboard — voiced exactly |
| 3 | s2_2_bodmas_tag | s2_2_bodmas_tag.mp3 | BODMAS tag appears | on reveal | Multiplication is done before subtraction. |  | verbatim tag line |

## S2.3 — L2 Practice   —   _renderL2Practice()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s2_3_q1 | s2_3_q1.mp3 | Screen mounts (Q1 shows) | 0 ms | Which operator do you calculate first? |  | fresh entry only; verbatim Q1 prompt only — counter and expression not voiced; answer interactions stay usable |
| 2 | s2_3_q1_correct | s2_3_q1_correct.mp3 | Correct operator tapped (Q1) | on correct | Correct! |  | confirmation word only — the rule/answer stays on-screen text, never voiced in practice |
| 3 | s2_3_q1_wrong | s2_3_q1_wrong.mp3 | Wrong operator tapped (Q1) | on wrong | Try again! |  | deterministic; authored neutral retry — the on-screen hint contains the answer and is not voiced |
| 4 | s2_3_q2 | s2_3_q2.mp3 | Question 2 loads | on load | Which rule applies here? |  | verbatim Q2 prompt only — counter and expression not voiced; answer options stay on-screen text, not voiced |
| 5 | s2_3_q2_correct | s2_3_q2_correct.mp3 | Correct rule chosen (Q2) | on correct | Right! |  | confirmation word only — the rule/answer stays on-screen text, never voiced in practice |
| 6 | s2_3_q2_wrong | s2_3_q2_wrong.mp3 | Wrong rule chosen (Q2) | on wrong | Try again! |  | deterministic; authored neutral retry — the on-screen hint contains the answer and is not voiced |
| 7 | s2_3_q3 | s2_3_q3.mp3 | Question 3 loads | on load | Which method is correct? |  | verbatim Q3 prompt only — counter and expression not voiced; the two method cards contain answers and are not voiced |
| 8 | s2_3_q3_correct | s2_3_q3_correct.mp3 | Correct method chosen (Q3) | on correct | Correct! |  | confirmation word only — the rule/answer stays on-screen text, never voiced in practice |
| 9 | s2_3_q3_wrong | s2_3_q3_wrong.mp3 | Wrong method chosen (Q3) | on wrong | Try again! |  | deterministic; authored neutral retry — the on-screen hint contains the answer and is not voiced |
| 10 | s2_3_complete | s2_3_complete.mp3 | All 3 questions done | on complete | Excellent! You've mastered times before minus! |  |  |

## S3.0 — L3 Intro (÷ before + −)   —   _renderL3Intro()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s3_0_scenario | s3_0_scenario.mp3 | Screen mounts | 0 ms | 12 laddoos are shared equally among 3 children, and 5 more laddoos are added. |  | fresh entry only; Start button is gated on narration end |
| 2 | s3_0_question | s3_0_question.mp3 | Question appears | on appear | How many laddoos in total? Which part do you solve first? |  | chained off previous clip's ended event |

## S3.1 — L3 Math Lab   —   _renderL3Lab()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s3_1_intro | s3_1_intro.mp3 | Screen mounts | 0 ms | Watch the board! Which part should we solve first? Tap it! |  | fresh entry only; verbatim guide-bar line |
| 2 | s3_1_wrong_tap | s3_1_wrong_tap.mp3 | Wrong group tapped | on wrong | Look again. Is there a division sign in the sum? |  | deterministic; verbatim Meera bubble (magnifier emoji stripped, "÷" folded into "division sign") |
| 3 | s3_1_correct_tap | s3_1_correct_tap.mp3 | Correct ÷ group tapped | on correct | Yes! Divide goes first! Brilliant! Watch them come together! |  | reads Meera's praise bubble + guide bar (star emoji stripped, ÷ voiced "divide") |
| 4 | s3_1_tap_finish | s3_1_tap_finish.mp3 | Merged tile shown, one operator left | on update | Great! Now tap the last sign to finish. |  | screen names the actual operator ("+" or "−", varies per round) — voiced generically |
| 5 | s3_1_compare | s3_1_compare.mp3 | Compare panel appears | on reveal | Two different answers for the same sum! Division first gives [answer]. |  | rounds 1 and 3 only (hasCompare); reads compare caption + method card; sum and answer vary — voiced generically; the wrong-path value is never rendered on screen, so it is not voiced |
| 6 | s3_1_next_round | s3_1_next_round.mp3 | Next round loads | on load | Next round! Tap what to solve first! |  | fires when rounds 2–4 load; "Next round" voices the round counter generically; rest verbatim Meera bubble |
| 7 | s3_1_complete | s3_1_complete.mp3 | All 4 rounds done | on complete | Lab complete! You found the rule yourself. |  | authored — no on-screen text for this moment (guide bar clears; "See the Rule" button appears) |

## S3.2 — L3 Rule Reveal   —   _renderL3Reveal()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s3_2_rule | s3_2_rule.mp3 | Screen mounts | 0 ms | You found the rule! When a sum has divide and plus or minus, solve divide first. |  | fresh entry only; verbatim title + rule line (symbols voiced as words) |
| 2 | s3_2_worked | s3_2_worked.mp3 | Worked steps animate | on reveal | 10 plus 12 divided by 3 becomes 10 plus 4. That's 14. |  | reads the worked rows as spoken; values fixed in storyboard — voiced exactly |
| 3 | s3_2_bodmas_tag | s3_2_bodmas_tag.mp3 | BODMAS tag appears | on reveal | Division is done before addition and subtraction. |  | verbatim tag line |

## S3.3 — L3 Practice   —   _renderL3Practice()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s3_3_q1 | s3_3_q1.mp3 | Screen mounts (Q1 shows) | 0 ms | Which operator do you calculate first? |  | fresh entry only; verbatim Q1 prompt only — counter and expression not voiced; answer interactions stay usable |
| 2 | s3_3_q1_correct | s3_3_q1_correct.mp3 | Correct operator tapped (Q1) | on correct | Correct! |  | confirmation word only — the rule/answer stays on-screen text, never voiced in practice |
| 3 | s3_3_q1_wrong | s3_3_q1_wrong.mp3 | Wrong operator tapped (Q1) | on wrong | Try again! |  | deterministic; authored neutral retry — the on-screen hint contains the answer and is not voiced |
| 4 | s3_3_q2 | s3_3_q2.mp3 | Question 2 loads | on load | Which rule applies here? |  | verbatim Q2 prompt only — counter and expression not voiced; answer options stay on-screen text, not voiced |
| 5 | s3_3_q2_correct | s3_3_q2_correct.mp3 | Correct rule chosen (Q2) | on correct | Right! |  | confirmation word only — the rule/answer stays on-screen text, never voiced in practice |
| 6 | s3_3_q2_wrong | s3_3_q2_wrong.mp3 | Wrong rule chosen (Q2) | on wrong | Try again! |  | deterministic; authored neutral retry — the on-screen hint contains the answer and is not voiced |
| 7 | s3_3_q3 | s3_3_q3.mp3 | Question 3 loads | on load | Which method is correct? |  | verbatim Q3 prompt only — counter and expression not voiced; the two method cards contain answers and are not voiced |
| 8 | s3_3_q3_correct | s3_3_q3_correct.mp3 | Correct method chosen (Q3) | on correct | Correct! |  | confirmation word only — the rule/answer stays on-screen text, never voiced in practice |
| 9 | s3_3_q3_wrong | s3_3_q3_wrong.mp3 | Wrong method chosen (Q3) | on wrong | Try again! |  | deterministic; authored neutral retry — the on-screen hint contains the answer and is not voiced |
| 10 | s3_3_complete | s3_3_complete.mp3 | All 3 questions done | on complete | Excellent! You've mastered divide before plus and minus! |  |  |

## S4.0 — L4 Intro (+ − left to right)   —   _renderL4Intro()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s4_0_scenario | s4_0_scenario.mp3 | Screen mounts | 0 ms | Riya has 10 stickers, gives away 4, then gets 3 more. |  | fresh entry only; Start button is gated on narration end; verbatim scenario text |
| 2 | s4_0_question | s4_0_question.mp3 | Question appears | on appear | How many stickers does Riya have now? Which part do you solve first? |  | chained off previous clip's ended event |

## S4.1 — L4 Math Lab   —   _renderL4Lab()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s4_1_intro | s4_1_intro.mp3 | Screen mounts | 0 ms | Watch the board! Which part should we solve first? Tap it! |  | fresh entry only; verbatim guide-bar line |
| 2 | s4_1_wrong_tap | s4_1_wrong_tap.mp3 | Wrong group tapped | on wrong | Which plus or minus appears first from left to right? |  | deterministic; verbatim Meera bubble (magnifier emoji stripped, symbols voiced as words) |
| 3 | s4_1_correct_tap | s4_1_correct_tap.mp3 | Correct leftmost group tapped | on correct | Yes! Left to right! Brilliant! Watch them come together! |  | reads Meera's praise bubble + guide bar (star emoji stripped) |
| 4 | s4_1_tap_finish | s4_1_tap_finish.mp3 | Merged tile shown, one operator left | on update | Great! Now tap the last sign to finish. |  | screen names the actual operator ("+" or "−", varies per round) — voiced generically |
| 5 | s4_1_compare | s4_1_compare.mp3 | Compare panel appears | on reveal | Two different answers for the same sum! Left to right gives [answer]. |  | rounds 1 and 3 only (hasCompare); reads compare caption + method card; sum and answer vary — voiced generically; the wrong-path value is never rendered on screen, so it is not voiced |
| 6 | s4_1_next_round | s4_1_next_round.mp3 | Next round loads | on load | Next round! Tap what to solve first! |  | fires when rounds 2–4 load; "Next round" voices the round counter generically; rest verbatim Meera bubble |
| 7 | s4_1_complete | s4_1_complete.mp3 | All 4 rounds done | on complete | Lab complete! You found the rule yourself. |  | authored — no on-screen text for this moment (guide bar clears; "See the Rule" button appears) |

## S4.2 — L4 Rule Reveal   —   _renderL4Reveal()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s4_2_rule | s4_2_rule.mp3 | Screen mounts | 0 ms | You found the rule! When a sum has plus and minus, solve from left to right. |  | fresh entry only; verbatim title + rule line (symbols voiced as words) |
| 2 | s4_2_worked | s4_2_worked.mp3 | Worked steps animate | on reveal | 10 minus 4 plus 3 becomes 6 plus 3. That's 9. |  | reads the worked rows as spoken; values fixed in storyboard — voiced exactly |
| 3 | s4_2_bodmas_tag | s4_2_bodmas_tag.mp3 | BODMAS tag appears | on reveal | Addition and subtraction are solved left to right. |  | verbatim tag line |

## S4.3 — L4 Practice   —   _renderL4Practice()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s4_3_q1 | s4_3_q1.mp3 | Screen mounts (Q1 shows) | 0 ms | Tap the operator you should solve first. |  | fresh entry only; verbatim Q1 prompt only — counter and expression not voiced; answer interactions stay usable |
| 2 | s4_3_q1_correct | s4_3_q1_correct.mp3 | Correct operator tapped (Q1) | on correct | Correct! |  | confirmation word only — the rule/answer stays on-screen text, never voiced in practice |
| 3 | s4_3_q1_wrong | s4_3_q1_wrong.mp3 | Wrong operator tapped (Q1) | on wrong | Try again! |  | deterministic; authored neutral retry — the on-screen hint contains the answer and is not voiced |
| 4 | s4_3_q2 | s4_3_q2.mp3 | Question 2 loads | on load | Which rule applies here? |  | verbatim Q2 prompt only — counter and expression not voiced; answer options stay on-screen text, not voiced |
| 5 | s4_3_q2_correct | s4_3_q2_correct.mp3 | Correct rule chosen (Q2) | on correct | Right! |  | confirmation word only — the rule/answer stays on-screen text, never voiced in practice |
| 6 | s4_3_q2_wrong | s4_3_q2_wrong.mp3 | Wrong rule chosen (Q2) | on wrong | Try again! |  | deterministic; authored neutral retry — the on-screen hint contains the answer and is not voiced |
| 7 | s4_3_q3 | s4_3_q3.mp3 | Question 3 loads | on load | Which method is correct? |  | verbatim Q3 prompt only — counter and expression not voiced; the two method cards contain answers and are not voiced |
| 8 | s4_3_q3_correct | s4_3_q3_correct.mp3 | Correct method chosen (Q3) | on correct | Correct! |  | confirmation word only — the rule/answer stays on-screen text, never voiced in practice |
| 9 | s4_3_q3_wrong | s4_3_q3_wrong.mp3 | Wrong method chosen (Q3) | on wrong | Try again! |  | deterministic; authored neutral retry — the on-screen hint contains the answer and is not voiced |
| 10 | s4_3_complete | s4_3_complete.mp3 | All 3 questions done | on complete | Excellent! You've mastered plus and minus, left to right! |  |  |

## S5.0 — L5 Intro (× ÷ left to right)   —   _renderL5Intro()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s5_0_scenario | s5_0_scenario.mp3 | Screen mounts | 0 ms | 12 chocolates are divided into 2 groups, then each group is tripled. |  | fresh entry only; Start button is gated on narration end |
| 2 | s5_0_question | s5_0_question.mp3 | Question appears | on appear | How many chocolates in total? Which part do you solve first? |  | chained off previous clip's ended event |

## S5.1 — L5 Math Lab   —   _renderL5Lab()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s5_1_intro | s5_1_intro.mp3 | Screen mounts | 0 ms | Watch the board! Which part should we solve first? Tap it! |  | fresh entry only; verbatim guide-bar line |
| 2 | s5_1_wrong_tap | s5_1_wrong_tap.mp3 | Wrong group tapped | on wrong | Which times or divide appears first from left to right? |  | deterministic; verbatim Meera bubble (magnifier emoji stripped, symbols voiced as words) |
| 3 | s5_1_correct_tap | s5_1_correct_tap.mp3 | Correct leftmost group tapped | on correct | Yes! Left to right! Brilliant! Watch them come together! |  | reads Meera's praise bubble + guide bar (star emoji stripped) |
| 4 | s5_1_tap_finish | s5_1_tap_finish.mp3 | Merged tile shown, one operator left | on update | Great! Now tap the last sign to finish. |  | screen names the actual operator ("×" or "÷", varies per round) — voiced generically |
| 5 | s5_1_compare | s5_1_compare.mp3 | Compare panel appears | on reveal | Two different answers for the same sum! Left to right gives [answer]. |  | rounds 1 and 3 only (hasCompare); reads compare caption + method card; sum and answer vary — voiced generically; the wrong-path value is never rendered on screen, so it is not voiced |
| 6 | s5_1_next_round | s5_1_next_round.mp3 | Next round loads | on load | Next round! Tap what to solve first! |  | fires when rounds 2–4 load; "Next round" voices the round counter generically; rest verbatim Meera bubble |
| 7 | s5_1_complete | s5_1_complete.mp3 | All 4 rounds done | on complete | Lab complete! You found the rule yourself. |  | authored — no on-screen text for this moment (guide bar clears; "See the Rule" button appears) |

## S5.2 — L5 Rule Reveal   —   _renderL5Reveal()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s5_2_rule | s5_2_rule.mp3 | Screen mounts | 0 ms | You found the rule! When a sum has times and divide, solve from left to right. |  | fresh entry only |
| 2 | s5_2_worked | s5_2_worked.mp3 | Worked steps animate | on reveal | 12 divided by 2 times 3 becomes 6 times 3. That's 18. |  | values fixed in storyboard — voiced exactly |
| 3 | s5_2_bodmas_tag | s5_2_bodmas_tag.mp3 | BODMAS tag appears | on reveal | Multiplication and division are solved left to right. |  |  |

## S5.3 — L5 Practice   —   _renderL5Practice()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s5_3_q1 | s5_3_q1.mp3 | Screen mounts (Q1 shows) | 0 ms | Tap the operator you should solve first. |  | fresh entry only; verbatim Q1 prompt only — counter and expression not voiced; answer interactions stay usable |
| 2 | s5_3_q1_correct | s5_3_q1_correct.mp3 | Correct operator tapped (Q1) | on correct | Correct! |  | confirmation word only — the rule/answer stays on-screen text, never voiced in practice |
| 3 | s5_3_q1_wrong | s5_3_q1_wrong.mp3 | Wrong operator tapped (Q1) | on wrong | Try again! |  | deterministic; authored neutral retry — the on-screen hint contains the answer and is not voiced |
| 4 | s5_3_q2 | s5_3_q2.mp3 | Question 2 loads | on load | Which rule applies here? |  | verbatim Q2 prompt only — counter and expression not voiced; answer options stay on-screen text, not voiced |
| 5 | s5_3_q2_correct | s5_3_q2_correct.mp3 | Correct rule chosen (Q2) | on correct | Right! |  | confirmation word only — the rule/answer stays on-screen text, never voiced in practice |
| 6 | s5_3_q2_wrong | s5_3_q2_wrong.mp3 | Wrong rule chosen (Q2) | on wrong | Try again! |  | deterministic; authored neutral retry — the on-screen hint contains the answer and is not voiced |
| 7 | s5_3_q3 | s5_3_q3.mp3 | Question 3 loads | on load | Which method is correct? |  | verbatim Q3 prompt only — counter and expression not voiced; the two method cards contain answers and are not voiced |
| 8 | s5_3_q3_correct | s5_3_q3_correct.mp3 | Correct method chosen (Q3) | on correct | Correct! |  | confirmation word only — the rule/answer stays on-screen text, never voiced in practice |
| 9 | s5_3_q3_wrong | s5_3_q3_wrong.mp3 | Wrong method chosen (Q3) | on wrong | Try again! |  | deterministic; authored neutral retry — the on-screen hint contains the answer and is not voiced |
| 10 | s5_3_complete | s5_3_complete.mp3 | All 3 questions done | on complete | Excellent! You've mastered times and divide, left to right! |  |  |

## S6.0 — L6 Intro (brackets first)   —   _renderL6Intro()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s6_0_scenario | s6_0_scenario.mp3 | Screen mounts | 0 ms | A teacher makes 3 groups. Each group has 4 boys and 2 girls. |  | fresh entry only; Start button is gated on narration end |
| 2 | s6_0_question | s6_0_question.mp3 | Question appears | on appear | How many students in all? Which part do you solve first? |  | chained off previous clip's ended event; verbatim question text |

## S6.1 — L6 Math Lab   —   _renderL6Lab()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s6_1_intro | s6_1_intro.mp3 | Screen mounts | 0 ms | Watch the board! Tap the operator inside the brackets first! |  | fresh entry only; verbatim guide-bar line (guideWatchBoardBrackets) |
| 2 | s6_1_wrong_tap | s6_1_wrong_tap.mp3 | Wrong operator tapped | on wrong | Solve inside the brackets first — tap the operator inside the brackets! |  | deterministic; verbatim Meera bubble (magnifier emoji stripped, "( )" voiced "the brackets") |
| 3 | s6_1_correct_tap | s6_1_correct_tap.mp3 | Operator inside ( ) tapped | on correct | Yes! Brackets first! Amazing! Watch the brackets collapse! |  | reads Meera's praise bubble + guide bar (star emoji stripped) |
| 4 | s6_1_tap_finish | s6_1_tap_finish.mp3 | Brackets collapsed, one operator left | on update | Great! Now tap times to finish. |  | verbatim guide bar ("×" voiced "times" — fixed for this level) |
| 5 | s6_1_compare | s6_1_compare.mp3 | Compare panel appears | on reveal | Brackets change the answer! Brackets first gives [answer]. |  | rounds 1 and 3 only (hasCompare); reads compare caption + method card; answer varies — voiced generically; the wrong-path value is never rendered on screen, so it is not voiced |
| 6 | s6_1_next_round | s6_1_next_round.mp3 | Next round loads | on load | Next round! Tap what to solve first! |  | fires when rounds 2–4 load; "Next round" voices the round counter generically; rest verbatim Meera bubble |
| 7 | s6_1_complete | s6_1_complete.mp3 | All 4 rounds done | on complete | Lab complete! You found the rule yourself. |  | authored — no on-screen text for this moment (guide bar clears; "See the Rule" button appears) |

## S6.2 — L6 Rule Reveal   —   _renderL6Reveal()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s6_2_rule | s6_2_rule.mp3 | Screen mounts | 0 ms | You found the rule! When a sum has brackets, solve inside the brackets first. |  | fresh entry only |
| 2 | s6_2_worked | s6_2_worked.mp3 | Worked steps animate | on reveal | 2 plus 3, in brackets, times 4 becomes 5 times 4. That's 20. |  | values fixed in storyboard — voiced exactly |
| 3 | s6_2_bodmas_tag | s6_2_bodmas_tag.mp3 | BODMAS tag appears | on reveal | Brackets are solved before everything else. |  |  |

## S6.3 — L6 Practice   —   _renderL6Practice()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s6_3_q1 | s6_3_q1.mp3 | Screen mounts (Q1 shows) | 0 ms | Which operator do you calculate first? |  | fresh entry only; verbatim Q1 prompt only — counter and expression not voiced; answer interactions stay usable |
| 2 | s6_3_q1_correct | s6_3_q1_correct.mp3 | Correct operator tapped (Q1) | on correct | Correct! |  | confirmation word only — the rule/answer stays on-screen text, never voiced in practice |
| 3 | s6_3_q1_wrong | s6_3_q1_wrong.mp3 | Wrong operator tapped (Q1) | on wrong | Try again! |  | deterministic; authored neutral retry — the on-screen hint contains the answer and is not voiced |
| 4 | s6_3_q2 | s6_3_q2.mp3 | Question 2 loads | on load | Which rule applies here? |  | verbatim Q2 prompt only — counter and expression not voiced; answer options stay on-screen text, not voiced |
| 5 | s6_3_q2_correct | s6_3_q2_correct.mp3 | Correct rule chosen (Q2) | on correct | Right! |  | confirmation word only — the rule/answer stays on-screen text, never voiced in practice |
| 6 | s6_3_q2_wrong | s6_3_q2_wrong.mp3 | Wrong rule chosen (Q2) | on wrong | Try again! |  | deterministic; authored neutral retry — the on-screen hint contains the answer and is not voiced |
| 7 | s6_3_q3 | s6_3_q3.mp3 | Question 3 loads | on load | Which method is correct? |  | verbatim Q3 prompt only — counter and expression not voiced; the two method cards contain answers and are not voiced |
| 8 | s6_3_q3_correct | s6_3_q3_correct.mp3 | Correct method chosen (Q3) | on correct | Correct! |  | confirmation word only — the rule/answer stays on-screen text, never voiced in practice |
| 9 | s6_3_q3_wrong | s6_3_q3_wrong.mp3 | Wrong method chosen (Q3) | on wrong | Try again! |  | deterministic; authored neutral retry — the on-screen hint contains the answer and is not voiced |
| 10 | s6_3_complete | s6_3_complete.mp3 | All 3 questions done | on complete | Excellent! You've mastered brackets first! |  |  |

## S8.0 — BODMAS Ladder   —   _renderL8BodmasLadder()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s8_0_intro | s8_0_intro.mp3 | Screen mounts | 0 ms | Arrange the boxes in correct sequence. |  | fresh entry only; verbatim screen title |
| 2 | s8_0_wrong | s8_0_wrong.mp3 | Wrong order placed | on wrong | Not quite! Think about which operation comes first in BODMAS. |  | deterministic; verbatim feedback line |
| 3 | s8_0_correct | s8_0_correct.mp3 | Correct order completed | on correct | You discovered the order rule. Mathematicians call it BODMAS! |  | verbatim celebration line |
| 4 | s8_0_recite | s8_0_recite.mp3 | Final ladder order revealed | on reveal | Brackets, orders, division, multiplication, addition, subtraction — BODMAS! |  | reads the sorted word tiles + letter row in reveal order; audio pauses briefly between each word |

## S9.0 — Nested Brackets   —   _renderL9NestedBrackets()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s9_0_intro | s9_0_intro.mp3 | Screen mounts | 0 ms | Find the innermost brackets and tap the operator inside! |  | fresh entry only; verbatim hint line (magnifier emoji stripped, "( )" voiced as "brackets") |
| 2 | s9_0_hint_middle | s9_0_hint_middle.mp3 | Inner step solved, middle phase starts | on update | Inner brackets solved! Tap the next operator to use. |  | verbatim hint line (sparkle emoji stripped) |
| 3 | s9_0_hint_last | s9_0_hint_last.mp3 | Middle step solved, last phase starts | on update | Almost done — tap the last remaining operator! |  | verbatim hint line (target emoji stripped) |
| 4 | s9_0_wrong | s9_0_wrong.mp3 | Wrong operator tapped | on wrong | That's not inside the innermost brackets — look for the brackets with no other brackets inside it. |  | deterministic; verbatim wrong hint ("( )" voiced as "brackets") |
| 5 | s9_0_step_correct | s9_0_step_correct.mp3 | Correct operator tapped, sub-expression solves | on correct | Correct! |  | confirmation word only — the solved value appears on screen in the reduced strip, never voiced in practice |
| 6 | s9_0_q_complete | s9_0_q_complete.mp3 | Final step of a question solved | on complete | Well done! |  | authored celebration — the answer and full equation stay on-screen text (answer banner), never voiced in practice |
| 7 | s9_0_next_q | s9_0_next_q.mp3 | Question 2 loads | on load | Question 2 of 2. Find the innermost brackets and tap the operator inside! |  | verbatim question label + hint line |
| 8 | s9_0_complete | s9_0_complete.mp3 | Both questions done | on complete | Nested brackets mastered! |  | authored — no on-screen text for this moment (confetti only) |

## S9.1 — Insert the Brackets   —   _renderL9InsertBrackets()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s9_1_intro | s9_1_intro.mp3 | Screen mounts | 0 ms | Insert the brackets! Place the brackets to make it true! Drag the brackets into the gaps. |  | fresh entry only; verbatim title + prompt + tray hint (matches the drag interaction shown on screen) |
| 2 | s9_1_tap_close | s9_1_tap_close.mp3 | Open bracket placed | on update | Now place the close bracket. |  | authored — no on-screen text for this moment (open bracket sits in its gap, close bracket still in tray); input-neutral wording (drag or tap both work) |
| 3 | s9_1_wrong | s9_1_wrong.mp3 | Result does not match target | on wrong | That doesn't make it true. Try the brackets in a different place. |  | deterministic; authored — no on-screen text for this moment (target number flashes red, expression shakes); wording follows the screen's "make it true" prompt |
| 4 | s9_1_correct | s9_1_correct.mp3 | Result matches target | on correct | You made it true! Brackets change the answer. |  | authored — no on-screen text at the cue instant (green highlight; worked-equation banner appears ~2.6 s later); wording follows the screen's "make it true" prompt |
| 5 | s9_1_next | s9_1_next.mp3 | Next puzzle loads | on load | Place the brackets to make it true! |  | fires when puzzles 2–4 load; verbatim standing prompt (puzzle counter not voiced — value varies) |
| 6 | s9_1_complete | s9_1_complete.mp3 | All 4 puzzles done | on complete | All four puzzles solved! You're a bracket expert. |  | authored — no on-screen text for this moment (confetti + puzzle-4 worked equation only) |

## S9.2 — Final BODMAS Review   —   _renderL9BodmasReview()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s9_2_intro | s9_2_intro.mp3 | Screen mounts | 0 ms | BODMAS Rapid Round! Tap the operator you should solve first. |  | fresh entry only; verbatim screen title + prompt |
| 2 | s9_2_q1_correct | s9_2_q1_correct.mp3 | Correct operator tapped (Q1: 7 + 2 × 3) | on correct | Correct! |  | confirmation word only — the rule and worked answer stay on-screen text, never voiced in practice |
| 3 | s9_2_q2_correct | s9_2_q2_correct.mp3 | Correct operator tapped (Q2: 15 − 2 × 4) | on correct | Correct! |  | confirmation word only — the rule and worked answer stay on-screen text, never voiced in practice |
| 4 | s9_2_q3_correct | s9_2_q3_correct.mp3 | Correct operator tapped (Q3: 5 + 12 ÷ 4) | on correct | Correct! |  | confirmation word only — the rule and worked answer stay on-screen text, never voiced in practice |
| 5 | s9_2_q4_correct | s9_2_q4_correct.mp3 | Correct operator tapped (Q4: 11 − 4 + 2) | on correct | Correct! |  | confirmation word only — the rule and worked answer stay on-screen text, never voiced in practice |
| 6 | s9_2_q5_correct | s9_2_q5_correct.mp3 | Correct operator tapped (Q5: 18 ÷ 3 × 2) | on correct | Correct! |  | confirmation word only — the rule and worked answer stay on-screen text, never voiced in practice |
| 7 | s9_2_q6_correct | s9_2_q6_correct.mp3 | Correct operator tapped (Q6: (5 + 3) × 4) | on correct | Correct! |  | confirmation word only — the rule and worked answer stay on-screen text, never voiced in practice |
| 8 | s9_2_wrong | s9_2_wrong.mp3 | Wrong operator tapped (any question) | on wrong | Not quite — think about which rule applies here. |  | deterministic; shared across all six questions; verbatim feedback line |
| 9 | s9_2_complete | s9_2_complete.mp3 | All 6 questions done | on complete | Review complete! |  | authored — no on-screen text for this moment; queued behind s9_2_q6_correct on the same click |

## S9.3 — BODMAS Champion Results   —   _renderL9Results()

| # | Cue ID | File | Trigger | T+ | VO Text | Approved? | Notes |
|---|--------|------|---------|----|---------|-----------|-------|
| 1 | s9_3_champion | s9_3_champion.mp3 | Screen mounts | 0 ms | BODMAS Champion! You have mastered all the rules of BODMAS. |  | fresh entry only; verbatim heading + subtitle |
| 2 | s9_3_recap | s9_3_recap.mp3 | Champion rule cards reveal | on reveal | Brackets first. Of means multiply — half of 10 is 5. Divide and times before plus and minus. Divide and times left to right. Plus and minus last. Plus and minus left to right. |  | reads the six rule cards in reveal order, one sentence per card (letter prefixes not voiced; symbols voiced as words) |
