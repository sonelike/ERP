import React, { useState, useEffect } from 'react';
import { 
  Building, FolderKanban, FileText, Landmark, Receipt, 
  ShieldAlert, Clock, ArrowUpRight, ArrowDownLeft, FileCheck2, ShieldCheck, HelpCircle
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { DashboardStats, AuditLog, Approval, User } from '../types';

interface DashboardViewProps {
  stats: DashboardStats;
  currentUser: User;
  onNavigate: (module: string) => void;
  onRefresh: () => void;
}

export default function DashboardView({ stats, currentUser, onNavigate, onRefresh }: DashboardViewProps) {
  const [chartsData, setChartsData] = useState<{ contractPerformance: any[], monthlyTrends: any[] }>({
    contractPerformance: [],
    monthlyTrends: []
  });
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartsAndLogs();
  }, [currentUser]);

  const fetchChartsAndLogs = async () => {
    try {
      setLoading(true);
      const chartsRes = await fetch('/api/dashboard/charts', {
        headers: { 'X-User-Id': currentUser.id }
      });
      const charts = await chartsRes.json();
      setChartsData(charts);

      const logsRes = await fetch('/api/audit_logs', {
        headers: { 'X-User-Id': currentUser.id }
      });
      const logsData = await logsRes.json();
      setLogs(logsData.slice(0, 6)); // take top 6 raw logs

      const apprRes = await fetch('/api/approvals', {
        headers: { 'X-User-Id': currentUser.id }
      });
      const apprData = await apprRes.json();
      setApprovals(apprData.filter((a: Approval) => a.status === 'pending').slice(0, 3));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprove = async (id: string, action: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/approvals/${id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id
        },
        body: JSON.stringify({
          status: action,
          remark: "总经理快速审批通道通过。"
        })
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "核准决策失败");
        return;
      }
      fetchChartsAndLogs();
      onRefresh();
    } catch (e) {
      alert("接口通讯异常");
    }
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(val);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>您好，{currentUser.name}</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-medium border border-blue-100">
              {currentUser.role === 'admin' ? '系统总经理' : currentUser.role === 'financial_manager' ? '财务总监' : '项目总监'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            欢迎使用企业项目与合同全生命周期管理系统。当前账套及权限策略运作正常，财务报表和审批流正实时同步。
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchChartsAndLogs}
            className="px-4 py-2 text-xs bg-slate-50 font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            同步财务账套
          </button>
          <button 
            onClick={() => onNavigate('approval')}
            className="px-4 py-2 text-xs bg-blue-600 font-medium text-white rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-100 transition-colors"
          >
            处理待办审批 ({stats.pendingApprovals})
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:translate-y-[-2px] transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400">大盘立项规模</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalProjectCount} 个</h3>
              <p className="text-[11px] text-slate-500 mt-1">累积父子层级项目</p>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-lg">
              <FolderKanban size={20} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between text-[11px] text-slate-500">
            <span>总预算大盘:</span>
            <span className="font-semibold text-slate-700">{formatMoney(stats.totalProjectBudget)}</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:translate-y-[-2px] transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400">合同生效合同总额</p>
              <h3 className="text-lg font-bold text-emerald-600 mt-2">
                收: {formatMoney(stats.totalIncomeContractAmount)}
              </h3>
              <h4 className="text-xs text-rose-500 font-semibold mt-0.5">
                支: {formatMoney(stats.totalExpenseContractAmount)}
              </h4>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-lg">
              <FileText size={20} />
            </div>
          </div>
          <div className="mt-2.5 pt-2.5 border-t border-slate-50 text-[11px] text-slate-500 flex justify-between">
            <span>收支配比差额:</span>
            <span className="font-semibold text-slate-700">{formatMoney(stats.totalIncomeContractAmount - stats.totalExpenseContractAmount)}</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:translate-y-[-2px] transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400">实际资金流量</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight size={14} className="text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-600">收 {formatMoney(stats.totalCashIn)}</span>
              </div>
              <div className="flex items-center gap-1">
                <ArrowDownLeft size={14} className="text-rose-500" />
                <span className="text-sm font-semibold text-rose-600">付 {formatMoney(stats.totalCashOut)}</span>
              </div>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-500 rounded-lg">
              <Landmark size={20} />
            </div>
          </div>
          <div className="mt-3.5 pt-2.5 border-t border-slate-50 text-[11px] text-slate-500 flex justify-between">
            <span>大盘净现金回笼:</span>
            <span className="font-bold text-blue-600">{formatMoney(stats.totalCashIn - stats.totalCashOut)}</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:translate-y-[-2px] transition-all duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400">已开/已登记税金发票</p>
              <h3 className="text-sm font-bold text-slate-800 mt-1">
                销项开票: {formatMoney(stats.totalInvoicedIssued)}
              </h3>
              <p className="text-[11px] text-slate-500">
                进项登记: {formatMoney(stats.totalInvoicedReceived)}
              </p>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-500 rounded-lg">
              <Receipt size={20} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-50 text-[11px] text-slate-500 flex justify-between">
            <span>未返还保证金担保:</span>
            <span className="font-medium text-slate-700">¥{stats.marginPaidAmount} / ¥{stats.marginReceivedAmount}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center text-xs text-slate-400">
          正在加载仪表盘动态数据分析图谱...
        </div>
      ) : (
        <>
          {/* Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Financial Monthly Cash Flow Trend */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-1.5">
                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                2026年度 银行收支往来与资金走势 (实时流水)
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartsData.monthlyTrends}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                    <Tooltip formatter={(value: number) => [`¥${value.toLocaleString()}`, '']} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="收到资金" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="发出资金" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Contract performance and margins ratios */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-1.5">
                <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                各合立项本金对比 与 资金回笼核销比 (合同履约)
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartsData.contractPerformance}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} />
                    <Tooltip formatter={(value: number) => [`¥${value.toLocaleString()}`, '']} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="totalAmount" name="合同签署总额" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="cashFlowAmount" name="银行实际收付额" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions & Static Database Schema Explanation */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                  <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                  数据强关系与事务架构
                </h3>
                <div className="text-[11px] text-slate-500 space-y-2.5">
                  <p>
                    本系统使用精密的<strong>关系性索引数据库</strong>架构建模：
                  </p>
                  <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-50 font-mono text-[10px] text-indigo-700 space-y-1">
                    <div>1. 客户 (1) → (N) 父级 & 子级项目</div>
                    <div>2. 项目 (1) → (N) 收付款合同单据</div>
                    <div>3. 合同 (1) → (N) 退缴保证金 / 销进项税票</div>
                    <div>4. 银行流水 (N) → (1) 合同 (事务触发状态同步)</div>
                  </div>
                  <p>
                    <strong>实时同步：</strong> 某一笔银行流水审批流程核准后，系统将自动把涉事流水状态改为 <code>verified</code> (已复核)，并将涉及的合同及项目履约进度及资金流百分比实时重组。
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-500" /> 操作日志自动审计</span>
                <span className="cursor-pointer hover:text-blue-500 transition-colors" onClick={() => onNavigate('log')}>查看完整日志 &rarr;</span>
              </div>
            </div>

            {/* Quick Pending Approvals Inbox */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm lg:col-span-1">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
                  快速审批台 (需您核决)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-600 font-medium border border-amber-100">
                  {approvals.length} 待决
                </span>
              </div>

              {approvals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                  <ShieldCheck size={36} strokeWidth={1} />
                  <p className="text-xs text-slate-400 mt-2">暂无未决流程，业务推进顺利</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {approvals.map((appr) => (
                    <div key={appr.id} className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs hover:border-slate-200 transition-colors">
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-semibold text-slate-700 truncate max-w-[150px]">{appr.title}</span>
                        <span className="text-[9px] text-slate-400 shrink-0">{appr.applicantName} 提请</span>
                      </div>
                      <p className="text-slate-500 text-[10px] mt-1 line-clamp-2">{appr.content}</p>
                      
                      {currentUser.role === 'guest' ? (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 text-center text-[10px] text-rose-500 font-medium">
                          游客角色只读，无法核准业务
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => handleQuickApprove(appr.id, 'rejected')}
                            className="px-2 py-1 text-[10px] font-medium text-rose-600 hover:bg-rose-50 rounded"
                          >
                            驳回
                          </button>
                          <button
                            onClick={() => handleQuickApprove(appr.id, 'approved')}
                            className="px-2 py-1 text-[10px] font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                          >
                            同意放行
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Micro Audit logs */}
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm lg:col-span-1">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-1.5">
                <span className="w-1 h-4 bg-slate-500 rounded-full"></span>
                实时操作审计日志 (防篡改)
              </h3>
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-2 text-[10px] border-b border-slate-50 pb-2 last:border-0">
                    <div className="mt-0.5 text-slate-400">
                      <Clock size={11} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700">{log.username}</span>
                        <span className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded">{log.module.toUpperCase()}</span>
                      </div>
                      <p className="text-slate-500 mt-0.5 break-all">{log.detail}</p>
                      <span className="text-[8px] text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
