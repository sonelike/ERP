import React, { useState, useEffect } from 'react';
import { Plus, ShieldAlert, Edit, Trash, FolderKanban, Milestone, DollarSign, Calendar, Eye, FileText, Landmark, Receipt, Sparkles } from 'lucide-react';
import { Project, Customer, Contract, Invoice, Margin, FinanceFlow, User } from '../types';

interface ProjectViewProps {
  currentUser: User;
  onRefresh: () => void;
}

export default function ProjectView({ currentUser, onRefresh }: ProjectViewProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [margins, setMargins] = useState<Margin[]>([]);
  const [finances, setFinances] = useState<FinanceFlow[]>([]);
  
  const [selectedProj, setSelectedProj] = useState<Project | null>(null);

  // Modals & Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Form elements
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'parent' | 'child'>('parent');
  const [formParentId, setFormParentId] = useState<string>('');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formStatus, setFormStatus] = useState<Project['status']>('planning');
  const [formManager, setFormManager] = useState('');
  const [formBudget, setFormBudget] = useState(0);
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formProgress, setFormProgress] = useState(0);
  const [editId, setEditId] = useState('');

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const projRes = await fetch('/api/projects', { headers: { 'X-User-Id': currentUser.id } });
      const projs = await projRes.json();
      setProjects(Array.isArray(projs) ? projs : []);

      const custRes = await fetch('/api/customers', { headers: { 'X-User-Id': currentUser.id } });
      const custs = await custRes.json();
      setCustomers(Array.isArray(custs) ? custs : []);

      const contRes = await fetch('/api/contracts', { headers: { 'X-User-Id': currentUser.id } });
      const conts = await contRes.json();
      setContracts(Array.isArray(conts) ? conts : []);

      const invRes = await fetch('/api/invoices', { headers: { 'X-User-Id': currentUser.id } });
      const invs = await invRes.json();
      setInvoices(Array.isArray(invs) ? invs : []);

      const margRes = await fetch('/api/margins', { headers: { 'X-User-Id': currentUser.id } });
      const margs = await margRes.json();
      setMargins(Array.isArray(margs) ? margs : []);

      const finRes = await fetch('/api/finances', { headers: { 'X-User-Id': currentUser.id } });
      const fins = await finRes.json();
      setFinances(Array.isArray(fins) ? fins : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id
        },
        body: JSON.stringify({
          name: formName,
          type: formType,
          parentId: formType === 'child' ? formParentId : null,
          customerId: formCustomerId,
          status: formStatus,
          manager: formManager,
          budget: Number(formBudget),
          startDate: formStartDate,
          endDate: formEndDate,
          description: formDesc,
          progress: Number(formProgress),
          creatorId: currentUser.id
        })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "创建立项挫败");
      }

      setShowAddModal(false);
      resetForm();
      fetchData();
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleEditClick = (proj: Project) => {
    setEditId(proj.id);
    setFormName(proj.name);
    setFormType(proj.type);
    setFormParentId(proj.parentId || '');
    setFormCustomerId(proj.customerId);
    setFormStatus(proj.status);
    setFormManager(proj.manager);
    setFormBudget(proj.budget);
    setFormStartDate(proj.startDate);
    setFormEndDate(proj.endDate);
    setFormDesc(proj.description || '');
    setFormProgress(proj.progress);
    setErrorMsg('');
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch(`/api/projects/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id
        },
        body: JSON.stringify({
          name: formName,
          type: formType,
          parentId: formType === 'child' ? formParentId : null,
          customerId: formCustomerId,
          status: formStatus,
          manager: formManager,
          budget: Number(formBudget),
          startDate: formStartDate,
          endDate: formEndDate,
          description: formDesc,
          progress: Number(formProgress)
        })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "更新挫败");
      }

      setShowEditModal(false);
      resetForm();
      fetchData();
      onRefresh();
      // update state
      if (selectedProj && selectedProj.id === editId) {
        const updated = projects.find(p => p.id === editId);
        if (updated) {
          setSelectedProj({ ...updated, name: formName, budget: Number(formBudget), manager: formManager, progress: Number(formProgress), status: formStatus });
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("确定要注销并删除该项目单据吗？该操作不可逆，且具有外键级联检查！")) return;
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': currentUser.id }
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "删除失败！涉事项目存有契约绑定逻辑约束。");
        return;
      }
      if (selectedProj?.id === id) {
        setSelectedProj(null);
      }
      fetchData();
      onRefresh();
    } catch (e: any) {
      alert("接口通讯故障");
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormType('parent');
    setFormParentId('');
    setFormCustomerId('');
    setFormStatus('planning');
    setFormManager('');
    setFormBudget(0);
    setFormStartDate('');
    setFormEndDate('');
    setFormDesc('');
    setFormProgress(0);
    setErrorMsg('');
  };

  // Hierarchy modeling: Group projects as Parent -> Children
  const parentProjects = projects.filter(p => p.type === 'parent');
  const getSubProjects = (parentId: string) => projects.filter(p => p.parentId === parentId);

  // Relational details resolution for selected project
  // Can either be linked to a child or the parent itself
  const getRelatedContracts = () => {
    if (!selectedProj) return [];
    
    // Direct matches
    const directContracts = contracts.filter(c => c.projectId === selectedProj.id);
    
    // If it's a parent project, also resolve contracts of its children projects for overall financial visibility!
    if (selectedProj.type === 'parent') {
      const childIds = projects.filter(p => p.parentId === selectedProj.id).map(p => p.id);
      const childrenContracts = contracts.filter(c => childIds.includes(c.projectId));
      return [...directContracts, ...childrenContracts];
    }
    
    return directContracts;
  };

  const relatedContracts = getRelatedContracts();
  const incomeContracts = relatedContracts.filter(c => c.type === 'income');
  const expenseContracts = relatedContracts.filter(c => c.type === 'expense');

  // Collect invoices and margins associated with these contracts
  const contractIds = relatedContracts.map(c => c.id);
  const relatedInvoices = invoices.filter(i => contractIds.includes(i.contractId));
  const relatedMargins = margins.filter(m => contractIds.includes(m.contractId));
  const relatedFinances = finances.filter(f => contractIds.includes(f.contractId));

  // Cumulative math checks
  const totalContractRevenue = incomeContracts.reduce((sum, c) => sum + c.amount, 0);
  const totalContractExpense = expenseContracts.reduce((sum, c) => sum + c.amount, 0);
  const totalCashCollected = relatedFinances.filter(f => f.type === 'income' && f.status === 'verified').reduce((sum, f) => sum + f.amount, 0);
  const totalCashPaidOut = relatedFinances.filter(f => f.type === 'expense' && f.status === 'verified').reduce((sum, f) => sum + f.amount, 0);

  const formatMoney = (val: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT COLUMN: Project Tree Hierarchy View */}
      <div className="lg:col-span-1 bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <FolderKanban size={16} className="text-blue-500" />
              父子层级项目大盘
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5">采用一父对多子关系。支持跨层级合同及财务预算嵌套。</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="p-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-[11px] flex items-center gap-0.5 transition-colors"
          >
            <Plus size={11} /> 新立项目
          </button>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
          {parentProjects.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">暂无立项信息。</div>
          ) : (
            parentProjects.map(parent => {
              const children = getSubProjects(parent.id);
              const isSelected = selectedProj?.id === parent.id;
              
              return (
                <div key={parent.id} className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                  {/* Parent element banner header */}
                  <div 
                    onClick={() => setSelectedProj(parent)}
                    className={`p-3 cursor-pointer flex justify-between items-center transition-colors ${
                      isSelected ? 'bg-indigo-50/70' : 'bg-slate-50/70 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                          父工程
                        </span>
                        <span className="font-bold text-slate-800 text-xs">{parent.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <span>预算: {formatMoney(parent.budget)}</span>
                        <span>•</span>
                        <span>项目群经理: {parent.manager}</span>
                      </div>
                    </div>
                    
                    {/* Progress indicator */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full" style={{ width: `${parent.progress}%` }}></div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600">{parent.progress}%</span>
                    </div>
                  </div>

                  {/* Children elements lists */}
                  <div className="bg-white border-t border-slate-50 divide-y divide-slate-50/50">
                    {children.length === 0 ? (
                      <p className="p-2.5 text-[10px] text-slate-400 text-center italic">无子目派生</p>
                    ) : (
                      children.map(child => {
                        const isChildSelected = selectedProj?.id === child.id;
                        return (
                          <div
                            key={child.id}
                            onClick={() => setSelectedProj(child)}
                            className={`p-2.5 pl-6 cursor-pointer flex justify-between items-center transition-colors ${
                              isChildSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="font-semibold text-slate-700 text-[11px] flex items-center gap-1">
                                <Milestone size={11} className="text-slate-400 shrink-0" />
                                <span className="line-clamp-1">{child.name}</span>
                              </div>
                              <div className="text-[9px] text-slate-400">
                                子项预算: {formatMoney(child.budget)} | 经理: {child.manager}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[9px] font-semibold text-slate-600">{child.progress}%</span>
                              <div className="w-8 bg-slate-100 h-1 rounded-full overflow-hidden">
                                <div className="bg-blue-5050 bg-blue-500 h-full" style={{ width: `${child.progress}%` }}></div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CORE DETAIL SECTION: Rich Relational Integration View */}
      <div className="lg:col-span-2 space-y-6">
        {!selectedProj ? (
          <div className="bg-white rounded-xl border border-slate-100 p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3 shadow-sm h-full max-h-[500px]">
            <FolderKanban size={36} className="text-slate-300" />
            <span>请在左侧选取任意父级或子级研发、建筑工程。</span>
            <span className="text-[10px] max-w-sm text-slate-400">
              系统将自动装配其下挂接的所有 收款/付款合同台账、开销项税票状态、银行流水明细及履约保证金结转状态！
            </span>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-6">
            
            {/* Project Title and Stats Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    selectedProj.type === 'parent' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {selectedProj.type === 'parent' ? '父项目群主项' : '节点性子子项'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">编号: {selectedProj.code}</span>
                </div>
                <h2 className="text-base font-bold text-slate-800 mt-1 leading-snug">{selectedProj.name}</h2>
                <p className="text-[10px] text-slate-400 mt-0.5">对应关联客户：<strong className="text-slate-600">{selectedProj.customerName}</strong></p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => handleEditClick(selectedProj)}
                  className="p-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-semibold rounded text-[11px] flex items-center gap-1 transition-all"
                >
                  <Edit size={11} /> 配置要素
                </button>
                <button
                  onClick={() => handleDelete(selectedProj.id)}
                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded text-[11px] flex items-center gap-1 transition-all"
                >
                  <Trash size={11} /> 注销下线
                </button>
              </div>
            </div>

            {/* Micro visual stats banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Stat 1 */}
              <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">基建/研发预算额 *</span>
                <span className="text-sm font-bold text-slate-800">{formatMoney(selectedProj.budget)}</span>
                <div className="text-[9px] text-slate-400 flex items-center gap-1 pt-1.5 border-t border-slate-100/60">
                  <Calendar size={10} /> {selectedProj.startDate} 至 {selectedProj.endDate}
                </div>
              </div>

              {/* Stat 2 */}
              <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">合同配套总和 (收 vs 支)</span>
                <div className="text-[11px] text-slate-600 flex justify-between">
                  <span>合同收款总额:</span>
                  <span className="font-bold text-emerald-600">{formatMoney(totalContractRevenue)}</span>
                </div>
                <div className="text-[11px] text-slate-600 flex justify-between pt-1 border-t border-slate-100/60">
                  <span>合同付款采购:</span>
                  <span className="font-bold text-rose-500">{formatMoney(totalContractExpense)}</span>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 block font-medium">执行进度 & 预算平衡比</span>
                <div className="flex justify-between items-center text-[11px]">
                  <span>进度指数:</span>
                  <span className="font-semibold text-slate-700">{selectedProj.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div className="bg-blue-600 h-full" style={{ width: `${selectedProj.progress}%` }}></div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="text-xs text-slate-500 bg-slate-50/40 p-3 rounded-lg border border-slate-50">
              <span className="font-bold text-slate-700 block mb-0.5">立项目的与背景说明:</span>
              {selectedProj.description || '当前没有录入项目大纲及目的描述。'}
            </div>

            {/* TAB-LIKE GRID FOR INTEGRATED FINANCIAL TRANSPARENCY */}
            <div className="space-y-6">
              
              {/* Segment 1: Associated Income & Expense Contracts */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                  <FileText size={15} className="text-indigo-500" />
                  各签署合同台账 ({relatedContracts.length})
                </h3>
                {relatedContracts.length === 0 ? (
                  <p className="text-center py-4 bg-slate-50 text-slate-400 text-[10px] rounded-lg border">暂无与该项目绑定的收付款合同单据</p>
                ) : (
                  <div className="overflow-x-auto border border-slate-100 rounded-lg text-xs">
                    <table className="min-w-full text-left">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="py-2 px-3">合同号/契约名</th>
                          <th className="py-2 px-3">性质</th>
                          <th className="py-2 px-3">契约本金</th>
                          <th className="py-2 px-3">履行周期</th>
                          <th className="py-2 px-3">履约保证金</th>
                          <th className="py-2 px-3">生效状态</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        {relatedContracts.map(c => (
                          <tr key={c.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-800">{c.name}</div>
                              <div className="text-[9px] font-mono text-slate-400">{c.code}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-1 rounded text-[9px] font-semibold ${
                                c.type === 'income' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {c.type === 'income' ? '收款合同' : '付款合同'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-700">{formatMoney(c.amount)}</td>
                            <td className="py-2.5 px-3 text-[10px] text-slate-500">{c.startDate} ~ {c.endDate}</td>
                            <td className="py-2.5 px-3">
                              {c.isMarginIncluded ? (
                                <span className="font-semibold text-amber-600">{formatMoney(c.marginAmount)}</span>
                              ) : '无'}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                                c.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {c.status === 'active' ? '生效履行' : '起草审定'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Segment 2: Cash Flows & Bank Details and Invoices (Two Column grid!) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Visual Sub-Panel A: Associated Real-time verified Invoices */}
                <div className="border border-slate-100 rounded-xl p-4 space-y-3 shadow-xs">
                  <h4 className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 justify-between">
                    <span className="flex items-center gap-1"><Receipt size={13} className="text-blue-500" /> 税务发票与入账抵扣 ({relatedInvoices.length})</span>
                    <span className="text-[9px] font-mono text-slate-400">发票明细</span>
                  </h4>

                  {relatedInvoices.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-[10px] bg-slate-50 rounded-lg">暂无关联的发票流对账数据</div>
                  ) : (
                    <div className="space-y-2 max-h-[180px] overflow-y-auto">
                      {relatedInvoices.map(inv => (
                        <div key={inv.id} className="p-2.5 bg-slate-50/50 rounded-lg border border-slate-100 flex justify-between items-center text-[10px]">
                          <div>
                            <div className="font-semibold text-slate-800">发票号: {inv.invoiceNumber}</div>
                            <div className="text-slate-400 text-[9px]">
                              关联契约: <span className="text-slate-600">{inv.contractName?.substring(0, 10)}...</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-700 block">{formatMoney(inv.amount)}</span>
                            <span className="text-[9px] text-slate-400">税率: {inv.taxRate}% (税额 ¥{inv.taxAmount.toLocaleString()})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-50 text-[10px] text-slate-400 flex justify-between font-mono">
                    <span>合计已开/已登记税额发票:</span>
                    <span className="font-bold text-slate-700">
                      ¥{relatedInvoices.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Visual Sub-Panel B: Deep Margin Security Records */}
                <div className="border border-slate-100 rounded-xl p-4 space-y-3 shadow-xs">
                  <h4 className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5 justify-between">
                    <span className="flex items-center gap-1"><Milestone size={13} className="text-amber-500" /> 契约履约及竞标保证金 ({relatedMargins.length})</span>
                    <span className="text-[9px] font-mono text-slate-400">保证金明细</span>
                  </h4>

                  {relatedMargins.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-[10px] bg-slate-50 rounded-lg">暂无关联质保保证金数据</div>
                  ) : (
                    <div className="space-y-2 max-h-[180px] overflow-y-auto">
                      {relatedMargins.map(m => (
                        <div key={m.id} className="p-2.5 bg-slate-50/50 rounded-lg border border-slate-100 flex justify-between items-center text-[10px]">
                          <div>
                            <div className="font-semibold text-slate-800">{m.type === 'pay' ? '应付履约保证金' : '应收履约保证金'}</div>
                            <div className="text-slate-400 text-[9px]">账期节点: {m.dueDate}</div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-amber-600 block">{formatMoney(m.amount)}</span>
                            <span className={`text-[8px] px-1 py-0.2 rounded ${
                              m.status === 'paid' || m.status === 'received' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {m.status === 'paid' ? '已缴纳对付' : m.status === 'received' ? '已收到入账' : '待缴缴或待退'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-50 text-[10px] text-slate-400 flex justify-between font-mono">
                    <span>总和担保准备金敞口:</span>
                    <span className="font-bold text-amber-600">
                      ¥{relatedMargins.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>

              {/* Segment 3: Deep Real-time Bank Flows (流水) */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                  <Landmark size={15} className="text-emerald-500" />
                  实时资金回笼/支出银行流水 ({relatedFinances.length})
                </h3>
                {relatedFinances.length === 0 ? (
                  <p className="text-center py-4 bg-slate-50 text-slate-400 text-[10px] rounded-lg border">暂无与该项目合同挂钩的银行现金流水账目</p>
                ) : (
                  <div className="overflow-x-auto border border-slate-100 rounded-lg text-[11px]">
                    <table className="min-w-full text-left">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="py-2 px-3">流水编码</th>
                          <th className="py-2 px-3">交易科目</th>
                          <th className="py-2 px-3">方向</th>
                          <th className="py-2 px-3">金值</th>
                          <th className="py-2 px-3">所属合同名</th>
                          <th className="py-2 px-3">解付银行卡</th>
                          <th className="py-2 px-3">复核状态</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        {relatedFinances.map(f => (
                          <tr key={f.id} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-mono text-[10px] text-slate-400">{f.code}</td>
                            <td className="py-2 px-3 font-semibold text-slate-700">{f.flowCategory}</td>
                            <td className="py-2 px-3">
                              <span className={`px-1 py-0.2 rounded text-[9px] font-semibold ${
                                f.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {f.type === 'income' ? '入账资金' : '拨付设备款'}
                              </span>
                            </td>
                            <td className={`py-2 px-3 font-bold ${f.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>{formatMoney(f.amount)}</td>
                            <td className="py-2 px-3 truncate max-w-[120px]" title={f.contractName}>{f.contractName}</td>
                            <td className="py-2 px-3 text-[10px] text-slate-400">{f.bankAccount}</td>
                            <td className="py-2 px-3">
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                                f.status === 'verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                {f.status === 'verified' ? '已财务核对' : '待审批复核'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {/* Strict Mathematical Sync Tally */}
                <div className="mt-3 p-3 bg-blue-50/30 rounded-lg border border-blue-50 flex justify-between items-center text-[11px] text-blue-700 font-mono">
                  <div className="flex gap-4">
                    <span>实时验证资金回笼: <strong className="text-emerald-600 font-bold">{formatMoney(totalCashCollected)}</strong></span>
                    <span>实际检验采购付出: <strong className="text-rose-500 font-bold">{formatMoney(totalCashPaidOut)}</strong></span>
                  </div>
                  <span>净业务留存: <strong className="text-blue-600 font-bold">{formatMoney(totalCashCollected - totalCashPaidOut)}</strong></span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* MODAL:立项登记 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 text-xs text-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">立项设立申请底册</h3>
            {errorMsg && <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded">{errorMsg}</div>}
            
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">工程/项目要素全称 *</label>
                  <input required type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="如:[子] xxx平台可视化渲染" className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">项目性质 *</label>
                  <select required value={formType} onChange={e => setFormType(e.target.value as any)} className="w-full p-1.5 border border-slate-200 rounded">
                    <option value="parent">父项目群 (顶级框架项)</option>
                    <option value="child">子节点项目 (挂接合同流水)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {formType === 'child' && (
                  <div>
                    <label className="block text-slate-400 mb-1">归属之顶级父项目 *</label>
                    <select required value={formParentId} onChange={e => setFormParentId(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded text-slate-700">
                      <option value="">-- 请选择上游父项目大盘 --</option>
                      {projects.filter(p => p.type === 'parent').map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={formType === 'parent' ? 'col-span-2' : ''}>
                  <label className="block text-slate-400 mb-1">合作商/建设业主客户 *</label>
                  <select required value={formCustomerId} onChange={e => setFormCustomerId(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded text-slate-700">
                    <option value="">-- 请选择往来客商账底 --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">项目立项状态 *</label>
                  <select required value={formStatus} onChange={e => setFormStatus(e.target.value as any)} className="w-full p-1.5 border border-slate-200 rounded text-slate-700">
                    <option value="planning">筹划备论</option>
                    <option value="executing">正式施工执行</option>
                    <option value="completed">验收合格结案</option>
                    <option value="suspended">中止中断封存</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">项目群责任主管 *</label>
                  <input required type="text" value={formManager} onChange={e => setFormManager(e.target.value)} placeholder="主管姓名" className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">财务核准总预算 (CNY) *</label>
                  <input required type="number" min={0} value={formBudget} onChange={e => setFormBudget(Number(e.target.value))} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">施工启动日期 *</label>
                  <input required type="date" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">拟定竣工期限 *</label>
                  <input required type="date" value={formEndDate} onChange={e => setFormEndDate(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">首期工程进度 %</label>
                  <input type="number" min={0} max={100} value={formProgress} onChange={e => setFormProgress(Number(e.target.value))} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">工程立项目标及任务说明</label>
                <textarea rows={2} value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 bg-slate-100 rounded text-slate-600">取消</button>
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">审核立项</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: 要素信息修订 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 text-xs text-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">修订立要素及进展比例</h3>
            {errorMsg && <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded">{errorMsg}</div>}
            
            <form onSubmit={handleUpdate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">项目全称 *</label>
                  <input required type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">项目大类属性 *</label>
                  <select required value={formType} onChange={e => setFormType(e.target.value as any)} className="w-full p-1.5 border border-slate-200 rounded">
                    <option value="parent">父项目群</option>
                    <option value="child">可挂合同子目</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {formType === 'child' && (
                  <div>
                    <label className="block text-slate-400 mb-1">归属父代项目 *</label>
                    <select required value={formParentId} onChange={e => setFormParentId(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded text-slate-700">
                      {projects.filter(p => p.type === 'parent').map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={formType === 'parent' ? 'col-span-2' : ''}>
                  <label className="block text-slate-400 mb-1">客商/建设业主客户 *</label>
                  <select required value={formCustomerId} onChange={e => setFormCustomerId(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded text-slate-700">
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">立项业务状态 *</label>
                  <select required value={formStatus} onChange={e => setFormStatus(e.target.value as any)} className="w-full p-1.5 border border-slate-200 rounded text-slate-700">
                    <option value="planning">筹备阶段</option>
                    <option value="executing">正式施工执行</option>
                    <option value="completed">合格收尾</option>
                    <option value="suspended">搁置中止</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">项目群责任主管 *</label>
                  <input required type="text" value={formManager} onChange={e => setFormManager(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">总预算底额 (¥) *</label>
                  <input required type="number" min={0} value={formBudget} onChange={e => setFormBudget(Number(e.target.value))} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">立项开工期 *</label>
                  <input required type="date" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">预估竣工限期 *</label>
                  <input required type="date" value={formEndDate} onChange={e => setFormEndDate(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">执行深度比例 % *</label>
                  <input required type="number" min={0} max={100} value={formProgress} onChange={e => setFormProgress(Number(e.target.value))} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">目标及内容备注</label>
                <textarea rows={2} value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-3 py-1.5 bg-slate-100 rounded text-slate-600">取消</button>
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">确认更订</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
