/**
 * Delete All Users Script
 *
 * This script will delete ALL user data from:
 * 1. Firebase Authentication
 * 2. Firestore users collection
 * 3. Any subcollections or related data
 *
 * WARNING: This is IRREVERSIBLE! Use with extreme caution.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin SDK using environment variables
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
  console.error('❌ Missing Firebase credentials in backend/.env file');
  console.error('   Required: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

const db = admin.firestore();
const auth = admin.auth();

// Create readline interface for confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Delete all users from Firebase Authentication
 */
async function deleteAllAuthUsers() {
  console.log('\n🔥 Deleting all Firebase Auth users...');

  let deletedCount = 0;
  let errors = 0;

  try {
    const listUsersResult = await auth.listUsers();
    const users = listUsersResult.users;

    console.log(`📊 Found ${users.length} users in Firebase Auth`);

    for (const user of users) {
      try {
        await auth.deleteUser(user.uid);
        deletedCount++;
        console.log(`✅ Deleted Auth user: ${user.uid} (${user.email || 'no email'})`);
      } catch (error) {
        errors++;
        console.error(`❌ Error deleting Auth user ${user.uid}:`, error.message);
      }
    }

    console.log(`\n📈 Auth deletion complete: ${deletedCount} deleted, ${errors} errors`);
  } catch (error) {
    console.error('❌ Error listing Auth users:', error);
    throw error;
  }
}

/**
 * Delete all documents from a Firestore collection
 */
async function deleteCollection(collectionPath, batchSize = 100) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve, reject);
  });
}

async function deleteQueryBatch(query, resolve, reject) {
  try {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
      resolve();
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✅ Deleted batch of ${snapshot.size} documents`);

    // Recurse on the next process tick
    process.nextTick(() => {
      deleteQueryBatch(query, resolve, reject);
    });
  } catch (error) {
    reject(error);
  }
}

/**
 * Delete all user documents from Firestore
 */
async function deleteAllFirestoreUsers() {
  console.log('\n🔥 Deleting all Firestore user documents...');

  try {
    // Get all users collection documents
    const usersSnapshot = await db.collection('users').get();
    console.log(`📊 Found ${usersSnapshot.size} user documents in Firestore`);

    let deletedCount = 0;
    let errors = 0;

    for (const doc of usersSnapshot.docs) {
      try {
        const userId = doc.id;

        // Delete any subcollections if they exist
        // Add any subcollections your app uses here
        const subcollections = [
          'girlfriends',
          'messages',
          'conversations',
          'preferences',
          'settings'
        ];

        for (const subcollection of subcollections) {
          try {
            const subcollectionRef = db.collection(`users/${userId}/${subcollection}`);
            const subcollectionSnapshot = await subcollectionRef.get();

            if (!subcollectionSnapshot.empty) {
              console.log(`  ↳ Deleting ${subcollectionSnapshot.size} documents from ${subcollection}`);
              await deleteCollection(`users/${userId}/${subcollection}`);
            }
          } catch (error) {
            // Subcollection might not exist, that's okay
          }
        }

        // Delete the main user document
        await doc.ref.delete();
        deletedCount++;
        console.log(`✅ Deleted Firestore user: ${userId} (${doc.data().email || 'no email'})`);
      } catch (error) {
        errors++;
        console.error(`❌ Error deleting Firestore user ${doc.id}:`, error.message);
      }
    }

    console.log(`\n📈 Firestore deletion complete: ${deletedCount} deleted, ${errors} errors`);
  } catch (error) {
    console.error('❌ Error deleting Firestore users:', error);
    throw error;
  }
}

/**
 * Main deletion function
 */
async function deleteAllUsers() {
  console.log('\n⚠️  WARNING: This will delete ALL user data from:');
  console.log('   - Firebase Authentication');
  console.log('   - Firestore users collection');
  console.log('   - All user subcollections');
  console.log('\n⚠️  THIS ACTION CANNOT BE UNDONE!\n');

  rl.question('Type "DELETE ALL USERS" to confirm: ', async (answer) => {
    if (answer === 'DELETE ALL USERS') {
      console.log('\n🚀 Starting deletion process...\n');

      try {
        // Delete from Firestore first (in case Auth deletion fails)
        await deleteAllFirestoreUsers();

        // Then delete from Auth
        await deleteAllAuthUsers();

        console.log('\n✅ All user data deleted successfully!');
        console.log('\n📊 Summary:');
        console.log('   - All Firebase Auth users deleted');
        console.log('   - All Firestore user documents deleted');
        console.log('   - All user subcollections deleted');

      } catch (error) {
        console.error('\n❌ Deletion process failed:', error);
      } finally {
        rl.close();
        process.exit(0);
      }
    } else {
      console.log('\n❌ Deletion cancelled. You must type exactly "DELETE ALL USERS" to confirm.');
      rl.close();
      process.exit(1);
    }
  });
}

// Run the script
deleteAllUsers();
