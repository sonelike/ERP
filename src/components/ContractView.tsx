import React, { useState, useEffect } from 'react';
import { Plus, ShieldAlert, Edit, Trash, FileText, ArrowUpRight, ArrowDownLeft, Calendar, UserCheck, Receipt, Landmark, HelpCircle } from 'lucide-react';
import { Contract, Project, Customer, FinanceFlow, Invoice, Margin, User } from '../types';

interface ContractViewProps {
  currentUser: User;
  onRefresh: () => void;
}

export default function ContractView({ currentUser, onRefresh }: ContractViewProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [finances, setFinances] = useState<FinanceFlow[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  const [selectedCont, setSelectedCont] = useState<Contract | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');

  // Modals & Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form inputs
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'income' | 'expense'>('income');
  const [formProjectId, setFormProjectId] = useState('');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formAmount, setFormAmount] = useState(0);
  const [formStatus, setFormStatus] = useState<Contract['status']>('draft');
  const [formSignDate, setFormSignDate] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formOurSigner, setFormOurSigner] = useState('');
  const [formCustomerSigner, setFormCustomerSigner] = useState('');
  const [formIsMarginIncluded, setFormIsMarginIncluded] = useState(false);
  const [formMarginAmount, setFormMarginAmount] = useState(0);
  const [formTerms, setFormTerms] = useState('');
  const [editId, setEditId] = useState('');

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/contracts', { headers: { 'X-User-Id': currentUser.id } });
      const contrs = await res.json();
      setContracts(Array.isArray(contrs) ? contrs : []);

      const projRes = await fetch('/api/projects', { headers: { 'X-User-Id': currentUser.id } });
      const projs = await projRes.json();
      setProjects(Array.isArray(projs) ? projs : []);

      const custRes = await fetch('/api/customers', { headers: { 'X-User-Id': currentUser.id } });
      const custs = await custRes.json();
      setCustomers(Array.isArray(custs) ? custs : []);

      const finRes = await fetch('/api/finances', { headers: { 'X-User-Id': currentUser.id } });
      const fins = await finRes.json();
      setFinances(Array.isArray(fins) ? fins : []);

      const invRes = await fetch('/api/invoices', { headers: { 'X-User-Id': currentUser.id } });
      const invs = await invRes.json();
      setInvoices(Array.isArray(invs) ? invs : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id
        },
        body: JSON.stringify({
          name: formName,
          type: formType,
          projectId: formProjectId,
          customerId: formCustomerId,
          amount: Number(formAmount),
          status: formStatus,
          signDate: formSignDate,
          startDate: formStartDate,
          endDate: formEndDate,
          ourSigner: formOurSigner,
          customerSigner: formCustomerSigner,
          isMarginIncluded: formIsMarginIncluded,
          marginAmount: formIsMarginIncluded ? Number(formMarginAmount) : 0,
          terms: formTerms,
          creatorId: currentUser.id
        })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "创建立项契约失败");
      }

      setShowAddModal(false);
      resetForm();
      fetchData();
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleEditClick = (cont: Contract) => {
    setEditId(cont.id);
    setFormName(cont.name);
    setFormType(cont.type);
    setFormProjectId(cont.projectId);
    setFormCustomerId(cont.customerId);
    setFormAmount(cont.amount);
    setFormStatus(cont.status);
    setFormSignDate(cont.signDate);
    setFormStartDate(cont.startDate);
    setFormEndDate(cont.endDate);
    setFormOurSigner(cont.ourSigner);
    setFormCustomerSigner(cont.customerSigner);
    setFormIsMarginIncluded(cont.isMarginIncluded);
    setFormMarginAmount(cont.marginAmount);
    setFormTerms(cont.terms || '');
    setErrorMsg('');
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch(`/api/contracts/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id
        },
        body: JSON.stringify({
          name: formName,
          type: formType,
          projectId: formProjectId,
          customerId: formCustomerId,
          amount: Number(formAmount),
          status: formStatus,
          signDate: formSignDate,
          startDate: formStartDate,
          endDate: formEndDate,
          ourSigner: formOurSigner,
          customerSigner: formCustomerSigner,
          isMarginIncluded: formIsMarginIncluded,
          marginAmount: formIsMarginIncluded ? Number(formMarginAmount) : 0,
          terms: formTerms
        })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "修改失败");
      }

      setShowEditModal(false);
      resetForm();
      fetchData();
      onRefresh();
      
      // Update Detail slide state dynamically
      if (selectedCont && selectedCont.id === editId) {
        const updated = contracts.find(c => c.id === editId);
        if (updated) {
          setSelectedCont({ ...updated, name: formName, amount: Number(formAmount), status: formStatus });
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("确定要删除该契约底单吗？安全审计机制会锁死已核发过专用开票和有实际流水变动的所有订单！")) return;
    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': currentUser.id }
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "删除由于外键及财务不平逻辑受限暂停。");
        return;
      }
      if (selectedCont?.id === id) {
        setSelectedCont(null);
      }
      fetchData();
      onRefresh();
    } catch (e: any) {
      alert("通信失败: " + e.message);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormType('income');
    setFormProjectId('');
    setFormCustomerId('');
    setFormAmount(0);
    setFormStatus('draft');
    setFormSignDate('');
    setFormStartDate('');
    setFormEndDate('');
    setFormOurSigner('');
    setFormCustomerSigner('');
    setFormIsMarginIncluded(false);
    setFormMarginAmount(0);
    setFormTerms('');
    setErrorMsg('');
  };

  const filteredContracts = contracts.filter(c => {
    if (activeTab === 'income') return c.type === 'income';
    if (activeTab === 'expense') return c.type === 'expense';
    return true;
  });

  // Dynamic values resolved rel-to-selected-contract (THE GORE AND GLORY!)
  const getContractReport = () => {
    if (!selectedCont) return null;

    // 1. Associated bank cashflow flows
    const relatedFlows = finances.filter(f => f.contractId === selectedCont.id);
    
    // 2. Real-time validated vs pending streams
    const verifiedFlows = relatedFlows.filter(f => f.status === 'verified');
    const actualCashSum = verifiedFlows.reduce((sum, f) => sum + f.amount, 0);

    // 3. Invoice tracker mapping
    const relatedInvoices = invoices.filter(i => i.contractId === selectedCont.id);
    const totalInvoicedSum = relatedInvoices.reduce((sum, i) => sum + i.amount, 0);

    // 4. Linked project execution progress
    const associatedProject = projects.find(p => p.id === selectedCont.projectId);

    return {
      relatedFlows,
      actualCashSum,
      relatedInvoices,
      totalInvoicedSum,
      associatedProject
    };
  };

  const report = getContractReport();

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(val);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* LEFT 2 COLUMNS: Contracts Ledger Grid */}
      <div className="xl:col-span-2 bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-800">立项合同契约台账</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">涵盖上游交付收款合同、采购分包/硬件供应付款合同分类平衡核记。</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors"
          >
            <Plus size={14} /> 签订新合同
          </button>
        </div>

        {/* Tab filters */}
        <div className="flex border-b border-slate-100 pb-1 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2 px-2.5 font-medium border-b-2 transition-colors ${
              activeTab === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            全盘契约 ({contracts.length})
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`pb-2 px-2.5 font-medium border-b-2 transition-colors ${
              activeTab === 'income' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            收入合同 ({contracts.filter(c => c.type === 'income').length})
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`pb-2 px-2.5 font-medium border-b-2 transition-colors ${
              activeTab === 'expense' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            支出大底分包 ({contracts.filter(c => c.type === 'expense').length})
          </button>
        </div>

        {/* Table data */}
        <div className="overflow-x-auto border border-slate-100 rounded-lg text-xs">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">合同名及代码</th>
                <th className="py-2.5 px-3">关联项目</th>
                <th className="py-2.5 px-3">性质</th>
                <th className="py-2.5 px-3">合同总价</th>
                <th className="py-2.5 px-3">履约状态</th>
                <th className="py-2.5 px-3 text-right">管理</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">无可核销及履行的契约记录。</td>
                </tr>
              ) : (
                filteredContracts.map(c => (
                  <tr 
                    key={c.id}
                    onClick={() => setSelectedCont(c)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      selectedCont?.id === c.id ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{c.name}</div>
                      <div className="text-[9px] font-mono text-slate-400">{c.code}</div>
                    </td>
                    <td className="py-3 px-3 truncate max-w-[150px]" title={c.projectName}>
                      {c.projectName}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                        c.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {c.type === 'income' ? '收款类' : '付款采购'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{formatMoney(c.amount)}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-medium ${
                        c.status === 'active' ? 'bg-emerald-100/60 text-emerald-700' :
                        c.status === 'draft' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {c.status === 'active' ? '生效履行' : c.status === 'draft' ? '草稿起草' : '审核锁死'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => handleEditClick(c)}
                        className="p-1 hover:text-blue-600 hover:bg-slate-50 rounded"
                        title="契约变更"
                      >
                        <Edit size={12} />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="p-1 hover:text-rose-500 hover:bg-slate-50 rounded"
                        title="销毁撤单"
                      >
                        <Trash size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT SIDEBAR COLUMN: Contract detailed penetrative visualizer */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-1.5">
          <FileText size={16} className="text-blue-500" />
          契约生命周期 财务/进度穿透
        </h3>

        {!selectedCont || !report ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2 h-full">
            <HelpCircle size={32} className="text-slate-300" />
            <span>请在左侧列表中指定合同文件。</span>
            <span className="text-[10px] max-w-xs leading-normal">
              本子控制台将自动下钻追踪：流转资金对账、税务开票进度、以及该合同所对应的研发或基建工程的实际执行比例百分百同步！
            </span>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Header metadata summary */}
            <div className="p-3 bg-slate-50 rounded-xl space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="font-mono text-slate-400">{selectedCont.code}</span>
                <span className={`px-1 rounded text-[9px] font-bold ${
                  selectedCont.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {selectedCont.type === 'income' ? '收款主合同' : '付款劳务/采购分包'}
                </span>
              </div>
              <h4 className="font-bold text-slate-800 text-xs leading-snug">{selectedCont.name}</h4>
              
              <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                <div>
                  <span className="text-slate-400 block">合同签署总额:</span>
                  <span className="font-bold text-slate-700">{formatMoney(selectedCont.amount)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">本币质保保证金:</span>
                  <span className="font-semibold text-amber-600">
                    {selectedCont.isMarginIncluded ? formatMoney(selectedCont.marginAmount) : '无约定'}
                  </span>
                </div>
              </div>
            </div>

            {/* RELATIONAL MODULE BINDING A: Corresponding Project Execution Progress */}
            <div className="border border-slate-100 p-3.5 rounded-xl space-y-2">
              <h5 className="font-bold text-slate-700 flex justify-between items-center text-[10px]">
                <span>所赋项目群执行进度 (ENGINEERING)</span>
                {report.associatedProject && (
                  <span className={`px-1 py-0.2 rounded text-[8px] font-medium ${
                    report.associatedProject.status === 'executing' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {report.associatedProject.status === 'executing' ? '进行中' : '筹建/完成'}
                  </span>
                )}
              </h5>

              {report.associatedProject ? (
                <div className="space-y-1.5">
                  <div className="font-semibold text-slate-800 truncate leading-snug">{report.associatedProject.name}</div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>承运主管: {report.associatedProject.manager}</span>
                    <span>进度: {report.associatedProject.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-150 h-1 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full" style={{ width: `${report.associatedProject.progress}%` }}></div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-[10px] italic">未绑定实际项目工程</p>
              )}
            </div>

            {/* RELATIONAL MODULE BINDING B: Financial Bank Flows (财务流水) */}
            <div className="border border-slate-100 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                <span>契约关联银行流水 (CASH FLOWS)</span>
                <span className="text-[10px] text-emerald-600">
                  回笼/已付 {((report.actualCashSum / selectedCont.amount) * 100).toFixed(1)}%
                </span>
              </div>

              {report.relatedFlows.length === 0 ? (
                <p className="p-3 bg-slate-50 text-center text-slate-400 text-[10px] rounded-lg">该契约项下尚无银行进出账流水</p>
              ) : (
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-0.5">
                  {report.relatedFlows.map(f => (
                    <div key={f.id} className="p-2 bg-slate-50 border border-slate-100/60 rounded flex justify-between items-center text-[10px]">
                      <div>
                        <div className="font-bold text-slate-700">{f.flowCategory}</div>
                        <div className="text-[8px] text-slate-400">{f.recordDate} | {f.bankAccount.substring(0, 8)}...</div>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold block ${f.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {f.type === 'income' ? '+' : '-'}{formatMoney(f.amount)}
                        </span>
                        <span className="text-[8px] text-slate-400">{f.status === 'verified' ? '已核销复核' : '待批'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Math Check Tally */}
              <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] font-semibold text-slate-700">
                <span>累计已结算资金:</span>
                <span className="text-emerald-600">{formatMoney(report.actualCashSum)}</span>
              </div>
            </div>

            {/* RELATIONAL MODULE BINDING C: Invoice Status Tracker */}
            <div className="border border-slate-100 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                <span>契约增值税专用发票 (TAX INVOICES)</span>
                <span className="text-[10px] text-blue-600">
                  开票比例 {((report.totalInvoicedSum / selectedCont.amount) * 100).toFixed(1)}%
                </span>
              </div>

              {report.relatedInvoices.length === 0 ? (
                <p className="p-3 bg-slate-50 text-center text-slate-400 text-[10px] rounded-lg">系统尚未开具/登记对应契约的增值税专用发票</p>
              ) : (
                <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-0.5">
                  {report.relatedInvoices.map(inv => (
                    <div key={inv.id} className="p-2 bg-slate-50 border border-slate-100/60 rounded flex justify-between items-center text-[10px]">
                      <div>
                        <div className="font-bold text-slate-700">税票号: {inv.invoiceNumber}</div>
                        <div className="text-[8px] text-slate-400">{inv.invoiceDate}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold block text-slate-700">{formatMoney(inv.amount)}</span>
                        <span className="text-[8px] text-slate-400">税率:{inv.taxRate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Math Check Tally visual */}
              <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] font-semibold text-slate-700">
                <span>已验证开具契税总额:</span>
                <span className="text-blue-600">{formatMoney(report.totalInvoicedSum)}</span>
              </div>
            </div>

            {/* Terms clause text */}
            <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100/40 text-[10px] text-amber-800 leading-normal">
              <span className="font-bold block text-slate-700 mb-0.5">付款契约约定与回扣结算条款:</span>
              {selectedCont.terms || '未约定详细分期、交付及保证金罚没条款。'}
            </div>
          </div>
        )}
      </div>

      {/* MODAL: 契约签订 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 text-xs text-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">签订全新双边/多边履行合同</h3>
            {errorMsg && <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded">{errorMsg}</div>}
            
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">合同文本/标的名 *</label>
                  <input required type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="项目采购/总包契约名" className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">契约收支性质 *</label>
                  <select required value={formType} onChange={e => setFormType(e.target.value as any)} className="w-full p-1.5 border border-slate-200 rounded">
                    <option value="income">收款合同 (业主方向)</option>
                    <option value="expense">分包付款劳务合同 (供应商方向)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">归宿挂接之子项目 *</label>
                  <select required value={formProjectId} onChange={e => setFormProjectId(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded text-slate-700">
                    <option value="">-- 请选择关联项目 --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">涉事往来客商名称 *</label>
                  <select required value={formCustomerId} onChange={e => setFormCustomerId(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded text-slate-700">
                    <option value="">-- 请选择往来客商资信簿 --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">合同本金数额 *</label>
                  <input required type="number" min={1} value={formAmount} onChange={e => setFormAmount(Number(e.target.value))} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">签约生效日期 *</label>
                  <input required type="date" value={formSignDate} onChange={e => setFormSignDate(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">初始拟效状态 *</label>
                  <select required value={formStatus} onChange={e => setFormStatus(e.target.value as any)} className="w-full p-1.5 border border-slate-200 rounded text-slate-700">
                    <option value="draft">初始拟草稿</option>
                    <option value="under_review">送审评审中</option>
                    <option value="active">审核通过正式生效</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-2.5">
                <div>
                  <label className="block text-slate-400 mb-1">我司签核代表 *</label>
                  <input required type="text" value={formOurSigner} onChange={e => setFormOurSigner(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">对方认领签字人 *</label>
                  <input required type="text" value={formCustomerSigner} onChange={e => setFormCustomerSigner(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">计划启动日期 *</label>
                  <input required type="date" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">计划完款终止限期 *</label>
                  <input required type="date" value={formEndDate} onChange={e => setFormEndDate(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
              </div>

              {/* Collapsible guarantee margins settings */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-2.5">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="marginId" checked={formIsMarginIncluded} onChange={e => setFormIsMarginIncluded(e.target.checked)} />
                  <label htmlFor="marginId" className="font-bold text-slate-750">约定包含履约质保保证金项？</label>
                </div>
                {formIsMarginIncluded && (
                  <div>
                    <label className="block text-slate-400 mb-1 text-[10px]">划交保证金敞口总值 (¥)</label>
                    <input type="number" min={0} value={formMarginAmount} onChange={e => setFormMarginAmount(Number(e.target.value))} className="w-full p-1.5 border border-slate-200 rounded bg-white" placeholder="如: 100000" />
                    <p className="text-[10px] text-slate-400 mt-1 italic">提示：保存立约时，审批中枢将自动分派一条未解付的保证金应收应支单（BZJ）同步跟踪。</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1">具体支付节点说明与条款条约</label>
                <textarea rows={2} value={formTerms} onChange={e => setFormTerms(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 bg-slate-100 rounded text-slate-600">取消</button>
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">送办签合</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: 契约要素变更 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 text-xs text-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">更正契约大类及本金说明</h3>
            {errorMsg && <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded">{errorMsg}</div>}
            
            <form onSubmit={handleUpdate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">契约本名 *</label>
                  <input required type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">契约收支性质 *</label>
                  <select required value={formType} onChange={e => setFormType(e.target.value as any)} className="w-full p-1.5 border border-slate-200 rounded">
                    <option value="income">收款合同 (业主方关系)</option>
                    <option value="expense">分包付款合同 (劳务采购方关系)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">归挂工程 *</label>
                  <select required value={formProjectId} onChange={e => setFormProjectId(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded text-slate-700">
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">客商资信单元 *</label>
                  <select required value={formCustomerId} onChange={e => setFormCustomerId(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded text-slate-700">
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">合同核定本金 *</label>
                  <input required type="number" min={1} value={formAmount} onChange={e => setFormAmount(Number(e.target.value))} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">签字日期 *</label>
                  <input required type="date" value={formSignDate} onChange={e => setFormSignDate(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">履行状态 *</label>
                  <select required value={formStatus} onChange={e => setFormStatus(e.target.value as any)} className="w-full p-1.5 border border-slate-200 rounded text-slate-700">
                    <option value="draft">初始起案稿</option>
                    <option value="under_review">送审审理中</option>
                    <option value="active">正常履行常态</option>
                    <option value="completed">完全履行归功</option>
                    <option value="suspended">封案闲置中断</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">我方业务总管代表 *</label>
                  <input required type="text" value={formOurSigner} onChange={e => setFormOurSigner(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">对方签约承办代表 *</label>
                  <input required type="text" value={formCustomerSigner} onChange={e => setFormCustomerSigner(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">计划启动日期 *</label>
                  <input required type="date" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">计划完款限期 *</label>
                  <input required type="date" value={formEndDate} onChange={e => setFormEndDate(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
              </div>

              {/* Collapsible margins edits */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-2.5">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="marginId2" checked={formIsMarginIncluded} onChange={e => setFormIsMarginIncluded(e.target.checked)} />
                  <label htmlFor="marginId2" className="font-bold text-slate-755">核设约定质保保证金？</label>
                </div>
                {formIsMarginIncluded && (
                  <div>
                    <label className="block text-slate-400 mb-1 text-[10px]">应付应收保证金值 (¥)</label>
                    <input type="number" min={0} value={formMarginAmount} onChange={e => setFormMarginAmount(Number(e.target.value))} className="w-full p-1.5 border border-slate-200 rounded bg-white" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1">节点条款及内容约定</label>
                <textarea rows={2} value={formTerms} onChange={e => setFormTerms(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-3 py-1.5 bg-slate-100 rounded text-slate-600">取消</button>
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">存入修订</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
