import {
  LayoutDashboard, FlaskConical, Boxes, ClipboardList, Wallet, Bell, Building2, Search, FileQuestion, Truck, Receipt,
  ChartNoAxesCombined, Users, UserCheck, Settings, Percent, Landmark, ScrollText, ShieldCheck, DatabaseBackup, Tags, BookUser, Package, ReceiptText,
} from 'lucide-react';

// `to` is relative to the portal base. Group titles are plain sentence-case.
export const PORTALS = {
  SELLER: {
    base: '/seller', label: 'Seller portal',
    groups: [{
      items: [
        { to: '', label: 'Overview', icon: LayoutDashboard, end: true },
        { to: 'chemicals', label: 'My chemicals', icon: FlaskConical },
        { to: 'inventory', label: 'Inventory', icon: Boxes },
        { to: 'orders', label: 'Orders', icon: ClipboardList },
        { to: 'payments', label: 'Payments', icon: Wallet },
        { to: 'notifications', label: 'Notifications', icon: Bell },
        { to: 'profile', label: 'Profile', icon: Building2 },
      ],
    }],
    bottom: ['', 'chemicals', 'orders', 'payments', 'profile'],
  },
  BUYER: {
    base: '/buyer', label: 'Buyer portal',
    groups: [{
      items: [
        { to: '', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: 'chemicals', label: 'Browse chemicals', icon: Search },
        { to: 'rfqs', label: 'Quotations', icon: FileQuestion },
        { to: 'orders', label: 'Orders', icon: ClipboardList },
        { to: 'shipments', label: 'Shipments', icon: Truck },
        { to: 'invoices', label: 'Invoices', icon: Receipt },
        { to: 'payments', label: 'Payments', icon: Wallet },
        { to: 'notifications', label: 'Notifications', icon: Bell },
        { to: 'profile', label: 'Company profile', icon: Building2 },
      ],
    }],
    bottom: ['', 'chemicals', 'rfqs', 'orders', 'invoices'],
  },
  ADMIN: {
    base: '/admin', label: 'Trade desk',
    groups: [
      {
        title: 'Trade',
        items: [
          { to: '', label: 'Dashboard', icon: LayoutDashboard, end: true },
          { to: 'approvals', label: 'Approvals', icon: UserCheck, badge: 'approvals' },
          { to: 'chemicals', label: 'Chemicals', icon: FlaskConical },
          { to: 'quotations', label: 'Quotations', icon: FileQuestion, badge: 'quotations' },
          { to: 'orders', label: 'Orders', icon: ClipboardList, badge: 'orders' },
          { to: 'transportation', label: 'Transportation', icon: Truck, badge: 'transport' },
          { to: 'invoices', label: 'Invoices', icon: Receipt },
          { to: 'payments', label: 'Payments', icon: Wallet },
          { to: 'expenses', label: 'Expenses', icon: ReceiptText },
        ],
      },
      {
        title: 'Insight',
        items: [
          { to: 'analytics', label: 'Analytics', icon: ChartNoAxesCombined },
          { to: 'directory', label: 'Sellers and buyers', icon: BookUser },
          { to: 'notifications', label: 'Notifications', icon: Bell },
        ],
      },
      {
        title: 'Settings',
        superOnly: true,
        items: [
          { to: 'users', label: 'Users and staff', icon: Users },
          { to: 'margin-policies', label: 'Margin policies', icon: Percent },
          { to: 'gst', label: 'GST settings', icon: Landmark },
          { to: 'expense-categories', label: 'Expense categories', icon: Tags },
          { to: 'audit-logs', label: 'Audit logs', icon: ScrollText },
          { to: 'platform', label: 'Platform analytics', icon: ShieldCheck },
          { to: 'backup', label: 'Backup and exports', icon: DatabaseBackup },
        ],
      },
    ],
    bottom: ['', 'orders', 'quotations', 'transportation', 'analytics'],
  },
};

export const portalFor = (role) => (role === 'SELLER' ? PORTALS.SELLER : role === 'BUYER' ? PORTALS.BUYER : PORTALS.ADMIN);

export function flatItems(portal, role) {
  return portal.groups
    .filter((g) => !g.superOnly || role === 'SUPER_ADMIN')
    .flatMap((g) => g.items.map((i) => ({ ...i, group: g.title })));
}

export { Settings, Package };
