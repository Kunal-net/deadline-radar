# Frontend Visual Validation & Execution Rules

## 1. Browser / Frontend Visual Validation
The browser must NEVER become a blocking step.

When visually validating the frontend:
1. Start the development server with a bounded, non-blocking command.
2. Open the frontend in the browser only when necessary.
3. Perform a QUICK visual inspection of the relevant route.
4. Check for obvious issues:
   - page loads
   - no blank screen
   - no major console/runtime errors
   - layout is present
   - assets load
   - navigation works
5. If the browser becomes slow, hangs, does not respond, or visual inspection cannot be completed promptly, STOP browser inspection.
6. Do NOT repeatedly refresh, reopen, wait indefinitely, or keep retrying browser access.
7. Do NOT let browser inspection prevent the task from being completed.
8. Continue validation using:
   - build/typecheck
   - lint
   - tests
   - static code inspection
   - available browser/test tooling
9. If browser validation fails because of the environment rather than the application, report:
   `"Browser visual validation could not be completed due to the environment/tooling. Code-level validation was completed."`
10. Never spend more than a short bounded period waiting for a browser page, screenshot, preview, or dev server response.

The browser is a VALIDATION TOOL, not a dependency for completing implementation.
Once reasonable visual validation has been performed, move on. Do not enter a browser-inspection loop.

---

## 2. No Infinite Validation Loops
The agent must not repeatedly perform the same validation action without gaining new information.

If the same browser action fails twice, change the validation method or proceed with code-level validation.

Never:
- repeatedly refresh a frozen page
- repeatedly restart the dev server without diagnosing the cause
- repeatedly wait for a screenshot
- repeatedly attempt to open the same route
- remain stuck trying to prove a visual issue after sufficient evidence has been collected

Implementation progress takes priority over redundant validation attempts.
