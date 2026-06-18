import React, { useState, useEffect } from 'react';
import { Plus, Check, Trash, ShieldCheck, Flag, ShieldAlert, Calendar, HelpCircle, FileText, Landmark } from 'lucide-react';
import { Margin, Contract, User } from '../types';

interface MarginViewProps {
  currentUser: User;
  onRefresh: () => void;
}

export default function MarginView({ currentUser, onRefresh }: MarginViewProps) {
  const [margins, setMargins] = useState<Margin[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [formContractId, setFormContractId] = useState('');
  const [formType, setFormType] = useState<'pay' | 'receive'>('pay');
  const [formAmount, setFormAmount] = useState(0);
  const [formDueDate, setFormDueDate] = useState('');
  const [formDesc, setFormDesc] = useState('');

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/margins', { headers: { 'X-User-Id': currentUser.id } });
      const margs = await res.json();
      setMargins(Array.isArray(margs) ? margs : []);

      const contRes = await fetch('/api/contracts', { headers: { 'X-User-Id': currentUser.id } });
      const contrs = await contRes.json();
      setContracts(Array.isArray(contrs) ? contrs : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch('/api/margins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id
        },
        body: JSON.stringify({
          contractId: formContractId,
          type: formType,
          amount: Number(formAmount),
          status: 'pending',
          dueDate: formDueDate,
          description: formDesc,
          creatorId: currentUser.id
        })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "创建失败");
      }

      setShowAddModal(false);
      // Clean form
      setFormContractId('');
      setFormAmount(0);
      setFormDueDate('');
      setFormDesc('');
      fetchData();
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleUpdateStatus = async (id: string, nextStatus: Margin['status']) => {
    if (currentUser.role === 'guest') {
      alert("游客无法修改或核销对账台金状态！");
      return;
    }
    try {
      const field: Partial<Margin> = { status: nextStatus };
      if (nextStatus === 'paid' || nextStatus === 'received') {
        field.actualDate = new Date().toISOString().split('T')[0];
      } else if (nextStatus === 'refunded') {
        field.refundDate = new Date().toISOString().split('T')[0];
      }

      const res = await fetch(`/api/margins/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id
        },
        body: JSON.stringify(field)
      });

      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "更改保证金结算状态失败。");
        return;
      }

      fetchData();
      onRefresh();
    } catch (e) {
      alert("通信失败");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("确定要下线注销这一笔保证金账期跟踪吗？已实际划转收支的保证金不可直接删除。")) return;
    try {
      const res = await fetch(`/api/margins/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': currentUser.id }
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "删除由于财务状态受限失败！");
        return;
      }
      fetchData();
      onRefresh();
    } catch (e) {
      alert("通信失败");
    }
  };

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(val);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4 text-xs text-slate-700">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
            <Flag size={18} className="text-amber-500" />
            企业履约质保保证金跟踪台账
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            用于严格跟踪合规押金和应付应收履约担保备付金。在合同建立或履约时触发建立，支持核对记账及原路无息退还销账。
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          <Plus size={14} /> 登记新保证金
        </button>
      </div>

      {/* Main Margins Ledger List */}
      <div className="overflow-x-auto border border-slate-100 rounded-lg text-xs">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-semibold text-[11px]">
            <tr>
              <th className="py-2.5 px-3">业务追踪号</th>
              <th className="py-2.5 px-3">关联契约合同</th>
              <th className="py-2.5 px-3">保证金性质</th>
              <th className="py-2.5 px-3">押金本息规模</th>
              <th className="py-2.5 px-3">计划账期期限</th>
              <th className="py-2.5 px-3">实际支付划存期</th>
              <th className="py-2.5 px-3">退汇销账期</th>
              <th className="py-2.5 px-3">押金状态</th>
              <th className="py-2.5 px-3 text-right">核销管理</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-600">
            {margins.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">系统尚无发生保证金对账。</td>
              </tr>
            ) : (
              margins.map(m => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-bold text-slate-500">{m.code}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-700 truncate max-w-[150px]" title={m.contractName}>
                      {m.contractName}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[9.5px] font-semibold ${
                      m.type === 'pay' ? 'bg-amber-50 text-amber-700' : 'bg-orange-50 text-orange-700'
                    }`}>
                      {m.type === 'pay' ? '应对外缴纳' : '应对内收取'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-extrabold text-amber-600 text-sm bg-amber-50/10">
                    {formatMoney(m.amount)}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {m.dueDate}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-semibold">
                    {m.actualDate ? m.actualDate : <span className="text-[10px] text-slate-400">尚未付/支</span>}
                  </td>
                  <td className="py-3 px-3 text-emerald-600 font-bold">
                    {m.refundDate ? m.refundDate : <span className="text-[10px] text-slate-400">尚未退回</span>}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      m.status === 'paid' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      m.status === 'received' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      m.status === 'refunded' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {m.status === 'paid' ? '我司已划款对方' : m.status === 'received' ? '钱款已抵扣我司' : m.status === 'refunded' ? '原路退还注账已结' : '到账待结'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end gap-1.5">
                      {m.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(m.id, m.type === 'pay' ? 'paid' : 'received')}
                          className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-[10px] font-semibold transition"
                        >
                          确认到划账
                        </button>
                      )}
                      
                      {(m.status === 'paid' || m.status === 'received') && (
                        <button
                          onClick={() => handleUpdateStatus(m.id, 'refunded')}
                          className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded text-[10px] font-semibold transition"
                        >
                          原金退还销账
                        </button>
                      )}

                      {m.status === 'pending' ? (
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="p-1 hover:text-rose-500 rounded"
                        >
                          <Trash size={11} className="text-slate-400" />
                        </button>
                      ) : (
                        <span className="text-[9.5px] text-slate-400 font-medium italic flex items-center justify-end gap-0.5"><ShieldCheck size={11} className="text-emerald-500" /> 已销</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: 添加保证金账目 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-xs text-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">核设质保保证金跟踪</h3>
            {errorMsg && <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded">{errorMsg}</div>}
            
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">主契约合合同 *</label>
                <select required value={formContractId} onChange={e => setFormContractId(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded text-slate-700">
                  <option value="">-- 请选择关联合同 --</option>
                  {contracts.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.type === 'income' ? '收款' : '付款'}] {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">款项交付性质 *</label>
                  <select required value={formType} onChange={e => setFormType(e.target.value as any)} className="w-full p-1.5 border border-slate-200 rounded">
                    <option value="pay">应缴出本金 (付给买方法人)</option>
                    <option value="receive">应收取押金 (承接供应商抵扣)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">约定保证金金额 (¥) *</label>
                  <input required type="number" min={1} value={formAmount} onChange={e => setFormAmount(Number(e.target.value))} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">计划账期交付截止日期 *</label>
                <input required type="date" value={formDueDate} onChange={e => setFormDueDate(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">核定质保履约补充说明 (如质保返还年限)</label>
                <textarea rows={2} value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 bg-slate-100 rounded text-slate-600">取消</button>
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">立据跟踪</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
