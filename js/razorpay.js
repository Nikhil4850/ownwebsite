const API_BASE = 'http://localhost:3000/api/payment';
const RAZORPAY_KEY = 'YOUR_RAZORPAY_KEY_ID'; // replace with your key

async function startPayment() {
  const btn = document.getElementById('payBtn');
  btn.textContent = 'Processing...';
  btn.disabled = true;

  try {
    // 1. Create order on backend
    const res = await fetch(`${API_BASE}/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: project.price,
        projectId: project.id,
        projectName: project.title,
      }),
    });
    const order = await res.json();
    if (!order.orderId) throw new Error('Order creation failed');

    // 2. Open Razorpay checkout
    const options = {
      key: RAZORPAY_KEY,
      amount: order.amount,
      currency: order.currency,
      name: 'DevProjects Store',
      description: project.title,
      order_id: order.orderId,
      handler: async function (response) {
        // 3. Verify payment on backend
        const verifyRes = await fetch(`${API_BASE}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            projectId: project.id,
          }),
        });
        const result = await verifyRes.json();
        if (result.success) {
          // Store download info and redirect
          sessionStorage.setItem('downloadData', JSON.stringify({
            projectName: project.title,
            zipUrl: result.zipUrl,
            instructions: result.instructions,
          }));
          window.location.href = 'success.html';
        } else {
          alert('Payment verification failed. Please contact support.');
        }
      },
      prefill: { name: '', email: '', contact: '' },
      theme: { color: '#6366f1' },
      modal: {
        ondismiss: function () {
          btn.textContent = 'Pay with Razorpay';
          btn.disabled = false;
        },
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();
    closeModal();
  } catch (err) {
    console.error(err);
    alert('Something went wrong. Please try again.');
    btn.textContent = 'Pay with Razorpay';
    btn.disabled = false;
  }
}
