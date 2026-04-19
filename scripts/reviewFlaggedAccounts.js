#!/usr/bin/env node

/**
 * Flagged Accounts Review Script
 *
 * This script queries Firestore for accounts flagged during crash recovery
 * and provides tools to review and clear flags.
 *
 * Usage:
 *   node scripts/reviewFlaggedAccounts.js list
 *   node scripts/reviewFlaggedAccounts.js clear USER_ID
 *   node scripts/reviewFlaggedAccounts.js stats
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || './serviceAccountKey.json';
try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin. Make sure FIREBASE_SERVICE_ACCOUNT env var is set or serviceAccountKey.json exists.');
  process.exit(1);
}

const db = admin.firestore();

// Command line interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

/**
 * List all flagged accounts
 */
async function listFlaggedAccounts() {
  console.log('🔍 Querying flagged accounts...\n');

  const snapshot = await db.collection('users')
    .where('flagged_for_review', '==', true)
    .get();

  if (snapshot.empty) {
    console.log('✅ No flagged accounts found!');
    return [];
  }

  console.log(`⚠️ Found ${snapshot.size} flagged account(s):\n`);

  const flaggedAccounts = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const account = {
      userId: doc.id,
      email: data.email || 'N/A',
      flaggedReason: data.flagged_reason || 'No reason provided',
      flaggedAt: data.flagged_at?.toDate()?.toISOString() || 'Unknown',
      currentBalance: data.voice_balance_seconds || 0,
      isPremium: data.subscription?.tier !== 'free',
      lastReconciliation: data.last_reconciliation || null,
    };

    flaggedAccounts.push(account);

    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`User ID: ${account.userId}`);
    console.log(`Email: ${account.email}`);
    console.log(`Reason: ${account.flaggedReason}`);
    console.log(`Flagged At: ${account.flaggedAt}`);
    console.log(`Current Balance: ${account.currentBalance}s`);
    console.log(`Premium: ${account.isPremium ? 'Yes' : 'No'}`);
    if (account.lastReconciliation) {
      console.log(`Last Reconciliation:`);
      console.log(`  - Call ID: ${account.lastReconciliation.call_id}`);
      console.log(`  - Seconds Deducted: ${account.lastReconciliation.seconds_deducted}`);
      console.log(`  - Reconciled At: ${account.lastReconciliation.reconciled_at?.toDate()?.toISOString()}`);
    }
    console.log();
  });

  return flaggedAccounts;
}

/**
 * Clear flag for a specific user
 */
async function clearFlag(userId, addCredits = 0) {
  console.log(`🔄 Clearing flag for user: ${userId}`);

  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    console.error(`❌ User not found: ${userId}`);
    return;
  }

  const data = userDoc.data();
  if (!data.flagged_for_review) {
    console.log(`⚠️ User ${userId} is not flagged`);
    return;
  }

  const updates = {
    flagged_for_review: false,
    flagged_reason: null,
    flagged_at: null,
    flag_cleared_at: admin.firestore.FieldValue.serverTimestamp(),
  };

  // Optionally add credits
  if (addCredits > 0) {
    const currentBalance = data.voice_balance_seconds || 0;
    updates.voice_balance_seconds = currentBalance + addCredits;
    console.log(`💰 Adding ${addCredits}s credits (${currentBalance}s → ${currentBalance + addCredits}s)`);
  }

  await userRef.update(updates);

  console.log(`✅ Flag cleared for user: ${userId}`);
  console.log(`   Reason was: ${data.flagged_reason}`);
  console.log(`   Flagged at: ${data.flagged_at?.toDate()?.toISOString()}`);
}

/**
 * Display statistics about flagged accounts
 */
async function displayStats() {
  console.log('📊 Flagged Accounts Statistics\n');

  const snapshot = await db.collection('users')
    .where('flagged_for_review', '==', true)
    .get();

  if (snapshot.empty) {
    console.log('✅ No flagged accounts!');
    return;
  }

  let totalFlagged = 0;
  let zeroBalanceCount = 0;
  let premiumCount = 0;
  let totalUnpaidSeconds = 0;
  const reasonCounts = {};

  snapshot.forEach((doc) => {
    const data = doc.data();
    totalFlagged++;

    if ((data.voice_balance_seconds || 0) === 0) {
      zeroBalanceCount++;
    }

    if (data.subscription?.tier !== 'free') {
      premiumCount++;
    }

    const reason = data.flagged_reason || 'Unknown';
    reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;

    // Extract unpaid seconds from reason string
    const match = reason.match(/(\d+)s unpaid/);
    if (match) {
      totalUnpaidSeconds += parseInt(match[1], 10);
    }
  });

  console.log(`Total Flagged: ${totalFlagged}`);
  console.log(`Zero Balance: ${zeroBalanceCount}`);
  console.log(`Premium Users: ${premiumCount}`);
  console.log(`Total Unpaid Seconds: ${totalUnpaidSeconds}s (~${Math.floor(totalUnpaidSeconds / 60)} minutes)`);
  console.log(`\nFlag Reasons:`);
  Object.entries(reasonCounts).forEach(([reason, count]) => {
    console.log(`  - ${reason}: ${count}`);
  });
}

/**
 * Interactive review mode
 */
async function interactiveReview() {
  const flaggedAccounts = await listFlaggedAccounts();

  if (flaggedAccounts.length === 0) {
    rl.close();
    return;
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  console.log('📝 Interactive Review Mode');
  console.log('Actions: clear [userId] [creditsToAdd], stats, list, exit\n');

  const processCommand = async () => {
    const answer = await ask('> ');
    const [command, ...args] = answer.trim().split(' ');

    switch (command.toLowerCase()) {
      case 'clear':
        if (args.length < 1) {
          console.log('Usage: clear USER_ID [CREDITS_TO_ADD]');
        } else {
          const userId = args[0];
          const credits = parseInt(args[1], 10) || 0;
          await clearFlag(userId, credits);
        }
        break;

      case 'stats':
        await displayStats();
        break;

      case 'list':
        await listFlaggedAccounts();
        break;

      case 'exit':
      case 'quit':
        console.log('👋 Goodbye!');
        rl.close();
        return;

      default:
        console.log('Unknown command. Available: clear, stats, list, exit');
    }

    // Continue loop
    processCommand();
  };

  processCommand();
}

/**
 * Main entry point
 */
async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    switch (command) {
      case 'list':
        await listFlaggedAccounts();
        rl.close();
        break;

      case 'clear':
        if (args.length < 1) {
          console.error('Usage: node reviewFlaggedAccounts.js clear USER_ID [CREDITS_TO_ADD]');
          process.exit(1);
        }
        const userId = args[0];
        const credits = parseInt(args[1], 10) || 0;
        await clearFlag(userId, credits);
        rl.close();
        break;

      case 'stats':
        await displayStats();
        rl.close();
        break;

      case 'interactive':
      case undefined:
        await interactiveReview();
        break;

      default:
        console.error('Unknown command. Available: list, clear, stats, interactive');
        console.log('\nUsage:');
        console.log('  node reviewFlaggedAccounts.js list');
        console.log('  node reviewFlaggedAccounts.js clear USER_ID [CREDITS_TO_ADD]');
        console.log('  node reviewFlaggedAccounts.js stats');
        console.log('  node reviewFlaggedAccounts.js interactive');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
