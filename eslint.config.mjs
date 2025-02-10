import typescriptEslint from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import reactEslint from 'eslint-plugin-react';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactHooksEslint from 'eslint-plugin-react-hooks';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory    : __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig        : js.configs.all
});

export default [
  {
    ignores: [
      'build/*',
      'dist/*',
      'public/*',
      '**/out/*',
      '**/.next/*',
      '**/node_modules/*',
      '**/reportWebVitals.*',
      '**/service-worker.*',
      '**/serviceWorkerRegistration.*',
      '**/setupTests.*',
      '**/next.config.*',
      '**/postcss.config.*',
      '**/jsconfig.json',
      '**/vite-env.d.ts'
    ]
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      react               : reactEslint,
      'react-refresh'     : reactRefresh,
      'react-hooks'       : reactHooksEslint
    },
    languageOptions: {
      ecmaVersion  : 2024,
      sourceType   : 'module',
      parser       : tsParser,
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals      : {
        ...globals.browser,
        ...globals.node,
        React: true,
        JSX  : true
      }
    },
    settings: { react: { version: 'detect' } },
    rules   : {
      'getter-return'            : 2,
      'no-async-promise-executor': 2,
      'no-await-in-loop'         : 2,
      'no-compare-neg-zero'      : 2,
      'no-cond-assign'           : 2,
      'no-console'               : 1,
      'no-constant-condition'    : 2,
      'no-control-regex'         : 2,
      'no-debugger'              : 2,
      'no-dupe-args'             : 2,
      'no-dupe-keys'             : 2,
      'no-duplicate-case'        : 2,
      'no-empty'                 : 2,
      'no-empty-character-class' : 2,
      'no-ex-assign'             : 2,
      'no-extra-boolean-cast'    : 2,
      'no-extra-parens'          : ['error', 'all', {
        enforceForArrowConditionals: false,
        ignoreJSX                  : 'all'
      }],
      'no-extra-semi'                : 2,
      'no-func-assign'               : 2,
      'no-inner-declarations'        : 2,
      'no-invalid-regexp'            : 2,
      'no-irregular-whitespace'      : 2,
      'no-misleading-character-class': 2,
      'no-obj-calls'                 : 2,
      'no-prototype-builtins'        : 2,
      'no-regex-spaces'              : 2,
      'no-sparse-arrays'             : 2,
      'no-template-curly-in-string'  : 2,
      'no-unexpected-multiline'      : 2,
      'no-unreachable'               : 2,
      'no-unsafe-finally'            : 2,
      'no-unsafe-negation'           : 2,
      'require-atomic-updates'       : 1,
      'use-isnan'                    : 2,
      'valid-typeof'                 : 2,
      'accessor-pairs'               : 2,
      'array-callback-return'        : 2,
      'block-scoped-var'             : 2,
      'class-methods-use-this'       : 2,
      'consistent-return'            : 0,
      'default-case'                 : 2,
      'dot-location'                 : ['error', 'property'],
      'dot-notation'                 : 2,
      eqeqeq                         : 'off',
      'guard-for-in'                 : 2,
      'max-classes-per-file'         : ['error', 1],
      'no-alert'                     : 2,
      'no-caller'                    : 2,
      'no-case-declarations'         : 2,
      'no-div-regex'                 : 2,
      'no-else-return'               : 2,
      'no-empty-function'            : 2,
      'no-empty-pattern'             : 2,
      'no-eq-null'                   : 2,
      'no-eval'                      : 2,
      'no-extend-native'             : 2,
      'no-extra-bind'                : 2,
      'no-extra-label'               : 2,
      'no-fallthrough'               : 2,
      'no-floating-decimal'          : 2,
      'no-global-assign'             : 2,
      'no-implicit-coercion'         : 'off',
      'no-implicit-globals'          : 2,
      'no-implied-eval'              : 2,
      'no-invalid-this'              : 0,
      'no-iterator'                  : 2,
      'no-labels'                    : 2,
      'no-lone-blocks'               : 2,
      'no-loop-func'                 : 0,
      'no-magic-numbers'             : ['off', {
        ignoreArrayIndexes: true,
        ignore            : [-1, 0, 1, 2]
      }],
      'no-multi-spaces'             : 1,
      'no-multi-str'                : 1,
      'no-new'                      : 2,
      'no-new-func'                 : 2,
      'no-new-wrappers'             : 2,
      'no-octal'                    : 2,
      'no-octal-escape'             : 2,
      'no-param-reassign'           : 2,
      'no-proto'                    : 2,
      'no-redeclare'                : 2,
      'no-restricted-properties'    : 2,
      'no-return-assign'            : 2,
      'no-return-await'             : 2,
      'no-script-url'               : 2,
      'no-self-assign'              : 2,
      'no-self-compare'             : 2,
      'no-sequences'                : 2,
      'no-throw-literal'            : 2,
      'no-unmodified-loop-condition': 2,
      'no-unused-expressions'       : 2,
      'no-unused-labels'            : 2,
      'no-useless-call'             : 2,
      'no-useless-catch'            : 2,
      'no-useless-concat'           : 2,
      'no-useless-escape'           : 2,
      'no-useless-return'           : 2,
      'no-void'                     : 2,
      'no-with'                     : 2,
      'prefer-named-capture-group'  : 0,
      'prefer-promise-reject-errors': 2,
      radix                         : 2,
      'require-await'               : 2,
      'require-unicode-regexp'      : 0,
      'vars-on-top'                 : 2,
      'wrap-iife'                   : 2,
      yoda                          : 2,
      'no-delete-var'               : 2,
      'no-label-var'                : 2,
      'no-restricted-globals'       : 2,
      'no-shadow'                   : 2,
      'no-shadow-restricted-names'  : 2,
      'no-undef-init'               : 2,
      'no-undefined'                : 0,
      'no-use-before-define'        : 0,
      'array-bracket-newline'       : ['error', 'consistent'],
      'array-bracket-spacing'       : 2,
      'array-element-newline'       : ['error', 'consistent'],
      'block-spacing'               : 2,
      'brace-style'                 : ['error', '1tbs'],
      camelcase                     : 0,
      'capitalized-comments'        : 0,
      'comma-dangle'                : ['error', 'never'],
      'comma-spacing'               : ['error', {
        before: false,
        after : true
      }],
      'comma-style'              : ['error', 'last'],
      'computed-property-spacing': ['error', 'never'],
      'consistent-this'          : 2,
      'eol-last'                 : 2,
      'func-call-spacing'        : 2,
      'func-names'               : 0,
      'func-name-matching'       : 2,
      'func-style'               : 0,
      'function-paren-newline'   : ['error', 'consistent'],
      'id-length'                : ['warn', {
        min       : 2,
        exceptions: ['_', 'x', 'y', 'a', 'b', 'e', 'p', 'm']
      }],
      'id-match'                : 0,
      'implicit-arrow-linebreak': ['error', 'beside'],
      indent                    : ['error', 2, { SwitchCase: 1 }],
      'jsx-quotes'              : ['error', 'prefer-double'],
      'key-spacing'             : ['error', {
        align: {
          beforeColon: false,
          afterColon : true,
          on         : 'colon',
          mode       : 'strict'
        },

        multiLine: {
          beforeColon: false,
          afterColon : true
        },

        singleLine: {
          beforeColon: false,
          afterColon : true
        }
      }],
      'keyword-spacing': ['error', {
        before: true,
        after : true
      }],
      'lines-around-comment': ['error', {
        beforeBlockComment: true,
        afterBlockComment : false,
        beforeLineComment : true,
        afterLineComment  : false,
        allowBlockStart   : true,
        allowBlockEnd     : false,
        allowObjectStart  : true,
        allowObjectEnd    : false,
        allowArrayStart   : true,
        allowArrayEnd     : false
      }],
      'lines-between-class-members': ['error', 'always'],
      'max-depth'                  : ['error', 4],
      'max-len'                    : ['error', 120],
      'max-lines-per-function'     : 0,
      'max-nested-callbacks'       : ['warn', 7],
      'max-params'                 : ['error', 3],
      'max-statements'             : ['warn', 20],
      'max-statements-per-line'    : ['error', { max: 1 }],
      'multiline-ternary'          : ['error', 'never'],
      'new-cap'                    : ['error', {
        newIsCap  : true,
        capIsNew  : true,
        properties: true
      }],
      'new-parens'              : 2,
      'newline-per-chained-call': 2,
      'no-array-constructor'    : 2,
      'no-bitwise'              : 2,
      'no-inline-comments'      : 0,
      'no-lonely-if'            : 2,
      'no-mixed-operators'      : 0,
      'no-mixed-spaces-and-tabs': 2,
      'no-multi-assign'         : 2,
      'no-multiple-empty-lines' : ['error', {
        max   : 1,
        maxBOF: 0,
        maxEOF: 1
      }],
      'no-negated-condition'            : 0,
      'no-nested-ternary'               : 2,
      'no-new-object'                   : 2,
      'no-plusplus'                     : 0,
      'no-restricted-syntax'            : 0,
      'no-ternary'                      : 0,
      'no-trailing-spaces'              : 2,
      'no-underscore-dangle'            : 'off',
      'no-unneeded-ternary'             : 2,
      'no-whitespace-before-property'   : 2,
      'nonblock-statement-body-position': ['error', 'below'],
      'object-property-newline'         : 2,
      'object-curly-newline'            : ['error', { multiline: true }],
      'object-curly-spacing'            : ['error', 'always'],
      'one-var'                         : ['error', {
        var  : 'always',
        const: 'never',
        let  : 'never'
      }],
      'one-var-declaration-per-line': ['error', 'always'],
      'operator-assignment'         : ['error', 'always'],
      'operator-linebreak'          : ['error', 'none', {
        overrides: {
          '&&': 'before',
          '||': 'before'
        }
      }],
      'padded-blocks'                  : ['error', 'never'],
      'padding-line-between-statements': ['error', {
        blankLine: 'always',
        prev     : '*',
        next     : 'return'
      }, {
        blankLine: 'always',
        prev     : '*',
        next     : 'block-like'
      }, {
        blankLine: 'always',
        prev     : '*',
        next     : 'class'
      }, {
        blankLine: 'always',
        prev     : '*',
        next     : 'function'
      }, {
        blankLine: 'always',
        prev     : '*',
        next     : 'default'
      }, {
        blankLine: 'always',
        prev     : '*',
        next     : 'export'
      }, {
        blankLine: 'always',
        prev     : 'import',
        next     : '*'
      }, {
        blankLine: 'any',
        prev     : 'import',
        next     : 'import'
      }],
      'prefer-object-spread': 0,
      'quote-props'         : ['error', 'as-needed'],
      quotes                : ['error', 'single'],
      semi                  : ['error', 'always'],
      'semi-spacing'        : ['error', {
        before: false,
        after : true
      }],
      'semi-style'                 : ['error', 'last'],
      'sort-keys'                  : 0,
      'sort-vars'                  : 0,
      'space-before-blocks'        : ['error', 'always'],
      'space-before-function-paren': ['error', 'always'],
      'space-in-parens'            : ['error', 'never'],
      'space-infix-ops'            : ['error', { int32Hint: false }],
      'space-unary-ops'            : 2,
      'spaced-comment'             : ['error', 'always'],
      'switch-colon-spacing'       : ['error', {
        after : true,
        before: false
      }],
      'template-tag-spacing': ['error', 'never'],
      'unicode-bom'         : 0,
      'wrap-regex'          : 0,
      'arrow-body-style'    : ['error', 'as-needed'],
      'arrow-parens'        : ['error', 'as-needed'],
      'arrow-spacing'       : ['off', {
        before: true,
        after : true
      }],
      'constructor-super'                   : 2,
      'generator-star-spacing'              : ['error', 'after'],
      'no-class-assign'                     : 2,
      'no-confusing-arrow'                  : ['error', { allowParens: true }],
      'no-const-assign'                     : 2,
      'no-dupe-class-members'               : 2,
      'no-duplicate-imports'                : 2,
      'no-new-symbol'                       : 2,
      'no-restricted-imports'               : 0,
      'no-this-before-super'                : 2,
      'no-useless-computed-key'             : 2,
      'no-useless-constructor'              : 2,
      'no-useless-rename'                   : 0,
      'no-var'                              : 0,
      'object-shorthand'                    : 2,
      'prefer-arrow-callback'               : 0,
      'prefer-const'                        : 2,
      'prefer-destructuring'                : 0,
      'prefer-numeric-literals'             : 0,
      'prefer-rest-params'                  : 2,
      'prefer-spread'                       : 2,
      'prefer-template'                     : 2,
      'require-yield'                       : 2,
      'rest-spread-spacing'                 : ['error', 'never'],
      'symbol-description'                  : 2,
      'template-curly-spacing'              : ['error', 'never'],
      'yield-star-spacing'                  : ['error', 'after'],
      complexity                            : 'off',
      'no-undef'                            : 'off',
      'no-unused-vars'                      : 'off',
      'max-lines'                           : 'off',
      'sort-imports'                        : 0,
      'react/jsx-first-prop-new-line'       : ['error', 'multiline-multiprop'],
      'react/prop-types'                    : 'off',
      'react/display-name'                  : 'off',
      'react/react-in-jsx-scope'            : 'off',
      'react/jsx-max-props-per-line'        : ['error', { maximum: 1 }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],
      curly                               : ['error', 'all'],
      'no-continue'                       : 'off',
      'no-warning-comments'               : 'off',
      '@typescript-eslint/ban-ts-comment' : 'off',
      '@typescript-eslint/ban-ts-ignore'  : 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unused-vars' : ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/interface-name-prefix'        : 'off',
      '@typescript-eslint/no-non-null-assertion'        : 'off',
      '@typescript-eslint/no-explicit-any'              : 'warn',
      'react-hooks/rules-of-hooks'                      : 'error',
      'react-hooks/exhaustive-deps'                     : 'warn'
    }
  }
];
