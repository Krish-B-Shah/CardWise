export function getDemoStoreHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CardWise Simulated Merchant Checkout Lab</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0d1726;
      --card-bg: #14283f;
      --border: rgba(229, 233, 236, 0.12);
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #16866a;
      --accent: #16866a;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 24px;
      line-height: 1.5;
    }

    .container {
      max-width: 1100px;
      margin: 0 auto;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border);
      margin-bottom: 32px;
    }

    .logo-badge {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: #14283f;
      border: 1px solid rgba(229, 233, 236, 0.2);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }

    .title-group h1 {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .title-group p {
      font-size: 13px;
      color: var(--text-muted);
    }

    .header-links a {
      color: #16866a;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      margin-left: 16px;
      padding: 8px 14px;
      border-radius: 8px;
      background: rgba(22, 134, 106, 0.12);
      border: 1px solid rgba(22, 134, 106, 0.3);
      transition: all 0.2s;
    }

    .header-links a:hover {
      background: rgba(22, 134, 106, 0.22);
      background: rgba(59, 130, 246, 0.2);
    }

    .store-tabs {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      background: rgba(15, 23, 42, 0.6);
      padding: 6px;
      border-radius: 12px;
      border: 1px solid var(--border);
      overflow-x: auto;
    }

    .store-btn {
      flex: 1;
      padding: 10px 16px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-family: inherit;
      font-weight: 600;
      font-size: 14px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .store-btn.active {
      background: #1e293b;
      color: #38bdf8;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 1px solid rgba(56, 189, 248, 0.3);
    }

    .grid-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 24px;
    }

    @media (max-width: 860px) {
      .grid-layout {
        grid-template-columns: 1fr;
      }
    }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      backdrop-filter: blur(12px);
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-top: 16px;
    }

    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px;
      background: rgba(15, 23, 42, 0.5);
      border-radius: 10px;
      border: 1px solid var(--border);
    }

    .item-info h4 {
      font-size: 15px;
      font-weight: 600;
    }

    .item-info span {
      font-size: 12px;
      color: var(--text-muted);
    }

    .item-price {
      font-weight: 700;
      font-size: 16px;
      color: #f1f5f9;
    }

    .checkout-summary {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .summary-line {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: var(--text-muted);
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      font-size: 18px;
      font-weight: 700;
      color: #ffffff;
      padding-top: 16px;
      border-top: 1px dashed var(--border);
    }

    .checkout-btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      border: none;
      border-radius: 10px;
      color: white;
      font-family: inherit;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
    }

    .checkout-btn:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }

    .note-box {
      margin-top: 16px;
      padding: 12px;
      border-radius: 8px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      font-size: 12px;
      color: #6ee7b7;
      line-height: 1.4;
    }

    .tech-pill {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      background: rgba(255, 255, 255, 0.08);
      padding: 2px 6px;
      border-radius: 4px;
      color: #38bdf8;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo-badge">
        <div class="logo-icon">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="5" width="28" height="22" rx="4" fill="#FFFFFF"/>
            <rect x="2" y="10" width="28" height="4" fill="#0A1828"/>
            <circle cx="8" cy="20" r="2.5" fill="#16866A"/>
            <circle cx="13" cy="20" r="2.5" fill="#D97706" fill-opacity="0.85"/>
            <path d="M22 17L26 21M26 21H22M26 21V17" stroke="#16866A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="title-group">
          <h1>CardWise Simulated Merchant Lab</h1>
          <p>Local live test environment for Merchant DOM Adapters & Content Script</p>
        </div>
      </div>
      <div class="header-links">
        <a href="http://localhost:5173" target="_blank">Open React Dashboard &rarr;</a>
      </div>
    </header>

    <div class="store-tabs">
      <button class="store-btn active" onclick="switchStore('amazon')">🛒 Amazon Simulated Checkout</button>
      <button class="store-btn" onclick="switchStore('bestbuy')">📺 Best Buy Simulated Checkout</button>
      <button class="store-btn" onclick="switchStore('target')">🎯 Target Simulated Checkout</button>
      <button class="store-btn" onclick="switchStore('custom')">💻 Local Demo Store</button>
    </div>

    <div class="grid-layout">
      <!-- Left Column: Store Cart Details -->
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h2 id="store-title" style="font-size: 18px; font-weight:700;">Amazon.com Cart & Checkout</h2>
          <span id="domain-badge" class="tech-pill">amazon.com</span>
        </div>
        <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
          Merchant Category: <strong id="merchant-category" style="color:#f8fafc;">online_shopping</strong>
        </p>

        <div class="cart-items" id="cart-items-container">
          <!-- Dynamic Items -->
        </div>

        <div style="margin-top: 20px; display:flex; gap:10px;">
          <button onclick="addItem()" style="padding:8px 14px; background:#1e293b; border:1px solid var(--border); color:#f8fafc; border-radius:8px; cursor:pointer; font-size:13px;">+ Add Item</button>
          <button onclick="resetCart()" style="padding:8px 14px; background:transparent; border:1px solid var(--border); color:var(--text-muted); border-radius:8px; cursor:pointer; font-size:13px;">Reset Cart</button>
        </div>
      </div>

      <!-- Right Column: Simulated DOM Checkout Target Area -->
      <div class="card">
        <h3 style="font-size:16px; margin-bottom:12px;">Order Summary</h3>
        <p style="font-size:12px; color:var(--text-muted); margin-bottom:16px;">
          Contains native DOM selectors monitored by CardWise <span class="tech-pill">MerchantAdapter</span>
        </p>

        <!-- Simulated DOM structure container matching adapter selectors -->
        <div id="checkout-container" class="checkout-summary">
          <div class="summary-line">
            <span>Items Subtotal:</span>
            <span id="subtotal-val">$149.99</span>
          </div>
          <div class="summary-line">
            <span>Shipping & Handling:</span>
            <span>$0.00</span>
          </div>
          <div class="summary-line">
            <span>Estimated Tax:</span>
            <span id="tax-val">$12.00</span>
          </div>

          <!-- Merchant-specific DOM subtotal elements -->
          <div class="summary-total" id="store-dom-wrapper">
            <span>Order Subtotal:</span>
            <!-- Will be replaced dynamically with retailer specific DOM elements -->
            <span id="active-subtotal-elem">$161.99</span>
          </div>

          <button class="checkout-btn" onclick="alert('Demo checkout clicked! CardWise safely analyzed rewards without touching payment credentials.')">
            Proceed to Checkout
          </button>

          <div class="note-box">
            <strong>🔒 Security & Privacy Notice:</strong><br>
            CardWise content scripts read ONLY the subtotal DOM element and normalized domain. Never inspects credit card inputs, CVVs, passwords, or personal data.
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const stores = {
      amazon: {
        name: 'Amazon.com Checkout',
        domain: 'amazon.com',
        category: 'online_shopping',
        items: [
          { name: 'Sony WH-1000XM5 Wireless Headphones', price: 149.99, qty: 1 },
          { name: 'Anker USB-C Fast Charger 65W', price: 29.99, qty: 1 }
        ],
        // Amazon subtotal DOM pattern
        domHtml: '<span id="subtotal" class="a-price"><span class="a-offscreen">$179.98</span><span aria-hidden="true">$179.98</span></span>'
      },
      bestbuy: {
        name: 'Best Buy Cart & Checkout',
        domain: 'bestbuy.com',
        category: 'electronics',
        items: [
          { name: 'Apple iPad Air 11-inch M2 128GB', price: 549.00, qty: 1 },
          { name: 'Logitech MX Master 3S Mouse', price: 99.99, qty: 1 }
        ],
        // Best Buy subtotal DOM pattern
        domHtml: '<div class="price-summary__total-value" data-automation-id="order-total">$648.99</div>'
      },
      target: {
        name: 'Target Checkout',
        domain: 'target.com',
        category: 'retail',
        items: [
          { name: 'Dyson V8 Cordless Vacuum', price: 349.99, qty: 1 },
          { name: 'Threshold Organic Sheet Set', price: 45.00, qty: 1 }
        ],
        // Target subtotal DOM pattern
        domHtml: '<span data-test="cart-summary-total">$394.99</span>'
      },
      custom: {
        name: 'CardWise Demo Store',
        domain: 'localhost',
        category: 'online_shopping',
        items: [
          { name: 'Framework Laptop 13 Ultra', price: 1049.00, qty: 1 }
        ],
        domHtml: '<span id="order-subtotal" class="subtotal-amount">$1049.00</span>'
      }
    };

    let currentStoreKey = 'amazon';

    function renderCart() {
      const store = stores[currentStoreKey];
      document.getElementById('store-title').innerText = store.name;
      document.getElementById('domain-badge').innerText = store.domain;
      document.getElementById('merchant-category').innerText = store.category;

      const container = document.getElementById('cart-items-container');
      container.innerHTML = '';

      let subtotal = 0;
      store.items.forEach((item, idx) => {
        subtotal += item.price * item.qty;
        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = \`
          <div class="item-info">
            <h4>\${item.name}</h4>
            <span>Qty: \${item.qty}</span>
          </div>
          <div class="item-price">$\${(item.price * item.qty).toFixed(2)}</div>
        \`;
        container.appendChild(row);
      });

      const tax = subtotal * 0.08;
      const total = subtotal + tax;

      document.getElementById('subtotal-val').innerText = '$' + subtotal.toFixed(2);
      document.getElementById('tax-val').innerText = '$' + tax.toFixed(2);

      // Render retailer specific selector DOM
      const domWrapper = document.getElementById('store-dom-wrapper');
      if (currentStoreKey === 'amazon') {
        domWrapper.innerHTML = \`<span>Order Subtotal:</span><span id="subtotal" class="a-price" data-testid="amazon-subtotal"><span class="a-offscreen">$\${subtotal.toFixed(2)}</span><span aria-hidden="true">$\${subtotal.toFixed(2)}</span></span>\`;
      } else if (currentStoreKey === 'bestbuy') {
        domWrapper.innerHTML = \`<span>Total:</span><div class="price-summary__total-value" data-automation-id="order-total">$\${subtotal.toFixed(2)}</div>\`;
      } else if (currentStoreKey === 'target') {
        domWrapper.innerHTML = \`<span>Subtotal:</span><span data-test="cart-summary-total">$\${subtotal.toFixed(2)}</span>\`;
      } else {
        domWrapper.innerHTML = \`<span>Subtotal:</span><span id="order-subtotal" class="subtotal-amount">$\${subtotal.toFixed(2)}</span>\`;
      }

      // Dispatch an event so extension adapters listening to dynamic checkout or DOM changes can detect it
      window.dispatchEvent(new CustomEvent('cardwise:cart-updated', { detail: { subtotal, domain: store.domain } }));
    }

    function switchStore(storeKey) {
      currentStoreKey = storeKey;
      document.querySelectorAll('.store-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = Array.from(document.querySelectorAll('.store-btn')).find(b => b.getAttribute('onclick').includes(storeKey));
      if (activeBtn) activeBtn.classList.add('active');
      renderCart();
    }

    function addItem() {
      const store = stores[currentStoreKey];
      store.items.push({
        name: 'Simulated Purchase Add-on',
        price: 25.00,
        qty: 1
      });
      renderCart();
    }

    function resetCart() {
      const store = stores[currentStoreKey];
      store.items = [store.items[0]];
      renderCart();
    }

    window.onload = () => {
      renderCart();
    };
  </script>
</body>
</html>`;
}
