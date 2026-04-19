/**
 * Flagged Accounts Review Dashboard (HTTP Cloud Function)
 *
 * Provides a simple web interface to review flagged accounts.
 * Deploy with: firebase deploy --only functions:reviewDashboard
 *
 * Access at: https://us-central1-sarina-ai-2b2c1.cloudfunctions.net/reviewDashboard
 */

const admin = require('firebase-admin');

// Initialize if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Generate HTML dashboard
 */
function generateDashboardHTML(accounts, stats) {
  const accountRows = accounts.map(acc => `
    <tr>
      <td>${acc.userId.substring(0, 8)}...</td>
      <td>${acc.email || 'N/A'}</td>
      <td>${acc.flaggedReason}</td>
      <td>${new Date(acc.flaggedAt).toLocaleString()}</td>
      <td>${acc.currentBalance}s</td>
      <td>${acc.isPremium ? '✅' : '❌'}</td>
      <td>
        <button onclick="clearFlag('${acc.userId}')">Clear</button>
        <button onclick="clearFlag('${acc.userId}', 300)">Clear + 5min</button>
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Sarina AI - Flagged Accounts Review</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 {
      color: #333;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-card h3 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 14px;
      text-transform: uppercase;
    }
    .stat-card .value {
      font-size: 32px;
      font-weight: bold;
      color: #333;
    }
    table {
      width: 100%;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-collapse: collapse;
      overflow: hidden;
    }
    th {
      background: #4285f4;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #eee;
    }
    tr:hover {
      background: #f9f9f9;
    }
    button {
      background: #4285f4;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 5px;
      font-size: 12px;
    }
    button:hover {
      background: #357ae8;
    }
    .refresh-btn {
      margin: 20px 0;
      padding: 12px 24px;
      font-size: 16px;
    }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .empty-state h2 {
      color: #4caf50;
      margin: 0 0 10px 0;
    }
  </style>
</head>
<body>
  <h1>🚩 Flagged Accounts Review Dashboard</h1>

  <div class="stats">
    <div class="stat-card">
      <h3>Total Flagged</h3>
      <div class="value">${stats.totalFlagged}</div>
    </div>
    <div class="stat-card">
      <h3>Zero Balance</h3>
      <div class="value">${stats.zeroBalanceCount}</div>
    </div>
    <div class="stat-card">
      <h3>Premium Users</h3>
      <div class="value">${stats.premiumCount}</div>
    </div>
    <div class="stat-card">
      <h3>Unpaid Time</h3>
      <div class="value">${Math.floor(stats.totalUnpaidSeconds / 60)}m</div>
    </div>
  </div>

  <button class="refresh-btn" onclick="location.reload()">🔄 Refresh</button>

  ${accounts.length === 0 ? `
    <div class="empty-state">
      <h2>✅ No Flagged Accounts!</h2>
      <p>All accounts are in good standing.</p>
    </div>
  ` : `
    <table>
      <thead>
        <tr>
          <th>User ID</th>
          <th>Email</th>
          <th>Reason</th>
          <th>Flagged At</th>
          <th>Balance</th>
          <th>Premium</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${accountRows}
      </tbody>
    </table>
  `}

  <script>
    async function clearFlag(userId, creditsToAdd = 0) {
      if (!confirm(\`Clear flag for user \${userId.substring(0, 8)}...?\`)) {
        return;
      }

      try {
        const response = await fetch(window.location.href, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clear', userId, creditsToAdd })
        });

        const result = await response.json();
        if (result.success) {
          alert('✅ Flag cleared successfully!');
          location.reload();
        } else {
          alert('❌ Error: ' + result.error);
        }
      } catch (error) {
        alert('❌ Error: ' + error.message);
      }
    }
  </script>
</body>
</html>
  `;
}

/**
 * Main function
 */
async function reviewDashboard(req, res) {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    // Handle POST requests (clear flag actions)
    if (req.method === 'POST') {
      const { action, userId, creditsToAdd } = req.body;

      if (action === 'clear' && userId) {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          res.status(404).json({ success: false, error: 'User not found' });
          return;
        }

        const data = userDoc.data();
        const updates = {
          flagged_for_review: false,
          flagged_reason: null,
          flagged_at: null,
          flag_cleared_at: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Optionally add credits
        if (creditsToAdd > 0) {
          const currentBalance = data.voice_balance_seconds || 0;
          updates.voice_balance_seconds = currentBalance + creditsToAdd;
        }

        await userRef.update(updates);

        res.json({ success: true });
        return;
      }

      res.status(400).json({ success: false, error: 'Invalid action' });
      return;
    }

    // Handle GET requests (display dashboard)
    const snapshot = await db.collection('users')
      .where('flagged_for_review', '==', true)
      .get();

    const accounts = [];
    let stats = {
      totalFlagged: 0,
      zeroBalanceCount: 0,
      premiumCount: 0,
      totalUnpaidSeconds: 0,
    };

    snapshot.forEach((doc) => {
      const data = doc.data();
      stats.totalFlagged++;

      if ((data.voice_balance_seconds || 0) === 0) {
        stats.zeroBalanceCount++;
      }

      if (data.subscription?.tier !== 'free') {
        stats.premiumCount++;
      }

      const reason = data.flagged_reason || 'Unknown';
      const match = reason.match(/(\d+)s unpaid/);
      if (match) {
        stats.totalUnpaidSeconds += parseInt(match[1], 10);
      }

      accounts.push({
        userId: doc.id,
        email: data.email || 'N/A',
        flaggedReason: reason,
        flaggedAt: data.flagged_at?.toDate()?.toISOString() || 'Unknown',
        currentBalance: data.voice_balance_seconds || 0,
        isPremium: data.subscription?.tier !== 'free',
      });
    });

    const html = generateDashboardHTML(accounts, stats);
    res.status(200).send(html);

  } catch (error) {
    console.error('Error in reviewDashboard:', error);
    res.status(500).send(`
      <h1>Error</h1>
      <p>${error.message}</p>
      <a href="/">Try again</a>
    `);
  }
}

module.exports = { reviewDashboard };
