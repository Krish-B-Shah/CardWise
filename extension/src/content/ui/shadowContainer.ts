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
    logo.innerHTML = `<svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="5" width="28" height="22" rx="4" fill="#FFFFFF"/>
      <rect x="2" y="10" width="28" height="4" fill="#0A1828"/>
      <circle cx="8" cy="20" r="2.5" fill="#16866A"/>
      <circle cx="13" cy="20" r="2.5" fill="#D97706" fill-opacity="0.85"/>
      <path d="M22 17L26 21M26 21H22M26 21V17" stroke="#16866A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

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
    closeBtn.title = 'Dismiss recommendation (Esc)';
    closeBtn.setAttribute('aria-label', 'Dismiss recommendation');
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

      // Recommended Card Box
      const cardBox = document.createElement('div');
      cardBox.className = 'cw-card-highlight';

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
      earnLabel.textContent = `estimated return on $${recommendation.purchaseAmount.toFixed(2)}`;

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
          altName.className = 'cw-alt-name';
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
    currencySymbol.className = 'cw-currency-symbol';

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
    openPopupBtn.textContent = 'Open Dashboard & Card Portfolio ↗';
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
        width: 340px;
        background: #ffffff;
        color: #14283f;
        border-radius: 12px;
        border: 1px solid #e5e9ec;
        box-shadow: 0 10px 25px -5px rgba(20, 40, 63, 0.15), 0 8px 10px -6px rgba(20, 40, 63, 0.08);
        overflow: hidden;
        animation: cwSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
        font-variant-numeric: tabular-nums;
      }

      @keyframes cwSlideIn {
        from {
          opacity: 0;
          transform: translateY(12px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .cw-panel {
          animation: none;
        }
      }

      .cw-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 14px;
        background: #14283f;
        color: #ffffff;
      }

      .cw-brand-group {
        display: flex;
        align-items: center;
        gap: 9px;
      }

      .cw-logo {
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .cw-title {
        font-size: 13px;
        font-weight: 700;
        color: #ffffff;
        line-height: 1.2;
        letter-spacing: -0.01em;
      }

      .cw-subtitle {
        font-size: 11px;
        color: #94a3b8;
        line-height: 1.2;
      }

      .cw-close-btn {
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 20px;
        cursor: pointer;
        line-height: 1;
        padding: 2px 6px;
        border-radius: 4px;
        transition: background 0.15s ease, color 0.15s ease;
      }

      .cw-close-btn:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.12);
      }

      .cw-body {
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        background: #ffffff;
      }

      .cw-card-highlight {
        background: #f8f9f7;
        border: 1px solid #e5e9ec;
        border-radius: 8px;
        padding: 12px 14px;
        box-sizing: border-box;
      }

      .cw-card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }

      .cw-card-name {
        font-size: 13px;
        font-weight: 600;
        color: #14283f;
      }

      .cw-rate-badge {
        background: rgba(22, 134, 106, 0.1);
        color: #16866a;
        border: 1px solid rgba(22, 134, 106, 0.25);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }

      .cw-card-mid {
        display: flex;
        align-items: baseline;
        gap: 8px;
        margin-bottom: 4px;
      }

      .cw-earn-amount {
        font-size: 22px;
        font-weight: 700;
        color: #16866a;
        font-variant-numeric: tabular-nums;
      }

      .cw-earn-label {
        font-size: 11px;
        color: #64748b;
        font-variant-numeric: tabular-nums;
      }

      .cw-rule-desc {
        font-size: 11px;
        color: #64748b;
        line-height: 1.4;
      }

      .cw-alt-section {
        background: #fafafa;
        border: 1px solid #e5e9ec;
        border-radius: 8px;
        padding: 10px 12px;
      }

      .cw-section-title {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748b;
        margin-bottom: 6px;
        font-weight: 700;
      }

      .cw-alt-row {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        padding: 5px 0;
        border-bottom: 1px dashed #e5e9ec;
      }

      .cw-alt-row:last-child {
        border-bottom: none;
      }

      .cw-alt-name {
        color: #14283f;
        font-weight: 500;
      }

      .cw-alt-rate {
        color: #16866a;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }

      .cw-amount-bar {
        background: #f8f9f7;
        border: 1px solid #e5e9ec;
        border-radius: 8px;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 11px;
      }

      .cw-amount-label {
        color: #64748b;
        font-weight: 500;
      }

      .cw-input-group {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .cw-currency-symbol {
        color: #64748b;
        font-weight: 600;
        font-size: 13px;
      }

      .cw-input {
        width: 84px;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        color: #14283f;
        border-radius: 6px;
        padding: 5px 8px;
        font-size: 12px;
        font-family: inherit;
        font-variant-numeric: tabular-nums;
        transition: border-color 0.15s ease;
      }

      .cw-input:focus {
        outline: none;
        border-color: #16866a;
        box-shadow: 0 0 0 2px rgba(22, 134, 106, 0.15);
      }

      .cw-btn-sm {
        background: #14283f;
        border: none;
        color: #ffffff;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.15s ease;
      }

      .cw-btn-sm:hover {
        background: #0a1828;
      }

      .cw-footer {
        padding: 10px 14px;
        background: #f8f9f7;
        border-top: 1px solid #e5e9ec;
        text-align: center;
      }

      .cw-link-btn {
        background: transparent;
        border: none;
        color: #16866a;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        padding: 4px;
        transition: color 0.15s ease;
      }

      .cw-link-btn:hover {
        text-decoration: underline;
        color: #116952;
      }

      .cw-empty-state {
        font-size: 12px;
        color: #64748b;
        text-align: center;
        padding: 14px 0;
      }
    `;
  }
}
