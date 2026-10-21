import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { 
  ShieldCheck, 
  DollarSign, 
  Store, 
  Package, 
  Users, 
  FileSpreadsheet, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Settings,
  Sliders,
  Check,
  AlertCircle,
  UserCheck,
  Plus,
  Trash2,
  Tag,
  Flame,
  Lock,
  Layers,
  X
} from 'lucide-react';
import { AdminDepartment, User } from '../../types/index.ts';

export const AdminDashboard: React.FC = () => {
  const { 
    orders, 
    shops, 
    products, 
    users, 
    coupons,
    withdrawals, 
    sheetsConfig, 
    activeRole,
    currentUser,
    hasDepartmentPermission,
    updateSheetsConfig, 
    triggerSheetsSyncNow, 
    processWithdrawal,
    updateShop,
    viewOrderTracking,
    createEmployee,
    deleteEmployee,
    deleteCoupon
  } = useApp();

  const isSuperAdmin = activeRole === 'admin';

  // Determine initial accessible tab based on permissions
  const [activeTab, setActiveTab] = useState<'sheets' | 'vendors' | 'payouts' | 'orders' | 'staff' | 'coupons'>('sheets');
  const [webhookUrlInput, setWebhookUrlInput] = useState(sheetsConfig.webhookUrl || '');
  const [autoSyncInput, setAutoSyncInput] = useState(sheetsConfig.autoSync);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // New Employee Modal
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [empForm, setEmpForm] = useState<{
    name: string;
    email: string;
    departmentTitle: string;
    assignedDepartments: AdminDepartment[];
    phoneNumber: string;
  }>({
    name: '',
    email: '',
    departmentTitle: 'Operations & Order Specialist',
    assignedDepartments: ['orders'],
    phoneNumber: '+1 (555) 444-0000',
  });

  // Financial metrics
  const totalGmv = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCommission = orders.reduce((sum, o) => 
    sum + o.subOrders.reduce((sSum, so) => sSum + so.commissionAmount, 0), 0
  );
  const totalVendorPayouts = orders.reduce((sum, o) => 
    sum + o.subOrders.reduce((sSum, so) => sSum + so.vendorEarnings, 0), 0
  );
  const pendingPayoutsTotal = withdrawals
    .filter((w) => w.status === 'Pending')
    .reduce((sum, w) => sum + w.amount, 0);

  const employeeAdmins = users.filter((u) => u.role === 'employee_admin');

  const handleSaveSheetsConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSheetsConfig(webhookUrlInput.trim(), autoSyncInput);
      setSyncStatusMsg('Google Sheets configuration updated successfully.');
      setTimeout(() => setSyncStatusMsg(null), 3000);
    } catch (err: any) {
      setSyncStatusMsg(`Error: ${err.message}`);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await triggerSheetsSyncNow();
      setSyncStatusMsg(res.message);
      setTimeout(() => setSyncStatusMsg(null), 4000);
    } catch (err: any) {
      setSyncStatusMsg(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empForm.name || !empForm.email) return;
    await createEmployee(empForm);
    setShowAddEmployeeModal(false);
    setEmpForm({
      name: '',
      email: '',
      departmentTitle: 'Operations & Order Specialist',
      assignedDepartments: ['orders'],
      phoneNumber: '+1 (555) 444-0000',
    });
  };

  const toggleDept = (dept: AdminDepartment) => {
    setEmpForm((prev) => {
      const exists = prev.assignedDepartments.includes(dept);
      return {
        ...prev,
        assignedDepartments: exists
          ? prev.assignedDepartments.filter((d) => d !== dept)
          : [...prev.assignedDepartments, dept],
      };
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      {/* Admin Center Header with RBAC Indicator */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {isSuperAdmin ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Super Admin (Full Platform Authority)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Employee Staff — {currentUser?.departmentTitle || 'Operations'} ({currentUser?.assignedDepartments?.join(', ').toUpperCase()})</span>
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Marketplace Control Center & Operations Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Role-based department administration, vendor catalog moderation, settlement approvals, and automated Google Sheets live sync.
          </p>
        </div>

        {/* Global Quick Action */}
        <div className="flex items-center gap-2.5">
          {hasDepartmentPermission('finance') && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync to Google Sheets'}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-400">Total GMV</div>
          <div className="text-xl font-black text-slate-900 mt-1 tabular-nums">${totalGmv.toFixed(2)}</div>
          <div className="text-[11px] text-slate-500 mt-1">{orders.length} total orders</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-400">Platform Commission (10%)</div>
          <div className="text-xl font-black text-emerald-600 mt-1 tabular-nums">${totalCommission.toFixed(2)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Net platform revenue</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-400">Vendor Net Payouts</div>
          <div className="text-xl font-black text-indigo-600 mt-1 tabular-nums">${totalVendorPayouts.toFixed(2)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Disbursed & pending</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
          <div className="text-xs font-semibold text-slate-400">Active Stores</div>
          <div className="text-xl font-black text-slate-900 mt-1 tabular-nums">{shops.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">{products.length} products listed</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs col-span-2 lg:col-span-1">
          <div className="text-xs font-semibold text-slate-400">Staff Members</div>
          <div className="text-xl font-black text-slate-900 mt-1 tabular-nums">{employeeAdmins.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Assigned by department</div>
        </div>
      </div>

      {/* Navigation Tabs (Filtered by RBAC Department Permissions) */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit text-xs font-semibold overflow-x-auto">
        {hasDepartmentPermission('finance') && (
          <button
            onClick={() => setActiveTab('sheets')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sheets' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Sheets Hub</span>
          </button>
        )}

        {hasDepartmentPermission('orders') && (
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'orders' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-slate-600" />
            <span>Orders Ledger ({orders.length})</span>
          </button>
        )}

        {hasDepartmentPermission('catalog') && (
          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'vendors' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-indigo-600" />
            <span>Vendors & Stores ({shops.length})</span>
          </button>
        )}

        {hasDepartmentPermission('finance') && (
          <button
            onClick={() => setActiveTab('payouts')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'payouts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-blue-600" />
            <span>Payout Clearances ({withdrawals.filter((w) => w.status === 'Pending').length})</span>
          </button>
        )}

        {/* Super Admin Staff Management Tab */}
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'staff' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Employee Staff RBAC ({employeeAdmins.length})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'coupons' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-blue-600" />
          <span>Coupons ({coupons.length})</span>
        </button>
      </div>

      {/* TAB 1: GOOGLE SHEETS DATA HUB */}
      {activeTab === 'sheets' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Google Sheets Automated Sync & Webhook Stream</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Stream multi-vendor orders, customer registrations, and payout clearances directly into Google Sheets without subscription costs.
                </p>
              </div>

              {sheetsConfig.lastSyncedAt && (
                <div className="text-[11px] text-slate-400 font-mono">
                  Last Synced: {new Date(sheetsConfig.lastSyncedAt).toLocaleString()} ({sheetsConfig.syncCount} syncs)
                </div>
              )}
            </div>

            {syncStatusMsg && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-lg font-medium">
                {syncStatusMsg}
              </div>
            )}

            <form onSubmit={handleSaveSheetsConfig} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Google Apps Script Webhook URL (Free Google Sheets API)
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={webhookUrlInput}
                  onChange={(e) => setWebhookUrlInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono text-xs focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSyncInput}
                    onChange={(e) => setAutoSyncInput(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-700">
                    Automatically stream new customer orders and vendor withdrawals to Google Sheets
                  </span>
                </label>

                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors"
                >
                  Save Webhook Settings
                </button>
              </div>
            </form>
          </div>

          {/* Quick Direct Sheet Downloads */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Instant Google Sheets / Excel Compatible Multi-Tab CSV Exports
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <a
                href="/api/sheets/export/orders"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all flex items-center justify-between text-xs font-bold text-slate-800 group"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Orders Ledger (CSV)</span>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
              </a>

              <a
                href="/api/sheets/export/vendors"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all flex items-center justify-between text-xs font-bold text-slate-800 group"
              >
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-blue-600" />
                  <span>Vendor Stores (CSV)</span>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </a>

              <a
                href="/api/sheets/export/products"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all flex items-center justify-between text-xs font-bold text-slate-800 group"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-600" />
                  <span>Catalog & Digital (CSV)</span>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
              </a>

              <a
                href="/api/sheets/export/withdrawals"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all flex items-center justify-between text-xs font-bold text-slate-800 group"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                  <span>Payout Ledgers (CSV)</span>
                </div>
                <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
              </a>
            </div>
          </div>

          {/* Interactive In-App Google Sheet Data Table Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-900">
                  Live Google Sheet Data Grid Preview (Orders & Vendor Splits)
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 font-mono">
                Sheet: Orders_Master_Fulfillment
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 font-mono">
                <thead className="bg-slate-100 text-slate-500 font-bold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">SubOrder_ID</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Vendor_Store</th>
                    <th className="py-2.5 px-3 text-right">Gross_Total</th>
                    <th className="py-2.5 px-3 text-center">Fee_Rate</th>
                    <th className="py-2.5 px-3 text-right">Vendor_Payout</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Tracking</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  {orders.flatMap((o) =>
                    o.subOrders.map((so) => (
                      <tr key={so.subOrderId} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-bold text-blue-600">{so.subOrderId}</td>
                        <td className="py-2.5 px-3 text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="py-2.5 px-3 text-slate-900 font-sans font-medium">{o.customerName}</td>
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-800">{so.shopName}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                          ${so.subtotal.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500 tabular-nums">
                          {so.commissionRate}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-700 tabular-nums">
                          ${so.vendorEarnings.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            so.status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : so.status === 'Shipped' || so.status === 'Out for Delivery'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {so.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 truncate max-w-[120px]">
                          {so.trackingCode || 'Pending'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMPLOYEE ADMIN RBAC (SUPER ADMIN ONLY) */}
      {activeTab === 'staff' && isSuperAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Employee Admin Staff Accounts</h3>
              <p className="text-xs text-slate-500">
                Grant role-based access to specific departments (Orders, Catalog, Support, Finance).
              </p>
            </div>
            <button
              onClick={() => setShowAddEmployeeModal(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Employee Admin</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {employeeAdmins.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No staff members created yet.</div>
            ) : (
              employeeAdmins.map((emp) => (
                <div key={emp.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={emp.avatar} alt="" className="w-10 h-10 rounded-full border border-slate-200" />
                    <div>
                      <div className="font-bold text-sm text-slate-900">{emp.name}</div>
                      <div className="text-[11px] text-slate-500">{emp.email} · {emp.departmentTitle}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        {emp.assignedDepartments?.map((d) => (
                          <span key={d} className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Remove employee ${emp.name}?`)) deleteEmployee(emp.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                    title="Remove staff member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: VENDORS & STORES */}
      {activeTab === 'vendors' && hasDepartmentPermission('catalog') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Verified Marketplace Sellers</h3>
            <span className="text-xs text-slate-500">{shops.length} vendors active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/70 text-slate-400 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Vendor Store</th>
                  <th className="py-3 px-4">Address / Phone</th>
                  <th className="py-3 px-4 text-center">Commission %</th>
                  <th className="py-3 px-4 text-right">Available Balance</th>
                  <th className="py-3 px-4 text-right">Pending Balance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shops.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={s.avatar} alt="" className="w-9 h-9 rounded-lg object-cover border border-slate-200" />
                        <div>
                          <div className="font-bold text-slate-900">{s.name}</div>
                          <div className="text-[11px] text-slate-400">Rating: {s.rating} ★ ({s.reviewCount} reviews)</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>{s.address}</div>
                      <div className="text-[11px] text-slate-400">{s.phoneNumber}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-900 tabular-nums">
                      {s.commissionRate}%
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-700 tabular-nums">
                      ${s.balance.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-500 tabular-nums">
                      ${s.pendingBalance.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        s.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {s.status === 'active' ? (
                        <button
                          onClick={() => updateShop(s.id, { status: 'suspended' })}
                          className="px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => updateShop(s.id, { status: 'active' })}
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 rounded border border-emerald-200 transition-colors"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PAYOUTS & SETTLEMENTS */}
      {activeTab === 'payouts' && hasDepartmentPermission('finance') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Finance & Settlement Approval Queue</h3>
            <span className="text-xs text-slate-500">{withdrawals.length} total records</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {withdrawals.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No withdrawal requests filed yet.</div>
            ) : (
              withdrawals.map((w) => (
                <div key={w.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">${w.amount.toFixed(2)}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-semibold text-blue-600">{w.shopName}</span>
                      <span className="text-slate-300">·</span>
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        w.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : w.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {w.status}
                      </span>
                    </div>

                    <div className="text-slate-600">
                      Disbursement: <span className="font-mono text-slate-800">{w.method} — {w.accountDetails}</span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Requested {new Date(w.requestedAt).toLocaleString()} {w.adminNote ? `· Note: ${w.adminNote}` : ''} {w.approvedBy ? `· Officer: ${w.approvedBy}` : ''}
                    </div>
                  </div>

                  {w.status === 'Pending' ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => processWithdrawal(w.id, 'Approved', 'Cleared via bank disbursement')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Payout</span>
                      </button>
                      <button
                        onClick={() => processWithdrawal(w.id, 'Rejected', 'Rejected by finance audit')}
                        className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold border border-red-200 transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 shrink-0">
                      Processed on {w.processedAt ? new Date(w.processedAt).toLocaleDateString() : 'N/A'}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: ORDERS LEDGER */}
      {activeTab === 'orders' && hasDepartmentPermission('orders') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Master Orders Ledger</h3>
            <span className="text-xs text-slate-500">{orders.length} orders total</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {orders.map((o) => (
              <div key={o.id} className="p-5 space-y-3 hover:bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">{o.id}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-600">{o.customerName} ({o.customerEmail})</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-sm text-slate-900 tabular-nums">
                      ${o.totalAmount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => viewOrderTracking(o.id)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Track</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {o.subOrders.map((so) => (
                    <div key={so.subOrderId} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-bold text-slate-800">{so.shopName}</span>
                        <div className="text-slate-500">
                          {so.items.length} items · Status: <span className="font-semibold text-slate-700">{so.status}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">${so.subtotal.toFixed(2)}</span>
                        <div className="text-emerald-700">Fee: ${so.commissionAmount.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: ALL COUPONS */}
      {activeTab === 'coupons' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800">Global & Vendor Promo Vouchers</h3>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {coupons.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                      {c.code}
                    </span>
                    <span className="font-bold text-slate-800">{c.discountPercentage}% Discount</span>
                    <span className="text-slate-400">· Scope: {c.shopName || 'Global Platform'}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Min Spend: ${c.minAmount} · Valid until {new Date(c.expiryDate).toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={() => deleteCoupon(c.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD EMPLOYEE ADMIN */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative text-left">
            <button
              onClick={() => setShowAddEmployeeModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">Add Employee Admin (Staff RBAC)</h3>
            <p className="text-xs text-slate-500 mb-4">
              Select which marketplace departments this employee is authorized to access.
            </p>

            <form onSubmit={handleCreateEmployeeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  value={empForm.name}
                  onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                  placeholder="e.g. Rachel Adams"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Work Email *</label>
                <input
                  type="email"
                  value={empForm.email}
                  onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                  placeholder="rachel.ops@shopnonstop.com"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Job Title</label>
                <input
                  type="text"
                  value={empForm.departmentTitle}
                  onChange={(e) => setEmpForm({ ...empForm, departmentTitle: e.target.value })}
                  placeholder="e.g. Order Fulfillment Specialist"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-2">
                  Select Department Permissions *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['orders', 'catalog', 'support', 'finance'] as const).map((dept) => {
                    const isChecked = empForm.assignedDepartments.includes(dept);
                    return (
                      <button
                        type="button"
                        key={dept}
                        onClick={() => toggleDept(dept)}
                        className={`p-2.5 rounded-lg border text-left font-bold transition-all flex items-center justify-between ${
                          isChecked ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="uppercase text-[11px]">{dept} Dept</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Create Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
