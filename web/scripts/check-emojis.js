#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Emoji detection script for TradeByBarter Web App
 * Enforces zero-tolerance policy for emojis in codebase
 */

// Comprehensive emoji regex pattern
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE00}-\u{FE0F}]|[\u{1F200}-\u{1F2FF}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]|[\u{231A}-\u{231B}]|[\u{2328}]|[\u{23CF}]|[\u{23E9}-\u{23F3}]|[\u{23F8}-\u{23FA}]|[\u{24C2}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2934}-\u{2935}]|[\u{2B00}-\u{2BFF}]/gu;

// Additional common emoji patterns
const ADDITIONAL_EMOJI_PATTERNS = [
  /[\u{1F004}]/gu,  // Mahjong tile
  /[\u{1F0CF}]/gu,  // Playing card
  /[\u{1F170}-\u{1F171}]/gu, // A and B button
  /[\u{1F17E}-\u{1F17F}]/gu, // O button
  /[\u{1F18E}]/gu,  // AB button
  /[\u{3030}]/gu,   // Wavy dash
  /[\u{2B06}]/gu,   // Up arrow
  /[\u{2194}-\u{2199}]/gu, // Arrows
  /[\u{21A9}-\u{21AA}]/gu, // Arrows
  /[\u{2139}]/gu,   // Information
  /[\u{2122}]/gu,   // Trademark
  /[\u{3297}]/gu,   // Congratulations
  /[\u{3299}]/gu,   // Secret
];

// Files and directories to ignore
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  '.next',
  'out',
  'build',
  'dist',
  'coverage',
  '.nyc_output',
  '.husky',
  'logs',
  'tmp',
  'temp',
  '.cache',
  'public/icons',
  'public/images',
];

// File extensions to check
const SUPPORTED_EXTENSIONS = [
  '.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.txt', '.yml', '.yaml',
  '.html', '.css', '.scss', '.sass', '.less',
  '.sh', '.bash', '.zsh', '.xml', '.svg',
];

/**
 * Check if a file should be ignored
 */
function shouldIgnoreFile(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  
  return IGNORE_PATTERNS.some(pattern => {
    return normalizedPath.includes(pattern) || 
           normalizedPath.startsWith(pattern) ||
           normalizedPath.includes(`/${pattern}/`) ||
           normalizedPath.endsWith(`/${pattern}`);
  });
}

/**
 * Check if file extension is supported
 */
function isSupportedExtension(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}

/**
 * Detect emojis in text content
 */
function detectEmojis(content) {
  const emojis = [];
  
  // Check main emoji regex
  let match;
  while ((match = EMOJI_REGEX.exec(content)) !== null) {
    emojis.push({
      emoji: match[0],
      index: match.index,
      pattern: 'main'
    });
  }
  
  // Check additional patterns
  ADDITIONAL_EMOJI_PATTERNS.forEach((pattern, patternIndex) => {
    while ((match = pattern.exec(content)) !== null) {
      emojis.push({
        emoji: match[0],
        index: match.index,
        pattern: `additional-${patternIndex}`
      });
    }
  });
  
  return emojis;
}

/**
 * Get line and column number from character index
 */
function getLineAndColumn(content, index) {
  const lines = content.substring(0, index).split('\n');
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;
  return { line, column };
}

/**
 * Scan a single file for emojis
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const emojis = detectEmojis(content);
    
    if (emojis.length > 0) {
      return emojis.map(emoji => {
        const location = getLineAndColumn(content, emoji.index);
        return {
          file: filePath,
          emoji: emoji.emoji,
          line: location.line,
          column: location.column,
          pattern: emoji.pattern,
          code: emoji.emoji.codePointAt(0).toString(16).toUpperCase()
        };
      });
    }
    
    return [];
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
    return [];
  }
}

/**
 * Recursively scan directory for files
 */
function scanDirectory(dirPath, allFiles = []) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      
      if (shouldIgnoreFile(fullPath)) {
        continue;
      }
      
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, allFiles);
      } else if (stat.isFile() && isSupportedExtension(fullPath)) {
        allFiles.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dirPath}: ${error.message}`);
  }
  
  return allFiles;
}

/**
 * Get staged files from git
 */
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', { 
      encoding: 'utf8', 
      cwd: process.cwd() 
    });
    
    return output
      .trim()
      .split('\n')
      .filter(file => file && isSupportedExtension(file) && !shouldIgnoreFile(file))
      .filter(file => fs.existsSync(file));
  } catch (error) {
    // Not in a git repository or no staged files
    return [];
  }
}

/**
 * Main execution function
 */
function main() {
  const args = process.argv.slice(2);
  const isPreCommit = args.includes('--pre-commit');
  const isQuiet = args.includes('--quiet');
  
  let filesToCheck = [];
  
  if (isPreCommit) {
    // Pre-commit hook: only check staged files
    filesToCheck = getStagedFiles();
    
    if (filesToCheck.length === 0) {
      if (!isQuiet) {
        console.log('No staged files to check for emojis.');
      }
      process.exit(0);
    }
  } else {
    // Full scan: check all files in the project
    filesToCheck = scanDirectory(process.cwd());
  }
  
  let totalEmojis = 0;
  const emojiFiles = [];
  
  if (!isQuiet) {
    console.log(`Scanning ${filesToCheck.length} files for emojis...`);
  }
  
  for (const file of filesToCheck) {
    const emojis = scanFile(file);
    
    if (emojis.length > 0) {
      totalEmojis += emojis.length;
      emojiFiles.push({ file, emojis });
    }
  }
  
  if (totalEmojis > 0) {
    console.error('\n WEB APP EMOJI POLICY VIOLATION DETECTED!');
    console.error('========================================');
    console.error(`Found ${totalEmojis} emoji(s) in ${emojiFiles.length} file(s):`);
    console.error('');
    
    emojiFiles.forEach(({ file, emojis }) => {
      console.error(`${file}:`);
      emojis.forEach(emoji => {
        console.error(`   Line ${emoji.line}, Column ${emoji.column}: "${emoji.emoji}" (U+${emoji.code})`);
      });
      console.error('');
    });
    
    console.error('TradeByBarter Web App has a ZERO-TOLERANCE policy for emojis.');
    console.error('Please remove all emoji characters before committing.');
    console.error('');
    
    process.exit(1);
  } else {
    if (!isQuiet) {
      console.log('Web App: No emojis detected. All clear!');
    }
    process.exit(0);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  detectEmojis,
  scanFile,
  scanDirectory,
  getStagedFiles,
  shouldIgnoreFile,
  isSupportedExtension
};