const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Project download links (store securely, not in frontend)
const projectDownloads = {
  'proj_001': {
    zipUrl: 'https://your-storage.com/projects/ecommerce-app.zip',
    instructions: `# How to Run - E-Commerce App\n\n1. Extract the zip file\n2. Run \`npm install\`\n3. Copy \`.env.example\` to \`.env\` and fill in your DB credentials\n4. Run \`npm start\`\n5. Open http://localhost:3000`,
  },
  'proj_002': {
    zipUrl: 'https://your-storage.com/projects/chat-app.zip',
    instructions: `# How to Run - Real-Time Chat App\n\n1. Extract the zip file\n2. Run \`npm install\`\n3. Set up MongoDB URI in \`.env\`\n4. Run \`npm run dev\`\n5. Open http://localhost:5000`,
  },
  'proj_003': {
    zipUrl: 'https://your-storage.com/projects/portfolio.zip',
    instructions: `# How to Run - Portfolio Website\n\n1. Extract the zip file\n2. Open \`index.html\` in browser\n3. Edit \`data.js\` to update your info\n4. Deploy to GitHub Pages or Netlify`,
  },
};

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  const { amount, projectId, projectName } = req.body;

  if (!projectDownloads[projectId]) {
    return res.status(400).json({ error: 'Invalid project' });
  }

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: `receipt_${projectId}_${Date.now()}`,
      notes: { projectId, projectName },
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment & return download info
router.post('/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, projectId } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, error: 'Payment verification failed' });
  }

  const download = projectDownloads[projectId];
  if (!download) {
    return res.status(400).json({ success: false, error: 'Project not found' });
  }

  res.json({
    success: true,
    zipUrl: download.zipUrl,
    instructions: download.instructions,
  });
});

module.exports = router;
