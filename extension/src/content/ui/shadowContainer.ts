import { RecommendationResult, SubtotalExtractionResult } from '../../shared/types.js';

export interface PanelCallbacks {
  onManualAmountChange: (newAmount: number) => void;
  onDismiss: () => void;
  onOpenPopup: () => void;
}

const SHADOW_HOST_ID = 'cardwise-checkout-host';

export class ShadowPanelManager {
  private hostEl: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private isDismissed = false;

  constructor() {
    // Check if dismissed in this session
    try {
      this.isDismissed = sessionStorage.getItem('cardwise_dismissed') === 'true';
    } catch {
      this.isDismissed = false;
    }
  }

  isAlreadyMounted(): boolean {
    return document.getElementById(SHADOW_HOST_ID) !== null;
  }

  remove(): void {
    if (this.hostEl && this.hostEl.parentNode) {
      this.hostEl.parentNode.removeChild(this.hostEl);
    }
    this.hostEl = null;
    this.shadowRoot = null;
  }

  dismiss(): void {
    try {
      sessionStorage.setItem('cardwise_dismissed', 'true');
    } catch {}
    this.isDismissed = true;
    this.remove();
  }

  render(
    recommendation: RecommendationResult | null,
    extraction: SubtotalExtractionResult,
    callbacks: PanelCallbacks
  ): void {
    if (this.isDismissed) return;

    let host = document.getElementById(SHADOW_HOST_ID) as HTMLElement | null;
    if (!host) {
      host = document.createElement('div');
      host.id = SHADOW_HOST_ID;
      host.style.position = 'fixed';
      host.style.bottom = '20px';
      host.style.right = '20px';
      host.style.zIndex = '2147483647'; // Highest z-index
      host.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      (document.body || document.documentElement).appendChild(host);
      this.hostEl = host;
      this.shadowRoot = host.attachShadow({ mode: 'open' });
    } else {
      this.hostEl = host;
      this.shadowRoot = host.shadowRoot;
    }

    if (!this.shadowRoot) return;

    // Build the isolated shadow DOM contents
    this.shadowRoot.innerHTML = '';

    const styleEl = document.createElement('style');
    styleEl.textContent = this.getStyles();
    this.shadowRoot.appendChild(styleEl);

    const container = document.createElement('div');
    container.className = 'cw-panel';
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-label', 'CardWise Credit Card Recommendation');

    // Handle Escape key to dismiss
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.dismiss();
        callbacks.onDismiss();
        window.removeEventListener('keydown', handleKeydown);
      }
    };
    window.addEventListener('keydown', handleKeydown);

    // Header
    const header = document.createElement('div');
    header.className = 'cw-header';

    const brandGroup = document.createElement('div');
    brandGroup.className = 'cw-brand-group';

    const logo = document.createElement('div');
    logo.className = 'cw-logo';
    logo.textContent = 'CW';

    const titleGroup = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'cw-title';
    title.textContent = 'CardWise';

    const subtitle = document.createElement('div');
    subtitle.className = 'cw-subtitle';
    subtitle.textContent = recommendation ? `${recommendation.merchant.name} Reward Match` : 'Checkout Optimization';

    titleGroup.appendChild(title);
    titleGroup.appendChild(subtitle);
    brandGroup.appendChild(logo);
    brandGroup.appendChild(titleGroup);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'cw-close-btn';
    closeBtn.title = 'Dismiss recommendation';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = () => {
      this.dismiss();
      callbacks.onDismiss();
    };

    header.appendChild(brandGroup);
    header.appendChild(closeBtn);
    container.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'cw-body';

    if (recommendation && recommendation.bestCard) {
      const best = recommendation.bestCard;

      // Recommended Card Highlight Box
      const cardBox = document.createElement('div');
      cardBox.className = 'cw-card-highlight';
      cardBox.style.background = best.colorGradient || 'linear-gradient(135deg, #2563eb, #1e40af)';

      const cardTop = document.createElement('div');
      cardTop.className = 'cw-card-top';

      const cardName = document.createElement('span');
      cardName.className = 'cw-card-name';
      cardName.textContent = `${best.name} (•••• ${best.lastFour})`;

      const rateBadge = document.createElement('span');
      rateBadge.className = 'cw-rate-badge';
      rateBadge.textContent = best.cashbackPercentage;

      cardTop.appendChild(cardName);
      cardTop.appendChild(rateBadge);

      const cardMid = document.createElement('div');
      cardMid.className = 'cw-card-mid';

      const earnAmount = document.createElement('div');
      earnAmount.className = 'cw-earn-amount';
      earnAmount.textContent = `+$${best.estimatedCashback.toFixed(2)}`;

      const earnLabel = document.createElement('div');
      earnLabel.className = 'cw-earn-label';
      earnLabel.textContent = `estimated cashback on $${recommendation.purchaseAmount.toFixed(2)}`;

      cardMid.appendChild(earnAmount);
      cardMid.appendChild(earnLabel);

      const cardRuleDesc = document.createElement('div');
      cardRuleDesc.className = 'cw-rule-desc';
      cardRuleDesc.textContent = best.rewardRuleDescription;

      cardBox.appendChild(cardTop);
      cardBox.appendChild(cardMid);
      cardBox.appendChild(cardRuleDesc);
      body.appendChild(cardBox);

      // Alternatives
      if (recommendation.alternatives && recommendation.alternatives.length > 0) {
        const altSection = document.createElement('div');
        altSection.className = 'cw-alt-section';

        const altTitle = document.createElement('div');
        altTitle.className = 'cw-section-title';
        altTitle.textContent = 'Other eligible cards';
        altSection.appendChild(altTitle);

        recommendation.alternatives.forEach(alt => {
          const altRow = document.createElement('div');
          altRow.className = 'cw-alt-row';

          const altName = document.createElement('span');
          altName.textContent = alt.name;

          const altRate = document.createElement('span');
          altRate.className = 'cw-alt-rate';
          altRate.textContent = `${alt.cashbackPercentage} ($${alt.estimatedCashback.toFixed(2)})`;

          altRow.appendChild(altName);
          altRow.appendChild(altRate);
          altSection.appendChild(altRow);
        });

        body.appendChild(altSection);
      }
    } else {
      // Pending / loading or no cards state
      const emptyState = document.createElement('div');
      emptyState.className = 'cw-empty-state';
      emptyState.textContent = 'Analyzing checkout subtotal and card rewards...';
      body.appendChild(emptyState);
    }

    // Amount input / subtotal override bar
    const amountBar = document.createElement('div');
    amountBar.className = 'cw-amount-bar';

    const amountLabel = document.createElement('span');
    amountLabel.className = 'cw-amount-label';
    if (extraction.status === 'success') {
      amountLabel.textContent = `Detected subtotal: $${(extraction.amount || 0).toFixed(2)}`;
    } else {
      amountLabel.textContent = 'Subtotal not detected. Enter amount:';
    }

    const inputGroup = document.createElement('div');
    inputGroup.className = 'cw-input-group';

    const currencySymbol = document.createElement('span');
    currencySymbol.textContent = '$';
    currencySymbol.style.color = '#94a3b8';

    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.className = 'cw-input';
    amountInput.step = '0.01';
    amountInput.min = '0';
    amountInput.value = recommendation ? recommendation.purchaseAmount.toFixed(2) : (extraction.amount ? extraction.amount.toFixed(2) : '100.00');

    const updateBtn = document.createElement('button');
    updateBtn.className = 'cw-btn-sm';
    updateBtn.textContent = 'Update';
    updateBtn.onclick = () => {
      const val = parseFloat(amountInput.value);
      if (!isNaN(val) && val >= 0) {
        callbacks.onManualAmountChange(val);
      }
    };

    inputGroup.appendChild(currencySymbol);
    inputGroup.appendChild(amountInput);
    inputGroup.appendChild(updateBtn);

    amountBar.appendChild(amountLabel);
    amountBar.appendChild(inputGroup);
    body.appendChild(amountBar);

    // Footer actions
    const footer = document.createElement('div');
    footer.className = 'cw-footer';

    const openPopupBtn = document.createElement('button');
    openPopupBtn.className = 'cw-link-btn';
    openPopupBtn.textContent = 'Open Dashboard & More Details ↗';
    openPopupBtn.onclick = () => {
      callbacks.onOpenPopup();
    };

    footer.appendChild(openPopupBtn);

    container.appendChild(body);
    container.appendChild(footer);

    this.shadowRoot.appendChild(container);
  }

  private getStyles(): string {
    return `
      .cw-panel {
        width: 330px;
        background: #0f172a;
        color: #f8fafc;
        border-radius: 16px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.12);
        overflow: hidden;
        animation: cwSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        box-sizing: border-box;
      }

      @keyframes cwSlideIn {
        from {
          opacity: 0;
          transform: translateY(16px) scale(0.96);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .cw-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background: rgba(30, 41, 59, 0.7);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .cw-brand-group {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .cw-logo {
        width: 28px;
        height: 28px;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 13px;
        color: white;
      }

      .cw-title {
        font-size: 13px;
        font-weight: 700;
        color: #f8fafc;
        line-height: 1.2;
      }

      .cw-subtitle {
        font-size: 11px;
        color: #94a3b8;
      }

      .cw-close-btn {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 20px;
        cursor: pointer;
        line-height: 1;
        padding: 4px;
        border-radius: 4px;
      }

      .cw-close-btn:hover {
        color: #f8fafc;
        background: rgba(255, 255, 255, 0.1);
      }

      .cw-body {
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .cw-card-highlight {
        border-radius: 12px;
        padding: 14px;
        color: white;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      .cw-card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .cw-card-name {
        font-size: 12px;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0,0,0,0.4);
      }

      .cw-rate-badge {
        background: rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(4px);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 700;
      }

      .cw-card-mid {
        display: flex;
        align-items: baseline;
        gap: 6px;
        margin-bottom: 6px;
      }

      .cw-earn-amount {
        font-size: 22px;
        font-weight: 800;
        color: #38ef7d;
        text-shadow: 0 2px 4px rgba(0,0,0,0.4);
      }

      .cw-earn-label {
        font-size: 11px;
        opacity: 0.85;
      }

      .cw-rule-desc {
        font-size: 11px;
        opacity: 0.9;
        line-height: 1.3;
      }

      .cw-alt-section {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 10px;
        padding: 10px 12px;
      }

      .cw-section-title {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #94a3b8;
        margin-bottom: 6px;
        font-weight: 600;
      }

      .cw-alt-row {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #cbd5e1;
        padding: 4px 0;
      }

      .cw-alt-rate {
        color: #38bdf8;
        font-weight: 600;
      }

      .cw-amount-bar {
        background: rgba(30, 41, 59, 0.5);
        border-radius: 8px;
        padding: 8px 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 11px;
      }

      .cw-amount-label {
        color: #94a3b8;
      }

      .cw-input-group {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .cw-input {
        width: 80px;
        background: #1e293b;
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #f8fafc;
        border-radius: 6px;
        padding: 4px 8px;
        font-size: 12px;
        font-family: inherit;
      }

      .cw-input:focus {
        outline: none;
        border-color: #3b82f6;
      }

      .cw-btn-sm {
        background: #3b82f6;
        border: none;
        color: white;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
      }

      .cw-btn-sm:hover {
        background: #2563eb;
      }

      .cw-footer {
        padding: 10px 16px;
        background: rgba(15, 23, 42, 0.5);
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        text-align: center;
      }

      .cw-link-btn {
        background: transparent;
        border: none;
        color: #38bdf8;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        padding: 4px;
      }

      .cw-link-btn:hover {
        text-decoration: underline;
      }

      .cw-empty-state {
        font-size: 12px;
        color: #94a3b8;
        text-align: center;
        padding: 12px 0;
      }
    `;
  }
}
