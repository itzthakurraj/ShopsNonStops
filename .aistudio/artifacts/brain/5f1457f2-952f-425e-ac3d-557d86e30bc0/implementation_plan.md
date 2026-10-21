# Multi-Portal Separation, Vendor Staff RBAC & Virtual Try-On Studio

Empower vendors to delegate operations securely to store employees with custom departmental permissions, provide distinct dedicated portal workspaces for Customers, Vendors, and Platform Admins, and introduce an interactive Virtual Try-On (VTO) fitting room with client-side safety guardrails preventing nudity.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following key decisions were confirmed via interactive clarification:
> - **Vendor Employee RBAC**: Granular permissions checklist per vendor employee (Orders & Fulfillment, Catalog & Inventory, Promotions & Coupons, Financials & Payouts, Shop Profile).
> - **Virtual Try-On (VTO) & Camera Guardrail**: Interactive 2D AR apparel fitting canvas supporting live webcam stream and user photo upload, guarded by an instant pixel-level skin-tone ratio and canvas safety inspection algorithm that blocks NSFW/nude uploads before rendering.
> - **Portal Architecture**: Dedicated portal switcher with isolated workspaces and tailored navigation for Customer Storefront, Vendor Staff Workspace, and Admin Staff Portal.

---

### 1. Overview & Core Concept

1. **Three Dedicated Portal Workspaces**:
   - **Customer Storefront Portal**: Shopping catalog, multi-vendor cart, instant digital download vault, custom merchandise customizer, interactive Virtual Try-On dressing room, and order tracking.
   - **Vendor & Vendor Staff Portal**: Store switching, shop profile management, product listing (physical, digital, custom), order fulfillment with carrier tracking, coupon promotions, payout ledger, and the new **Vendor Staff Manager** with granular employee permissions.
   - **Main Admin & Staff Admin Portal**: Platform overview, vendor approval & commission governance, employee admin department assignments, Google Sheets live sync/exports, and withdrawal approvals.

2. **Vendor Employee Staff Management (RBAC)**:
   - Store owners can recruit staff members and assign specific capability checklists:
     - `orders:manage`: Update fulfillment milestones, carrier, and tracking codes.
     - `catalog:manage`: Add/edit physical, digital, and custom products.
     - `coupons:manage`: Create and toggle discount voucher campaigns.
     - `finance:view`: Access bank info, earnings ledger, and request payout withdrawals.
     - `settings:manage`: Edit shop name, logo, banner, and store contact info.
   - Staff login session allows switching between vendor roles, automatically disabling unauthorized tabs and buttons.

3. **Virtual Try-On (VTO) Dressing Room & Safety Guardrails**:
   - Interactive modal and dedicated studio where shoppers can try on apparel (shirts, tees, hoodies, jackets, dresses).
   - **Dual Input Modes**: Live webcam capture (with countdown snap) or local photo file upload.
   - **Automated Anti-Nudity Guardrail**: Analyzes image data on an off-screen HTML5 Canvas. Scans HSV / YCbCr skin chrominance distribution. If the exposed skin pixel ratio exceeds safety thresholds or fails bounding-box coverage, the upload is immediately rejected with a polite privacy advisory ("Please upload a fully dressed photo in good lighting for virtual fitting"), preventing any nude image rendering.
   - **Interactive Fitting Controls**: Dynamic garment overlay with drag-to-position, scale slider, opacity blend, rotation, and mirror flip, plus a one-click "Add Fitted Product to Bag".

---

### 2. User Experience & Visual Design

- **Portal Switching & Zero Confusion**:
  - A clean, unboxed workspace switch banner at the top enables seamless navigation between the three portals:
    - `Customer Storefront` (Default retail shopping view)
    - `Vendor Portal` (Filtered by active shop; locked if vendor employee lacks permissions)
    - `Admin Portal` (Main platform governance; locked to authorized admin accounts)
  - Clear identity pills in the header identify the active persona (e.g. `Rachel Lee · Urban Threads Staff (Fulfillment & Catalog)`).

- **Vendor Staff RBAC Interface**:
  - Integrated into the Vendor Portal under a new **"Store Team & Permissions"** tab.
  - Interactive modal to add store staff with name, email, department title, and checkbox permissions list.
  - Quick-switch dropdown allowing testing or switching between Store Owner and Staff Employee views.

- **Virtual Try-On Fitting Room UI**:
  - Accessible via "Try On Virtual" button on apparel product cards and detail modal.
  - Dual-panel layout:
    - *Left*: Canvas preview showing user photo or live camera feed overlaid with the product garment.
    - *Right*: Fitting adjustments (Garment size selector, Scale slider, Vertical offset, Rotation, Opacity slider, Reset button, and "Add to Bag").
  - Warning banner when guardrail triggers, explaining safety criteria with zero delay.

---

### 3. Key Product Decisions & Trade-Offs

- **Client-Side Skin Chrominance Guardrail vs External Server Filter**:
  - *Chosen*: Instant client-side canvas analysis measuring skin-to-clothing pixel ratios using standard colorimetric ranges (YCbCr / HSV thresholding).
  - *Why*: Zero latency (sub-50ms), runs entirely in the browser without sending sensitive private photos to external third-party servers, free to operate without API token costs, and provides immediate user feedback.
- **Unified Portal Switcher vs Broken Standalone URLs**:
  - *Chosen*: Single unified SPA with top-level portal switcher and role gating.
  - *Why*: Allows easy previewing and demonstration across all three roles (Customer, Vendor Staff, Admin) in the live AI Studio sandbox without requiring complex cross-domain cookies.

---

### 4. Technical Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App Navigation & Top Bar                        │
│   [Portal Switcher: 🛍️ Customer Store  |  🏪 Vendor Hub  |  🛡️ Admin]   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│   Customer Portal    │ │ Vendor & Staff Hub   │ │  Admin & Staff Hub   │
├──────────────────────┤ ├──────────────────────┤ ├──────────────────────┤
│ • Marketplace Catalog│ │ • Multi-Store Select │ │ • Platform Overview  │
│ • Product Detail PDP │ │ • Order Fulfillment  │ │ • Vendor Governance  │
│ • Custom 2D Studio   │ │ • Product Catalog    │ │ • Main Staff RBAC    │
│ • Digital Download   │ │ • Coupons & Vouchers │ │ • Withdrawal Ledger  │
│ • Order Tracking     │ │ • Payouts & Banking  │ │ • Google Sheets Sync │
│ • Virtual Try-On 👗  │ │ • Store Staff RBAC 👥│ └──────────────────────┘
│   (Webcam / Guardrail│ │   (Custom Perm List) │
│    Canvas Overlay)   │ └──────────────────────┘
└──────────────────────┘
```

- **Data Model Extensions**:
  - `VendorEmployee`:
    - `id`, `shopId`, `name`, `email`, `roleTitle`, `permissions: VendorPermission[]`, `createdAt`
  - `VendorPermission`:
    - `'orders'` | `'catalog'` | `'coupons'` | `'finance'` | `'settings'`
  - `VirtualTryOnSpec`:
    - `userPhotoUrl`, `garmentUrl`, `scale`, `offsetX`, `offsetY`, `rotation`, `opacity`
