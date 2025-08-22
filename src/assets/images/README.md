# Image Assets

This directory contains image assets for the PentryPal application.

## Onboarding Images

The following images are referenced in the onboarding screens and should be added:

- `onboarding-1.png` - Illustration for "Create Shopping Lists" slide
- `onboarding-2.png` - Illustration for "Share & Assign with Friends/Family" slide  
- `onboarding-3.png` - Illustration for "Track Spending & Pantry" slide
- `welcome.png` - Illustration for welcome screen "Shop smarter, together"

## Image Sources

These images correspond to the Google Stitch designs:
- Intro-1: https://lh3.googleusercontent.com/aida-public/AB6AXuBpbxZZ__gXeG37DQGGtsbGaQIEnObvhiMN8T5YnvpTIP1I_eDxt9avTJyFW8YuNYNEYPrXEwyXWprtgMtxY1Quq-oqbVUBt-6ERpFzj471VtiGft2dM47YMpFWtDRONVm5K55ZJ8cQACY3_KpsaJn7aHbrmM0wx5WMp5t1GSfvblhvzS4ira9CIVmp7bx1808H9ZGy8r2XzkEOjQBu4TG-0GPpuWt-nZjRZETy1t3q0yYRAKID6LCMJEbAwRa04pB0Zw3uyapsgg
- Intro-2: https://lh3.googleusercontent.com/aida-public/AB6AXuAE1TzSzkGIjQt5B5U0bsprl4n8FLVvEnQy2yqzCXVpocL77YvHp-FxsDA7aCmiVTdrGDTtegPB7u-045ShW3gCtcG_RybyQBSVWfgX2eMFYdnqTcB7lqP4ZPP4wTDg07QhEqFgG-hOH-jgTdEitgsCj_27ubDN9aOQmuHq31dsmL2-FsEKl5_hgVqvwGOoUzb5IOQ9RlKz4_e9sS0Pd006dwZHegGYdilgwR7YaxZUV1ixLkV2dsKXOnM0WoShKbNrE2fjKDBPxg
- Intro-3: https://lh3.googleusercontent.com/aida-public/AB6AXuB-5D1kfRyPk4KqcrBsUlLzGFpKC6SQfhhrP4dYZa42-Wx2jO9tXPqcIhr9qfn5U9Dbhzl5ZqzuKs4KOe4FBBAPACif9ID0LE2MPvuBoCbwyxFyU-hMFnGVZHfqFbHSpKW3SSEPi31PugZpBUsDHi6DZcg8uS7oYmSj0y3cu06vzuf_Rd9M3ks3-F_Z_r5SuFGJSMm37kgb09RmlmCNWosGN7pBw46Imq1XZBRPoFhnQVGr-GGfoJAo8HRxnmUZMRc-bnHDoLxJkg
- Intro-4: https://lh3.googleusercontent.com/aida-public/AB6AXuB7mCQdKp_ze9GJI2pQLLLX_iAcgW04Ccoo9FGPFkZgR8UmLE_Gf9unl6hC0CnZ14Gso2PFaBp_dkfWG_CQtXIXbfQbck66GPbL9Fq3JCI1FYYufZsv6KR8MG5N-HEqmbuTIsU2mZkZMxKhkAq4vJg_eRr7LWu4XzZvO8CQTzedFUmTkHMYEp0f6TurfBIbB_OGxd8OQeJmYdP13oVyShJm259CVNhAM6PlzP5-U7ajAtgo5q7yPpt5ssYl-pOT3zTXpbDjatJanw

## Usage

Images are imported in React Native components using:
```typescript
const image = require('@/assets/images/onboarding-1.png');
```

## Format Requirements

- Format: PNG with transparency support
- Size: Optimized for mobile (recommend max 1024px width)
- Aspect Ratio: Square (1:1) for onboarding slides, 4:3 for welcome screen
- Quality: High quality but optimized for mobile performance