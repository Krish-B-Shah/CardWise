## 📋 Pull Request Summary

### 🎯 Motivation & Context
<!-- Describe the problem solved or the feature introduced. -->

### 🛠️ Key Changes
- 

### 🔒 Security & Privacy Review
- [ ] No payment fields, credit cards, CVVs, or credentials inspected or stored.
- [ ] Only minimal sanitized data sent to recommendation endpoints (domain, category, subtotal).
- [ ] No remote code execution or arbitrary scripts injected into webpage DOMs.
- [ ] Isolated Shadow DOM container maintained for all content script widgets.

### 🧪 Testing & Verification
- [ ] All unit tests pass (`npm run test`)
- [ ] Dashboard builds cleanly (`npm --workspace=dashboard run build`)
- [ ] Chrome Extension bundles cleanly (`npm run build:extension`)

### 📦 Checklist
- [ ] Follows conventional commits formatting (`feat:`, `fix:`, `refactor:`, `chore:`)
- [ ] Branch branched from latest `main`
- [ ] Ready for squash-and-merge
