import React, { useState, useEffect } from 'react';
import { Check, X, ShieldCheck, MailWarning, Clock, FileText, User, MessageSquare, AlertTriangle, Sparkles } from 'lucide-react';
import { Approval, User as AppUser } from '../types';

interface ApprovalViewProps {
  currentUser: AppUser;
  onRefresh: () => void;
}

export default function ApprovalView({ currentUser, onRefresh }: ApprovalViewProps) {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [selectedAppr, setSelectedAppr] = useState<Approval | null>(null);
  
  const [remark, setRemark] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending');

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/approvals', { headers: { 'X-User-Id': currentUser.id } });
      const apprs = await res.json();
      setApprovals(Array.isArray(apprs) ? apprs : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAction = async (id: string, actionStatus: 'approved' | 'rejected') => {
    if (currentUser.role === 'guest') {
      alert("只读访客无权审阅或修改任何核心表单！");
      return;
    }
    try {
      const res = await fetch(`/api/approvals/${id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id
        },
        body: JSON.stringify({
          status: actionStatus,
          remark: remark || "同意放行，按规执行。"
        })
      });

      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "审批失败");
        return;
      }

      setRemark('');
      setSelectedAppr(null);
      fetchData();
      onRefresh();
      alert(`审批判定已提交。结论：${actionStatus === 'approved' ? '核准通过' : '拒审驳回'}。底盘财务对账数据已发生关联化动态同步。`);
    } catch (e) {
      alert("通信失败");
    }
  };

  const filteredApprovals = approvals.filter(a => {
    if (activeTab === 'pending') return a.status === 'pending';
    return a.status === 'approved' || a.status === 'rejected';
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700">
      
      {/* Inbox List Column */}
      <div className="md:col-span-1 bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
          <div>
            <h2 className="text-sm font-bold text-slate-800">业务流程审批工作台</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">多级业务勾稽。涉及预算立项、财务流、开具发票控制审核。</p>
          </div>
        </div>

        {/* Tab triggers */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-1.5 rounded-lg border font-semibold transition-all ${
              activeTab === 'pending'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
            }`}
          >
            待审批待决 ({approvals.filter(a => a.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`py-1.5 rounded-lg border font-semibold transition-all ${
              activeTab === 'resolved'
                ? 'bg-slate-50 text-slate-600 border-slate-200'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
          >
            历史已核决 ({approvals.filter(a => a.status !== 'pending').length})
          </button>
        </div>

        {/* Inbox lists items */}
        <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
          {filteredApprovals.length === 0 ? (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center gap-2">
              <ShieldCheck size={32} className="text-slate-300" />
              <span>暂无匹配流程单。</span>
            </div>
          ) : (
            filteredApprovals.map(appr => {
              const isSelected = selectedAppr?.id === appr.id;
              return (
                <div
                  key={appr.id}
                  onClick={() => { setSelectedAppr(appr); setRemark(''); }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                    isSelected 
                      ? 'border-amber-400 bg-amber-50/20' 
                      : 'border-slate-100 bg-slate-50/50 hover:border-slate-250 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-[10px] bg-slate-200/60 px-1.5 py-0.2 rounded text-slate-500 shrink-0 font-mono">
                      {appr.code}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium shrink-0 ${
                      appr.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      appr.status === 'rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                      'bg-amber-150 text-amber-700 bg-amber-50'
                    }`}>
                      {appr.status === 'approved' ? '通过放行' : appr.status === 'rejected' ? '被驳单' : '流转审批中'}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs mt-2 line-clamp-2 leading-tight">
                    {appr.title}
                  </h4>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-slate-50">
                    <span className="flex items-center gap-0.5"><User size={10} /> {appr.applicantName}</span>
                    <span className="flex items-center gap-0.5"><Clock size={10} /> {new Date(appr.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CORE DETAIL WORK AREA PLACE */}
      <div className="md:col-span-2 space-y-6">
        {!selectedAppr ? (
          <div className="bg-white rounded-xl border border-slate-100 p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3 shadow-sm h-full max-h-[460px]">
            <Sparkles size={36} className="text-yellow-400/90 animate-pulse" />
            <span className="font-bold text-slate-700 text-sm">业务联审工作台已就位</span>
            <span className="text-[10.5px] max-w-sm text-slate-400">
              请点击左侧流程账底单查看详细要素。通过该卡盘可以对收款合同进行立项签约确认、核准入账公账流水，并实现底盘数据的严密更新！
            </span>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400 font-mono">流水流程登记号: {selectedAppr.code}</span>
                <h3 className="text-sm font-bold text-slate-800 mt-1">{selectedAppr.title}</h3>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                selectedAppr.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                selectedAppr.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                'bg-amber-50 text-amber-700 border border-amber-100'
              }`}>
                {selectedAppr.status === 'approved' ? '审核同意' : selectedAppr.status === 'rejected' ? '批转否决' : '业务流转中'}
              </span>
            </div>

            {/* Core parameters fields */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600">
              <div>
                <span className="text-slate-400 block">流程模块大类:</span>
                <span className="font-bold text-slate-700 mt-0.5 block">{selectedAppr.targetType.toUpperCase()} 审计核对</span>
              </div>
              <div>
                <span className="text-slate-400 block">业务提报人:</span>
                <span className="font-semibold text-slate-700 mt-0.5 block">{selectedAppr.applicantName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">提请提交日期:</span>
                <span className="text-slate-500 mt-0.5 block">{new Date(selectedAppr.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block">挂接标的目标:</span>
                <span className="text-blue-600 font-bold mt-0.5 block truncate" title={selectedAppr.targetName}>{selectedAppr.targetName}</span>
              </div>
            </div>

            {/* Core details body text */}
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-2">
              <span className="font-bold text-slate-700 block flex items-center gap-1">
                <FileText size={14} className="text-indigo-500" />
                立案申请阐述与财务依据:
              </span>
              <p className="text-slate-600 leading-relaxed break-all font-mono whitespace-pre-wrap">{selectedAppr.content}</p>
            </div>

            {/* RESOLVED AUDITING LOGS OVERVIEW */}
            {selectedAppr.status !== 'pending' ? (
              <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100/50 space-y-2.5">
                <h5 className="font-bold text-emerald-800 flex items-center gap-1">
                  <ShieldCheck size={14} /> 已签署审核批复意见 (系统归档锁死)
                </h5>
                <div className="text-[10px] text-slate-600 space-y-1 font-mono">
                  <div><strong>审核核查经办人:</strong> {selectedAppr.auditorName || '高级审计师'}</div>
                  <div><strong>决议作出时间:</strong> {selectedAppr.auditedAt ? new Date(selectedAppr.auditedAt).toLocaleString() : '出厂设定'}</div>
                  <div className="mt-2 text-slate-700 p-2 bg-white rounded border border-emerald-50 italic">
                    " {selectedAppr.remark || '核对单证一致，准予按流程出账记账。' } "
                  </div>
                </div>
              </div>
            ) : (
              // PENDING DECISION FORM
              <div className="p-4 bg-amber-50/30 rounded-xl border border-amber-100/50 space-y-3">
                <h5 className="font-bold text-amber-800 flex items-center gap-1">
                  <MessageSquare size={14} /> 裁决批示控制卡 (DECISION BOARD)
                </h5>
                
                <div>
                  <label className="block text-slate-400 mb-1">审核批示意见与对账评语 *</label>
                  <textarea
                    rows={2}
                    placeholder="签批建议，例如：单证匹配，核销合同。同意放行。"
                    value={remark}
                    onChange={e => setRemark(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded resize-none"
                  />
                </div>

                {currentUser.role === 'guest' ? (
                  <div className="text-center p-2 rounded bg-rose-50 text-rose-600 font-bold border border-rose-100 flex items-center justify-center gap-1">
                    <AlertTriangle size={14} />
                    只读访客角色无法代表管理中枢核签业务。请尝试切换顶部管理员账户！
                  </div>
                ) : (
                  <div className="flex justify-end gap-2 pt-1 border-t border-slate-100/50">
                    <button
                      onClick={() => handleAction(selectedAppr.id, 'rejected')}
                      className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg transition"
                    >
                      不予通过-驳回申请
                    </button>
                    <button
                      onClick={() => handleAction(selectedAppr.id, 'approved')}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm shadow-blue-100 transition"
                    >
                      签署同意-放行并修改账套
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick Warning Policy */}
            <div className="text-[10px] text-slate-400 leading-relaxed font-mono flex gap-1 items-start">
              <AlertTriangle size={12} className="text-slate-400 shrink-0 mt-0.5" />
              <span>本审核链条遵循强一致ACID事务机制。对于财务流动资金(Finance)和专用发票印签(Invoice)的放行，一旦裁决同意，将自动触发底层实体状态并生成安全无法逆转的防篡改操作审计。</span>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
