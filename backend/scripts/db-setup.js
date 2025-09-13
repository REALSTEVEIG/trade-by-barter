#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

// Change to backend directory
process.chdir(path.join(__dirname, '..'));

const commands = {
  reset: [
    'npx prisma migrate reset --force',
    'npx prisma generate',
    'npm run db:seed'
  ],
  setup: [
    'npx prisma generate',
    'npx prisma migrate dev',
    'npm run db:seed'
  ],
  seed: [
    'npm run db:seed'
  ],
  studio: [
    'npx prisma studio --port 5555'
  ],
  status: [
    'npx prisma migrate status'
  ]
};

function runCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`\nRunning: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Warning: ${stderr}`);
      }
      console.log(stdout);
      resolve();
    });
  });
}

async function runCommands(commandList) {
  for (const command of commandList) {
    try {
      await runCommand(command);
      console.log(`Completed: ${command}`);
    } catch (error) {
      console.error(`Failed: ${command}`);
      process.exit(1);
    }
  }
}

async function main() {
  const action = process.argv[2];
  
  if (!action || !commands[action]) {
    console.log(`
TradeByBarter Database Setup Script

Usage: node scripts/db-setup.js <action>

Actions:
  setup   - Initial database setup (generate + migrate + seed)
  reset   - Reset database and reseed data
  seed    - Reseed database with sample data
  studio  - Open Prisma Studio
  status  - Check migration status

Examples:
  node scripts/db-setup.js setup
  node scripts/db-setup.js reset
  node scripts/db-setup.js studio
    `);
    process.exit(1);
  }

  console.log(`\nStarting database ${action}...\n`);
  
  try {
    await runCommands(commands[action]);
    console.log(`\nDatabase ${action} completed successfully!`);
    
    if (action === 'setup' || action === 'reset' || action === 'seed') {
      console.log(`
Seeded data summary:
- 20 users with Nigerian names and locations
- 15 listings across popular categories
- 30 offers (cash-only, swap-only, hybrid)
- 20 transactions with Nigerian payment methods
- 15 chat conversations with messages
- 25 reviews and ratings
- 15 verifications
- 40 notifications

Open Prisma Studio: npm run db:studio
      `);
    }
  } catch (error) {
    console.error(`\nDatabase ${action} failed!`);
    process.exit(1);
  }
}

main();