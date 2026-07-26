import neostandard, { resolveIgnoresFromGitignore } from 'neostandard'

export default [
  ...neostandard({
    ignores: resolveIgnoresFromGitignore(),
    globals: ['browser', 'ContentService', 'GmailApp']
  }),

  // Import attributes (`with { type: 'text' }`, used for the .css and
  // apps-script-source.js text imports) need a newer ecmaVersion than
  // neostandard's default to parse. Must come *after* the neostandard
  // block above: ESLint flat config only lets a later parserOptions.ecmaVersion
  // override an earlier one, not the other way around.
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest'
      }
    }
  },

  // apps-script-source.js is pasted verbatim by users into the Google
  // Apps Script editor. Its `doGet` is Google's runtime entry point, not
  // something referenced from within the file, so no-unused-vars can't
  // see the caller. Scoped here instead of an inline disable comment,
  // since that file is user-facing and should stay exactly what a user
  // pastes into their script — no lint annotations mixed in.
  {
    files: ['src/core/apps-script-source.js'],
    rules: {
      'no-unused-vars': 'off'
    }
  }
]
