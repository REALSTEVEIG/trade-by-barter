module.exports = {
  // Print width - maximum line length
  printWidth: 80,
  
  // Tab width - number of spaces per indentation level
  tabWidth: 2,
  
  // Use spaces instead of tabs
  useTabs: false,
  
  // Semicolons at the end of statements
  semi: true,
  
  // Use single quotes instead of double quotes
  singleQuote: true,
  
  // Quote object properties only when necessary
  quoteProps: 'as-needed',
  
  // Use single quotes in JSX
  jsxSingleQuote: true,
  
  // Trailing commas - add trailing commas in ES5 (objects, arrays, etc.)
  trailingComma: 'es5',
  
  // Bracket spacing - print spaces between brackets in object literals
  bracketSpacing: true,
  
  // JSX bracket same line - put the > of a multi-line JSX element at the end of the last line
  bracketSameLine: false,
  
  // Arrow function parentheses - include parentheses around a sole arrow function parameter
  arrowParens: 'always',
  
  // Range - format the entire file
  rangeStart: 0,
  rangeEnd: Infinity,
  
  // Parser - let prettier auto-detect
  parser: undefined,
  
  // File path - used for parser inference
  filepath: undefined,
  
  // Require pragma - only format files that have a special comment
  requirePragma: false,
  
  // Insert pragma - insert a special comment at the top of files
  insertPragma: false,
  
  // Prose wrap - how to wrap prose (markdown)
  proseWrap: 'preserve',
  
  // HTML whitespace sensitivity
  htmlWhitespaceSensitivity: 'css',
  
  // End of line - line feed only (\n)
  endOfLine: 'lf',
  
  // Embedded language formatting
  embeddedLanguageFormatting: 'auto',
  
  // Single attribute per line in HTML, Vue and JSX
  singleAttributePerLine: false,
  
  // Override settings for specific file types
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
      },
    },
    {
      files: '*.css',
      options: {
        singleQuote: false,
      },
    },
    {
      files: '*.scss',
      options: {
        singleQuote: false,
      },
    },
    {
      files: '*.jsx',
      options: {
        jsxSingleQuote: true,
      },
    },
    {
      files: '*.tsx',
      options: {
        jsxSingleQuote: true,
      },
    },
  ],
};