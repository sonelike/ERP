/**
 * Core type definitions for Enterprise Project & Contract Management System
 */

// User and Permission Types
export type UserRole = 'admin' | 'project_manager' | 'financial_manager' | 'guest';

export interface UserPermission {
  module: string; // e.g. 'dashboard', 'customer', 'project', 'contract', 'finance', 'invoice', 'margin', 'approval', 'user', 'permission', 'log'
  read: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve?: boolean; // specific to approvals or higher-level actions
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  status: 'active' | 'inactive';
  permissions: UserPermission[];
  createdAt: string;
}

// Client / Customer Management
export interface Customer {
  id: string;
  code: string;
  name: string;
  industry?: string;
  contactName: string;
  phone: string;
  email: string;
  address?: string;
  taxNumber?: string;
  bankName?: string;
  bankAccount?: string;
  description?: string;
  creatorId: string;
  createdAt: string;
}

// Project Management (Parent-Child)
export type ProjectStatus = 'planning' | 'executing' | 'completed' | 'suspended';

export interface Project {
  id: string;
  code: string;
  name: string;
  parentId?: string | null; // Nullable if it is a parent project itself
  type: 'parent' | 'child';
  customerId: string; // Customer ID
  customerName?: string; // Resolved name
  status: ProjectStatus;
  manager: string; // Project Manager name or ID
  budget: number; // Project budget amount (CNY)
  startDate: string;
  endDate: string;
  description?: string;
  progress: number; // 0 to 100 percentage
  createdAt: string;
  creatorId: string;
}

// Contract Management (Income & Expense)
export type ContractType = 'income' | 'expense'; // 收款合同 vs 付款合同
export type ContractStatus = 'draft' | 'under_review' | 'active' | 'completed' | 'suspended';

export interface Contract {
  id: string;
  code: string;
  name: string;
  type: ContractType;
  projectId: string; // Linked project (usually child project or parent project)
  projectName?: string; // Resolved name
  customerId: string; // Customer involved
  customerName?: string; // Resolved name
  amount: number; // Total contract amount (CNY)
  status: ContractStatus;
  signDate: string;
  startDate: string;
  endDate: string;
  ourSigner: string; // Our representative signer
  customerSigner: string; // Customer representative signer
  isMarginIncluded: boolean; // Is there a guarantee/margin deposit?
  marginAmount: number; // Margin deposit amount if included
  terms?: string; // Payment terms, deliverables
  createdAt: string;
  creatorId: string;
}

// Financial bank flows / Cash flow transactions
export type FinanceFlowType = 'income' | 'expense';
export type FinanceFlowStatus = 'pending' | 'verified';

export interface FinanceFlow {
  id: string;
  code: string;
  contractId: string; // Linked contract
  contractName?: string; // Resolved name
  projectId?: string; // Associated project (can be derived)
  projectName?: string; // Resolved name
  type: FinanceFlowType;
  amount: number; // Amount (CNY)
  recordDate: string; // Transaction date
  bankAccount: string; // e.g. "招商银行1234", "工商银行5678"
  flowCategory: string; // e.g., "首付款", "进度款", "尾款", "技术服务费", "采购款"
  operator: string; // Recorded by
  status: FinanceFlowStatus; // pending or verified by CFO
  description?: string;
  createdAt: string;
}

// Invoices (发票)
export type InvoiceType = 'received' | 'issued'; // 收到的发票 (Expense) vs 开出的发票 (Income)
export type InvoiceStatus = 'pending' | 'issued' | 'registered'; // pending or completed

export interface Invoice {
  id: string;
  code: string;
  contractId: string; // Linked contract
  contractName?: string; // Resolved name
  type: InvoiceType;
  amount: number; // Invoice total amount
  taxRate: number; // Tax rate (e.g. 3, 6, 9, 13 percentage)
  taxAmount: number; // Calculated tax
  invoiceNumber: string; // Invoice No (Code)
  invoiceDate: string; // Issuing/registering date
  status: InvoiceStatus;
  description?: string;
  createdAt: string;
  creatorId: string;
}

// Margin / Guarantee Money (保证金)
export type MarginType = 'pay' | 'receive'; // 缴纳保证金 (For Expense contract) or 收取保证金 (For Income contract)
export type MarginStatus = 'pending' | 'paid' | 'received' | 'refunded';

export interface Margin {
  id: string;
  code: string;
  contractId: string; // Linked contract
  contractName?: string; // Resolved name
  type: MarginType;
  amount: number; // Margin amount
  status: MarginStatus;
  dueDate: string; // Date when margin is due to be paid or returned
  actualDate?: string; // Actual transaction date
  refundDate?: string; // Actual refund date if refunded
  description?: string;
  createdAt: string;
  creatorId: string;
}

// Approval Process (审批管理)
export type ApprovalTargetType = 'contract' | 'finance' | 'invoice' | 'project';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'canceled';

export interface Approval {
  id: string;
  code: string;
  targetType: ApprovalTargetType;
  targetId: string; // ID of the contract, project, finance flow or invoice
  targetName?: string; // Resolved title of target
  applicantId: string;
  applicantName: string;
  title: string;
  content: string; // Description of the approval request contents
  status: ApprovalStatus;
  remark?: string; // Auditor's comment
  auditorId?: string;
  auditorName?: string;
  auditedAt?: string;
  createdAt: string;
}

// Operation Logs Audit (操作日志审计)
export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  role: string;
  action: string; // e.g., "CREATE_PROJECT", "UPDATE_CONTRACT", "APPROVE_FLOW"
  module: string; // Sidebar modules
  detail: string; // Human readable description
  ipAddress: string;
  createdAt: string;
}

// Stats metrics for dashboard
export interface DashboardStats {
  totalProjectCount: number;
  totalProjectBudget: number;
  totalIncomeContractAmount: number;
  totalExpenseContractAmount: number;
  totalCashIn: number;
  totalCashOut: number;
  totalInvoicedIssued: number;
  totalInvoicedReceived: number;
  marginPaidAmount: number;
  marginReceivedAmount: number;
  pendingApprovals: number;
}
