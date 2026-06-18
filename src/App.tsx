import React, { useState, useEffect } from 'react';
import { 
  Building, LayoutDashboard, Shield, Users, FolderOpen, FileText, 
  Landmark, Receipt, Flag, ClipboardCheck, Lock, UserCircle, 
  LogOut, Menu, X, ArrowLeftRight, Bell, ShieldCheck, Terminal, AlertCircle
} from 'lucide-react';

import DashboardView from './components/DashboardView';
import CustomerView from './components/CustomerView';
import ProjectView from './components/ProjectView';
import ContractView from './components/ContractView';
import FinanceView from './components/FinanceView';
import InvoiceView from './components/InvoiceView';
import MarginView from './components/MarginView';
import ApprovalView from './components/ApprovalView';
import UserView from './components/UserView';
import PermissionView from './components/PermissionView';
import PersonalCenterView from './components/PersonalCenterView';

import { User, AuditLog, DashboardStats } from './types';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Stats for badge alerts
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [pendingFinancesCount, setPendingFinancesCount] = useState(0);
  const [showAuditLogsDrawer, setShowAuditLogsDrawer] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
        // Default to active selected user (simulated)
        if (!currentUser && data.length > 0) {
          // Find first admin e.g. admin
          const found = data.find(u => u.id === 'admin') || data[0];
          setCurrentUser(found);
        } else if (currentUser) {
          // Sync changes to the current role
          const synced = data.find(u => u.id === currentUser.id);
          if (synced) {
            setCurrentUser(synced);
          }
        }
      }
    } catch (e) {
      console.error("无法载入雇员名录:", e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAlertsAndLogs();
    }
  }, [currentUser, refreshTrigger]);

  const fetchAlertsAndLogs = async () => {
    if (!currentUser) return;
    try {
      // Get dashboard stats
      const dbrdRes = await fetch('/api/dashboard/stats', { headers: { 'X-User-Id': currentUser.id } });
      const dbrdStats = await dbrdRes.json();
      setDashboardStats(dbrdStats);

      // Get approvals status
      const apprsRes = await fetch('/api/approvals', { headers: { 'X-User-Id': currentUser.id } });
      const apprs = await apprsRes.json();
      if (Array.isArray(apprs)) {
        setPendingApprovalsCount(apprs.filter(a => a.status === 'pending').length);
      }

      // Get finances status
      const finRes = await fetch('/api/finances', { headers: { 'X-User-Id': currentUser.id } });
      const fins = await finRes.json();
      if (Array.isArray(fins)) {
        setPendingFinancesCount(fins.filter(f => f.status === 'pending').length);
      }

      // Get total system audit logs
      const logsRes = await fetch('/api/logs', { headers: { 'X-User-Id': currentUser.id } });
      const logs = await logsRes.json();
      if (Array.isArray(logs)) {
        setAuditLogs(logs.slice(0, 40)); // keep last 40 for speed
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUserChange = (id: string) => {
    const selected = users.find(u => u.id === id);
    if (selected) {
      setCurrentUser(selected);
      // Trigger instant trace log
      const dateStr = new Date().toLocaleTimeString();
      console.log(`[ERP SECURE] Simulated context switched to ${selected.name} (${selected.role}) at ${dateStr}`);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center text-slate-300">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-mono">恒泰安全核销总线启动中...</p>
        </div>
      </div>
    );
  }

  // Sidebar list item definition
  const navigationItems = [
    { id: 'dashboard', label: '仪表盘控制大看板', icon: LayoutDashboard, badge: 0 },
    { id: 'customer', label: '往来商誉客资簿', icon: Users, badge: 0 },
    { id: 'project', label: '研发父子项目分支', icon: FolderOpen, badge: 0 },
    { id: 'contract', label: '双边及多边契约台账', icon: FileText, badge: 0 },
    { id: 'finance', label: '实际银行对账流水', icon: Landmark, badge: pendingFinancesCount },
    { id: 'invoice', label: '专用增值发票税流', icon: Receipt, badge: 0 },
    { id: 'margin', label: '履约保证金跟踪链', icon: Flag, badge: 0 },
    { id: 'approval', label: '裁决放行审计中枢', icon: ClipboardCheck, badge: pendingApprovalsCount },
    { id: 'user', label: '雇员主体与行政组', icon: Users, badge: 0 },
    { id: 'permission', label: '细粒级安防矩阵ACL', icon: Lock, badge: 0 },
    { id: 'personal', label: '个人业务资产看板', icon: UserCircle, badge: 0 },
  ];

  const defaultStats: DashboardStats = {
    totalProjectCount: 0,
    totalProjectBudget: 0,
    totalIncomeContractAmount: 0,
    totalExpenseContractAmount: 0,
    totalCashIn: 0,
    totalCashOut: 0,
    totalInvoicedIssued: 0,
    totalInvoicedReceived: 0,
    marginPaidAmount: 0,
    marginReceivedAmount: 0,
    pendingApprovals: 0
  };

  const renderActiveView = () => {
    const statsObj = dashboardStats || defaultStats;
    switch (currentView) {
      case 'dashboard':
        return <DashboardView stats={statsObj} currentUser={currentUser} onNavigate={setCurrentView} onRefresh={handleRefresh} />;
      case 'customer':
        return <CustomerView currentUser={currentUser} onRefresh={handleRefresh} />;
      case 'project':
        return <ProjectView currentUser={currentUser} onRefresh={handleRefresh} />;
      case 'contract':
        return <ContractView currentUser={currentUser} onRefresh={handleRefresh} />;
      case 'finance':
        return <FinanceView currentUser={currentUser} onRefresh={handleRefresh} />;
      case 'invoice':
        return <InvoiceView currentUser={currentUser} onRefresh={handleRefresh} />;
      case 'margin':
        return <MarginView currentUser={currentUser} onRefresh={handleRefresh} />;
      case 'approval':
        return <ApprovalView currentUser={currentUser} onRefresh={handleRefresh} />;
      case 'user':
        return <UserView currentUser={currentUser} onRefresh={handleRefresh} />;
      case 'permission':
        return <PermissionView currentUser={currentUser} onRefresh={handleRefresh} />;
      case 'personal':
        return <PersonalCenterView currentUser={currentUser} />;
      default:
        return <DashboardView stats={statsObj} currentUser={currentUser} onNavigate={setCurrentView} onRefresh={handleRefresh} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans antialiased text-slate-800">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className={`bg-slate-900 text-slate-300 w-64 flex-shrink-0 z-30 transition-all duration-300 flex flex-col justify-between ${
        isSidebarOpen ? 'translate-x-0 ml-0' : '-translate-x-full -ml-64'
      }`}>
        <div className="p-4 flex flex-col h-full overflow-y-auto">
          {/* Brand header */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 mb-4 shrink-0">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Building size={18} />
            </div>
            <div>
              <h1 className="text-xs font-black text-white tracking-widest uppercase">HENGTAI</h1>
              <p className="text-[9.5px] font-mono text-slate-500 mt-0.5">业财一体ACID控制台</p>
            </div>
          </div>

          {/* SIMULATOR SWITCHER PROFILE */}
          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 mb-5 shrink-0 space-y-2">
            <div className="flex justify-between items-center text-[9.5px] text-slate-500 font-mono">
              <span className="flex items-center gap-1"><ShieldCheck size={10} className="text-blue-400" /> 模拟沙箱特权</span>
              <span className="px-1 bg-slate-800 rounded font-semibold text-white">X-User-Id</span>
            </div>
            
            <div className="flex items-center gap-2">
              <img src={currentUser.avatar} alt="avat" className="w-8 h-8 rounded-full border border-slate-700" />
              <div className="flex-1 truncate">
                <div className="font-extrabold text-white text-xs leading-none truncate">{currentUser.name}</div>
                <div className="text-[9.5px] text-slate-400 mt-1 leading-none">{currentUser.department || '总经办'}</div>
              </div>
            </div>

            <select
              value={currentUser.id}
              onChange={(e) => handleUserChange(e.target.value)}
              className="w-full mt-2 bg-slate-805 bg-slate-800 cursor-pointer p-1.5 border border-slate-700 rounded-lg text-[10.5px] text-white hover:border-slate-650 focus:outline-none transition leading-tight"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  登录契约角色: [{u.role.substring(0, 5)}] {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation link maps */}
          <nav className="space-y-1.5 flex-1">
            {navigationItems.map(item => {
              const IconComp = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-[10.5px] md:text-xs transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10 scale-[1.01]' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <IconComp size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                    {item.label}
                  </span>
                  
                  {item.badge > 0 && (
                    <span className="bg-rose-500 text-white py-0.2 px-2 rounded-full font-bold text-[9.5px] border border-rose-600 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer info */}
        <div className="p-4 border-t border-slate-800/80 shrink-0 text-[10px] text-slate-500 font-mono tracking-tight leading-relaxed">
          <div>部署节点: sandbox-ClRun-3000</div>
          <div>时区校验: UTC+8 (北京)</div>
        </div>
      </aside>

      {/* 2. MAIN SCROLL CONTAINER */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Main top header bar banner */}
        <header className="bg-white border-b border-slate-100 flex items-center justify-between px-6 py-4.5 shrink-0 shadow-xs">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-500"
              title="切换边栏"
            >
              <Menu size={18} />
            </button>
            
            <div className="hidden sm:block">
              <h2 className="text-xs font-bold text-slate-800 leading-tight">恒泰全周期“业财合同项目”穿透控制台</h2>
              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-1 py-0.2 rounded font-semibold flex items-center gap-0.5">
                  ✓ 实时数据库ACID可用 Status: Live
                </span>
                <span>•</span>
                <span>当前节点: {currentUser.name} 具有 {currentUser.role.toUpperCase()} 审计特权</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Quick alert indicator logs */}
            <button
              onClick={() => setShowAuditLogsDrawer(true)}
              className="relative p-2 hover:bg-slate-50 rounded-lg text-slate-500 flex items-center gap-1 text-[11px] font-semibold border border-slate-100 cursor-pointer"
              title="审计日志流"
            >
              <Terminal size={14} className="text-indigo-500" />
              <span>操作审计流</span>
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping absolute right-1.5 top-1.5"></span>
            </button>
            
            <div className="w-px h-6 bg-slate-150"></div>

            <div className="flex items-center gap-2">
              <img src={currentUser.avatar} alt="avat_top" className="w-7 h-7 rounded-full border shadow-sm" referrerPolicy="no-referrer" />
              <div className="text-right hidden md:block">
                <div className="font-bold text-xs text-slate-800 leading-none">{currentUser.name}</div>
                <div className="text-[9px] text-slate-400 font-semibold mt-0.5">{currentUser.role === 'admin' ? '总经理' : '业务总监'}</div>
              </div>
            </div>
          </div>

        </header>

        {/* 3. CORE SUB-SCREEN RENDERING VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {renderActiveView()}
        </main>

      </div>

      {/* 4. AUDIT LOGS RIGHT CABINET SLIDE-OVER */}
      {showAuditLogsDrawer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50">
          <div className="bg-slate-950 text-slate-300 w-full sm:max-w-md h-full flex flex-col p-6 shadow-2xl relative border-l border-slate-800 font-mono text-xs">
            
            <button 
              onClick={() => setShowAuditLogsDrawer(false)}
              className="absolute right-4 top-4 p-1.5 hover:bg-slate-900/60 rounded-lg text-slate-400 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="border-b border-slate-800 pb-4 shrink-0 mt-3 space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Terminal size={16} className="text-indigo-400" />
                防篡改系统审计日志流 (Secure Trails)
              </h3>
              <p className="text-[10px] text-slate-500">自动记录并留存对契约合同、发票税流、保证金及划拨扣款的安全日志审计。</p>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {auditLogs.length === 0 ? (
                <div className="text-center py-20 text-slate-600">系统尚无安全写入流记录。</div>
              ) : (
                auditLogs.map(log => (
                  <div key={log.id} className="p-3 bg-slate-900/60 border border-slate-850 rounded-lg space-y-1.5">
                    <div className="flex justify-between items-center text-[9.5px]">
                      <span className="font-bold text-indigo-400 bg-indigo-950 px-1 py-0.2 rounded border border-indigo-900">
                        {log.action}
                      </span>
                      <span className="text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300 text-[10.5px] leading-relaxed font-sans">{log.detail}</p>
                    <div className="flex justify-between text-[9px] text-slate-600 pt-1.5 border-t border-slate-900/60">
                      <span>操作主: {log.username} ({log.role})</span>
                      <span>IP: {log.ipAddress}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-900 border border-slate-850 rounded-lg text-[9.5px] leading-relaxed text-slate-500 shrink-0">
              提示：此安全事件监视流遵循《中控国标安全审计法》。不可被任何特权节点直接擦除、改写，具备最高抗否决性及最终可追溯效力。
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
