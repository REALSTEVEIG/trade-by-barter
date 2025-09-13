#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Emoji regex pattern to detect all emoji characters
const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}]|[\u{2194}-\u{2199}]|[\u{21A9}-\u{21AA}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23EC}]|[\u{23F0}]|[\u{23F3}]|[\u{25FD}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2705}]|[\u{270A}-\u{270B}]|[\u{2728}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2795}-\u{2797}]|[\u{27B0}]|[\u{27BF}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]/gu;

const extensions = ['.js', '.ts', '.jsx', '.tsx', '.md', '.json', '.yml', '.yaml'];
const excludeDirs = ['node_modules', 'dist', 'build', '.git', 'coverage', '.next'];

let foundEmojis = false;
let emojiCount = 0;
let fileCount = 0;
const emojiFiles = [];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const emojisInFile = [];
    
    lines.forEach((line, lineNumber) => {
      let match;
      while ((match = emojiRegex.exec(line)) !== null) {
        emojisInFile.push({
          line: lineNumber + 1,
          column: match.index + 1,
          emoji: match[0],
          unicode: `U+${match[0].codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`
        });
        emojiCount++;
        foundEmojis = true;
      }
    });
    
    if (emojisInFile.length > 0) {
      emojiFiles.push({
        file: path.relative(process.cwd(), filePath),
        emojis: emojisInFile
      });
    }
  } catch (error) {
    // Skip files that can't be read
  }
}

function scanDirectory(dir) {
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!excludeDirs.includes(item) && !item.startsWith('.')) {
          scanDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          fileCount++;
          scanFile(fullPath);
        }
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }
}

// Main execution
const isPreCommit = process.argv.includes('--pre-commit');
const targetDir = process.cwd();

console.log(`Scanning ${fileCount} files for emojis...`);
console.log('');

scanDirectory(targetDir);

if (foundEmojis) {
  console.log('BACKEND EMOJI POLICY VIOLATION DETECTED!');
  console.log('==========================================');
  console.log(`Found ${emojiCount} emoji(s) in ${emojiFiles.length} file(s):`);
  console.log('');
  
  emojiFiles.forEach(fileData => {
    console.log(`File: ${fileData.file}:`);
    fileData.emojis.forEach(emoji => {
      console.log(`   Line ${emoji.line}, Column ${emoji.column}: "${emoji.emoji}" (${emoji.unicode})`);
    });
    console.log('');
  });
  
  console.log('TradeByBarter Backend has a ZERO-TOLERANCE policy for emojis.');
  console.log('Please remove all emoji characters before committing.');
  console.log('Use descriptive text or icons instead of emojis.');
  
  if (isPreCommit) {
    process.exit(1);
  }
} else {
  console.log('No emojis found. Backend is compliant with emoji policy.');
  if (isPreCommit) {
    process.exit(0);
  }
}