import React, { useState, useEffect } from 'react';
import { Plus, Check, ShieldAlert, Landmark, FileText, ArrowUpRight, ArrowDownLeft, Calendar, User, Search, RefreshCw, Sparkles, Trash } from 'lucide-react';
import { FinanceFlow, Contract, User as AppUser } from '../types';

interface FinanceViewProps {
  currentUser: AppUser;
  onRefresh: () => void;
}

export default function FinanceView({ currentUser, onRefresh }: FinanceViewProps) {
  const [finances, setFinances] = useState<FinanceFlow[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [formContractId, setFormContractId] = useState('');
  const [formAmount, setFormAmount] = useState(0);
  const [formRecordDate, setFormRecordDate] = useState('');
  const [formBankAccount, setFormBankAccount] = useState('');
  const [formFlowCategory, setFormFlowCategory] = useState('');
  const [formDesc, setFormDesc] = useState('');

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/finances', { headers: { 'X-User-Id': currentUser.id } });
      const fins = await res.json();
      setFinances(Array.isArray(fins) ? fins : []);

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
      // Find contract type to determine flow type automatically
      const contract = contracts.find(c => c.id === formContractId);
      if (!contract) {
        throw new Error("必须选中其对应的有效主合同契约！");
      }

      const res = await fetch('/api/finances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id
        },
        body: JSON.stringify({
          contractId: formContractId,
          type: contract.type, // auto matched收款 contract -> income,付款 contract -> expense
          amount: Number(formAmount),
          recordDate: formRecordDate,
          bankAccount: formBankAccount,
          flowCategory: formFlowCategory,
          operator: currentUser.name,
          status: 'pending', // flows always start pending approval for strict financial security!
          description: formDesc
        })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "交易登记失败");
      }

      setShowAddModal(false);
      // Clean form
      setFormContractId('');
      setFormAmount(0);
      setFormRecordDate('');
      setFormBankAccount('');
      setFormFlowCategory('');
      setFormDesc('');
      fetchData();
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleTriggerApproval = async (flow: FinanceFlow) => {
    if (currentUser.role === 'guest') {
      alert("只读访客无权提请业务结算流程！");
      return;
    }
    try {
      // Spawns a dedicated Approval workflow item
      const apprRes = await fetch('/api/approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id
        },
        body: JSON.stringify({
          targetType: 'finance',
          targetId: flow.id,
          title: `关于登记【${flow.flowCategory}】共计 ${flow.amount.toLocaleString()} 元的结算核销审核申请`,
          content: `流水代码: ${flow.code}。金额为 ${flow.amount.toLocaleString()} 元，录入日期：${flow.recordDate}，转账对入卡号：${flow.bankAccount}。附注:${flow.description || '无'}。请领导核准确认入账复核。`
        })
      });

      if (!apprRes.ok) {
        const d = await apprRes.json();
        alert(d.error || "提报失败");
        return;
      }

      alert("财务结算复核提请成功！已自动向总经理及有关管理员委派流程审批。核决同意后本币交易流水将被完全锁定。");
      fetchData();
      onRefresh();
    } catch (e) {
      alert("接口通讯异常");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("确定要撤销并废弃这一笔银行流水单据吗？已复核的锁定凭证将无法由于核对平衡被擅自删除！")) return;
    try {
      const res = await fetch(`/api/finances/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': currentUser.id }
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "流水删除失败");
        return;
      }
      fetchData();
      onRefresh();
    } catch (e: any) {
      alert("操作失败");
    }
  };

  const filteredFinances = finances.filter(f => 
    f.flowCategory.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.bankAccount.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(val);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
            <Landmark size={18} className="text-emerald-500" />
            企业银行实际现金流对账簿 (财务流水)
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5 mt-1">
            实时记录和对齐企业公账银行卡的实际收付款。每项流水必须依附于特定生效合同，并经总经理最终审批验证。
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          <Plus size={14} /> 登记新现金交易
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-2.5 text-slate-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="搜索流水号/收付科目/开户账号..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={fetchData}
          className="p-1 px-3 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs text-slate-500 flex items-center gap-1 transition-colors"
        >
          <RefreshCw size={12} /> 同步公账
        </button>
      </div>

      {/* Main Flows Table */}
      <div className="overflow-x-auto border border-slate-100 rounded-lg text-xs">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
            <tr>
              <th className="py-2.5 px-3">流水编码</th>
              <th className="py-2.5 px-3">财务收支科目</th>
              <th className="py-2.5 px-3">对应契约主合同</th>
              <th className="py-2.5 px-3">方向</th>
              <th className="py-2.5 px-3">交易本币金值</th>
              <th className="py-2.5 px-3">对转开户行账号</th>
              <th className="py-2.5 px-3">交易日期</th>
              <th className="py-2.5 px-3">对算经办人</th>
              <th className="py-2.5 px-3">核销状态</th>
              <th className="py-2.5 px-3 text-right">核销提报</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-600">
            {filteredFinances.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">银行公账暂无匹配流水划拨。</td>
              </tr>
            ) : (
              filteredFinances.map(f => (
                <tr key={f.id} className="hover:bg-slate-100/30 transition-colors">
                  <td className="py-3 px-3 font-mono text-[10.5px] text-slate-500">{f.code}</td>
                  <td className="py-3 px-3 font-bold text-slate-800">{f.flowCategory}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-700 truncate max-w-[150px]" title={f.contractName}>{f.contractName}</div>
                    {f.projectName && (
                      <div className="text-[9px] text-slate-400 truncate max-w-[150px]">所属项目: {f.projectName}</div>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                      f.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {f.type === 'income' ? '入账(收款)' : '拨付(支出)'}
                    </span>
                  </td>
                  <td className={`py-3 px-3 font-bold text-sm ${f.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {f.type === 'income' ? '+' : '-'}{formatMoney(f.amount)}
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[10px]">{f.bankAccount}</td>
                  <td className="py-3 px-3 text-slate-400">{f.recordDate}</td>
                  <td className="py-3 px-3 text-slate-500">{f.operator}</td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      f.status === 'verified' ? 'bg-emerald-100/60 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {f.status === 'verified' ? '已核销复核' : '草案待验证'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right" onClick={e => e.stopPropagation()}>
                    {f.status === 'pending' ? (
                      <div className="flex justify-end gap-1.5 items-center">
                        <button
                          onClick={() => handleTriggerApproval(f)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold rounded text-[10px] flex items-center gap-0.5 transition-all shadow-xs"
                          title="提请流程核决"
                        >
                          <Sparkles size={10} /> 提报审批
                        </button>
                        <button
                          onClick={() => handleDelete(f.id)}
                          className="p-1 hover:text-rose-500 hover:bg-rose-50 rounded"
                          title="撤销登记"
                        >
                          <Trash size={11} className="text-slate-450 text-slate-400" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-0.5"><Check size={12} /> 完全记账锁定</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: 登记银行交易现金出纳 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-xs text-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">登记银行实际资金往来</h3>
            {errorMsg && <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded">{errorMsg}</div>}
            
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">勾连绑定之主契约合同 *</label>
                <select required value={formContractId} onChange={e => setFormContractId(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded text-slate-700">
                  <option value="">-- 请选择关联账本合同 --</option>
                  {contracts.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.type === 'income' ? '收款' : '付款'}] {c.name} (签额 ¥{c.amount.toLocaleString()})
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-slate-400 mt-1 italic">提示：流水收支方向根据主合同性质自适应绑定。</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">交易本金金值 (¥) *</label>
                  <input required type="number" min={1} value={formAmount} onChange={e => setFormAmount(Number(e.target.value))} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">银行对账日期 *</label>
                  <input required type="date" value={formRecordDate} onChange={e => setFormRecordDate(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">解付转存公账开户行与卡号 *</label>
                <input required type="text" placeholder="例: 中国工商银行北京复兴支行 1029..." value={formBankAccount} onChange={e => setFormBankAccount(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">财务结算交易科目 (如首期款、质保等) *</label>
                <input required type="text" placeholder="首付款 / 中期进度款 / 验收尾款 / 分包履约保证金" value={formFlowCategory} onChange={e => setFormFlowCategory(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">汇款附言/财务复核补充意见</label>
                <textarea rows={2} value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 bg-slate-100 rounded text-slate-600">取消</button>
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">登记待复核流水</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
