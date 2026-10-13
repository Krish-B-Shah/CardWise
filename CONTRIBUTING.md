# Contributing & Engineering Merging Rules

Welcome to the **CardWise** engineering repository. This document outlines branch policies, pull request procedures, and code review standards.

---

## 🌿 Branching Strategy

All engineers must create dedicated feature branches off the latest `main` branch. Direct commits to `main` are restricted.

### Branch Naming Conventions
- `feat/<feature-name>`: New functionality or major components (e.g. `feat/walmart-adapter`, `feat/export-csv`)
- `fix/<issue-name>`: Bug fixes, patch corrections (e.g. `fix/currency-parse-locale`)
- `refactor/<target>`: Code refactoring without behavioral modifications (e.g. `refactor/shadow-dom-styles`)
- `perf/<target>`: Performance and bundle size optimizations (e.g. `perf/debounce-mutation-observer`)
- `docs/<topic>`: Documentation and architecture updates (e.g. `docs/api-specs`)
- `test/<target>`: New tests or test infrastructure (e.g. `test/adapter-edge-cases`)

---

## 🔀 Pull Request & Merging Rules

1. **Pull Request Requirements**:
   - Every PR must utilize the [Pull Request Template](.github/pull_request_template.md).
   - Describe the exact context, changes made, and provide test evidence.
2. **Automated CI Gates**:
   - The GitHub Actions CI workflow must pass all test suites before merge approval.
3. **Squash and Merge Convention**:
   - To keep git history clean, maintain linear history by squashing feature branch commits on merge (`gh pr merge --squash`).
4. **Branch Cleanup**:
   - Feature branches must be deleted upon successful merge.
5. **Security Invariants**:
   - Never inspect or capture payment credentials, card numbers, or passwords.
   - All extension DOM widgets must remain isolated within Shadow DOM.
