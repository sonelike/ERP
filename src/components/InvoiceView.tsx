import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Receipt, Percent, FileText, Calendar, ShieldCheck, Search, Tag } from 'lucide-react';
import { Invoice, Contract, User } from '../types';

interface InvoiceViewProps {
  currentUser: User;
  onRefresh: () => void;
}

export default function InvoiceView({ currentUser, onRefresh }: InvoiceViewProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [formContractId, setFormContractId] = useState('');
  const [formType, setFormType] = useState<'received' | 'issued'>('issued');
  const [formAmount, setFormAmount] = useState(0);
  const [formTaxRate, setFormTaxRate] = useState(6); // 3, 6, 9, 13 etc
  const [formNumber, setFormNumber] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formDesc, setFormDesc] = useState('');

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/invoices', { headers: { 'X-User-Id': currentUser.id } });
      const invs = await res.json();
      setInvoices(Array.isArray(invs) ? invs : []);

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
      const taxAmount = Number(((formAmount * formTaxRate) / (100 + formTaxRate)).toFixed(2)); // Standard Chinese VAT inclusive formula
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id
        },
        body: JSON.stringify({
          contractId: formContractId,
          type: formType,
          amount: Number(formAmount),
          taxRate: Number(formTaxRate),
          taxAmount,
          invoiceNumber: formNumber,
          invoiceDate: formDate,
          status: formType === 'issued' ? 'issued' : 'registered',
          description: formDesc,
          creatorId: currentUser.id
        })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "登记发票失败！");
      }

      setShowAddModal(false);
      resetForm();
      fetchData();
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("确定要作废并删除对开此专用发票的备份底单吗？")) return;
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': currentUser.id }
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "删除失败");
        return;
      }
      fetchData();
      onRefresh();
    } catch (e) {
      alert("通信失败");
    }
  };

  const resetForm = () => {
    setFormContractId('');
    setFormType('issued');
    setFormAmount(0);
    setFormTaxRate(6);
    setFormNumber('');
    setFormDate('');
    setFormDesc('');
    setErrorMsg('');
  };

  const filteredInvoices = invoices.filter(i => 
    i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.contractName && i.contractName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(val);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4 text-xs text-slate-700">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
            <Receipt size={18} className="text-blue-500" />
            企业收/发增值税专用发票管理 (发票流)
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            维护销项开票 (客户收款发票记录) 与进项进税 (供应商采购发票台账)。包含国税准则(价税分离算法) 自动价税分离计算。
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          <Plus size={14} /> 开具/登记税票
        </button>
      </div>

      <div className="relative">
        <span className="absolute left-3 top-2.5 text-slate-400">
          <Search size={14} />
        </span>
        <input
          type="text"
          placeholder="搜索专用税票号、关联主契约合同名称..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* invoices table list */}
      <div className="overflow-x-auto border border-slate-100 rounded-lg">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-semibold text-[11px]">
            <tr>
              <th className="py-2.5 px-3">专票核心号码</th>
              <th className="py-2.5 px-3">关联主契约合同</th>
              <th className="py-2.5 px-3">发票大类</th>
              <th className="py-2.5 px-3">发票总金额 (含税价)</th>
              <th className="py-2.5 px-3">国税专征税率</th>
              <th className="py-2.5 px-3">价税分离：净负荷税额</th>
              <th className="py-2.5 px-3">业务开具日期</th>
              <th className="py-2.5 px-3">解付对账状态</th>
              <th className="py-2.5 px-3 text-right">核销</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-600">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">系统尚无发票明细登记。</td>
              </tr>
            ) : (
              filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono text-slate-800 font-bold flex items-center gap-1">
                    <Tag size={12} className="text-blue-500" />
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-3 truncate max-w-[150px]" title={inv.contractName}>
                    {inv.contractName}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-semibold ${
                      inv.type === 'issued' ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      {inv.type === 'issued' ? '销项发票 (给买方)' : '进项发票 (我方报销)'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800 bg-slate-50/20">{formatMoney(inv.amount)}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-500 flex items-center gap-0.5">
                      {inv.taxRate}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                    ¥{inv.taxAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {inv.invoiceDate}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      inv.status === 'issued' || inv.status === 'registered' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {inv.status === 'issued' ? '已正式开具交付' : inv.status === 'registered' ? '抵扣入账对齐' : '挂置核算中'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="p-1 hover:text-rose-500 hover:bg-slate-50 rounded"
                      title="废票及冲销"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: 登记税票 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-xs text-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">税务专用发票开具核记</h3>
            {errorMsg && <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded">{errorMsg}</div>}
            
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">勾连对齐之主合同契约 *</label>
                <select required value={formContractId} onChange={e => setFormContractId(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded text-slate-700">
                  <option value="">-- 请选择关联契约 --</option>
                  {contracts.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.type === 'income' ? '收款' : '付款'}] {c.name} (总本金: ¥{c.amount.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">发票出纳类型 *</label>
                  <select required value={formType} onChange={e => setFormType(e.target.value as any)} className="w-full p-1.5 border border-slate-200 rounded">
                    <option value="issued">销项专票 (我司给买方客户开具)</option>
                    <option value="received">进项专票 (我司收到供应商发票)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">含税开票金额 (¥) *</label>
                  <input required type="number" min={1} value={formAmount} onChange={e => setFormAmount(Number(e.target.value))} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">中华人民共和国增值税率 *</label>
                  <select required value={formTaxRate} onChange={e => setFormTaxRate(Number(e.target.value))} className="w-full p-1.5 border border-slate-200 rounded text-slate-700">
                    <option value="13">13% (国家标准工业采购/重型硬件)</option>
                    <option value="9">9% (工程施工/安装改造配套)</option>
                    <option value="6">6% (现代高新信息集成技术服务)</option>
                    <option value="3">3% (小规模纳税人统征专征款)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">国税发票统配号码 *</label>
                  <input required type="text" placeholder="例: FP-XXXXXXXX..." value={formNumber} onChange={e => setFormNumber(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">开票凭发日期 *</label>
                <input required type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">专票要素及内容备注 (可空)</label>
                <textarea rows={2} value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 bg-slate-100 rounded text-slate-600">取消</button>
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">正式价税分离登记</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
