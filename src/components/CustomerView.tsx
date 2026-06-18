import React, { useState, useEffect } from 'react';
import { Plus, Table, Edit3, Trash2, Search, Briefcase, FileText, CheckCircle } from 'lucide-react';
import { Customer, Project, Contract, User } from '../types';

interface CustomerViewProps {
  currentUser: User;
  onRefresh: () => void;
}

export default function CustomerView({ currentUser, onRefresh }: CustomerViewProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [formName, setFormName] = useState('');
  const [formIndustry, setFormIndustry] = useState('');
  const [formContactName, setFormContactName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formTaxNumber, setFormTaxNumber] = useState('');
  const [formBankName, setFormBankName] = useState('');
  const [formBankAccount, setFormBankAccount] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [editId, setEditId] = useState('');

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const custRes = await fetch('/api/customers', { headers: { 'X-User-Id': currentUser.id } });
      const custs = await custRes.json();
      setCustomers(Array.isArray(custs) ? custs : []);

      const projRes = await fetch('/api/projects', { headers: { 'X-User-Id': currentUser.id } });
      const projs = await projRes.json();
      setProjects(Array.isArray(projs) ? projs : []);

      const contRes = await fetch('/api/contracts', { headers: { 'X-User-Id': currentUser.id } });
      const conts = await contRes.json();
      setContracts(Array.isArray(conts) ? conts : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id
        },
        body: JSON.stringify({
          name: formName,
          industry: formIndustry,
          contactName: formContactName,
          phone: formPhone,
          email: formEmail,
          address: formAddress,
          taxNumber: formTaxNumber,
          bankName: formBankName,
          bankAccount: formBankAccount,
          description: formDesc,
          creatorId: currentUser.id
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "创建失败");
      }

      resetForm();
      setShowAddModal(false);
      fetchData();
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleEditClick = (cust: Customer) => {
    setEditId(cust.id);
    setFormName(cust.name);
    setFormIndustry(cust.industry || '');
    setFormContactName(cust.contactName);
    setFormPhone(cust.phone);
    setFormEmail(cust.email);
    setFormAddress(cust.address || '');
    setFormTaxNumber(cust.taxNumber || '');
    setFormBankName(cust.bankName || '');
    setFormBankAccount(cust.bankAccount || '');
    setFormDesc(cust.description || '');
    setErrorMsg('');
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch(`/api/customers/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id
        },
        body: JSON.stringify({
          name: formName,
          industry: formIndustry,
          contactName: formContactName,
          phone: formPhone,
          email: formEmail,
          address: formAddress,
          taxNumber: formTaxNumber,
          bankName: formBankName,
          bankAccount: formBankAccount,
          description: formDesc
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "修改失败");
      }

      resetForm();
      setShowEditModal(false);
      fetchData();
      onRefresh();
      if (selectedCust && selectedCust.id === editId) {
        const updatedCust = customers.find(c => c.id === editId);
        if (updatedCust) {
          setSelectedCust({ ...updatedCust, name: formName, industry: formIndustry, contactName: formContactName });
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("确定要注销并终结该客商的档案记录吗？")) return;
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': currentUser.id }
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "删除由于外键关系受限终止。");
        return;
      }
      if (selectedCust?.id === id) {
        setSelectedCust(null);
      }
      fetchData();
      onRefresh();
    } catch (e: any) {
      alert("操作失败：" + e.message);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormIndustry('');
    setFormContactName('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormTaxNumber('');
    setFormBankName('');
    setFormBankAccount('');
    setFormDesc('');
    setEditId('');
    setErrorMsg('');
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Relational resolution relative to the selected customer
  const custProjects = projects.filter(p => p.customerId === selectedCust?.id);
  const custContracts = contracts.filter(c => c.customerId === selectedCust?.id);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Customers List Column */}
      <div className="xl:col-span-2 bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-800">合作商与客商台账 ({filteredCustomers.length})</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">针对企业的所有上游采购供应商、下游总包承建业主进行统一资信及结算记录。</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1 transition-colors"
          >
            <Plus size={14} /> 登记客商资信
          </button>
        </div>

        {/* Searching tool */}
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-slate-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="搜索客商名、统配码或联系人..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Clients Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="min-w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">商户编码</th>
                <th className="py-2.5 px-3">客商名称</th>
                <th className="py-2.5 px-3">主联系人</th>
                <th className="py-2.5 px-3">行业属性</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">暂无往来商户数据</td>
                </tr>
              ) : (
                filteredCustomers.map(cust => (
                  <tr 
                    key={cust.id} 
                    onClick={() => setSelectedCust(cust)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedCust?.id === cust.id ? 'bg-blue-50/50' : ''}`}
                  >
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{cust.code}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{cust.name}</td>
                    <td className="py-3 px-3">
                      <div>{cust.contactName}</div>
                      <div className="text-[10px] text-slate-400">{cust.phone}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100/50">
                        {cust.industry || '综合领域'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => handleEditClick(cust)}
                        className="p-1 text-slate-500 hover:text-blue-500 hover:bg-slate-100 rounded"
                        title="编辑资信"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cust.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded"
                        title="删除客商"
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
      </div>

      {/* Details sidebar column */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-2.5">
          <Briefcase size={16} className="text-indigo-500" />
          客商契约与项目穿透视图
        </h3>

        {!selectedCust ? (
          <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <Table size={24} className="text-slate-300" />
            <span>请在左侧列表中选择商户，探索其名下的父子层级项目和全套收付款合同。</span>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="p-3.5 bg-slate-50/60 rounded-xl space-y-2">
              <h4 className="font-bold text-slate-800 text-sm leading-snug">{selectedCust.name}</h4>
              <p className="text-[10px] text-slate-500">{selectedCust.description || '暂无详细描述描述。'}</p>
              
              <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block">税号/信用码:</span>
                  <span className="font-mono text-slate-700">{selectedCust.taxNumber || '未登记'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">合作商等级:</span>
                  <span className="font-medium text-emerald-600 flex items-center gap-0.5"><CheckCircle size={10} /> 优质资信</span>
                </div>
              </div>

              {selectedCust.bankAccount && (
                <div className="text-[10px] pt-1.5 border-t border-slate-100">
                  <span className="text-slate-400 block">结算行及账户:</span>
                  <span className="text-slate-600 block leading-tight">{selectedCust.bankName}</span>
                  <span className="font-mono text-slate-700 block mt-0.5">{selectedCust.bankAccount}</span>
                </div>
              )}
            </div>

            {/* Core Relational: Projects list */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h5 className="font-bold text-slate-700 flex items-center gap-1">
                  <Briefcase size={13} className="text-blue-500" />
                  承办的项目 ({custProjects.length})
                </h5>
              </div>

              {custProjects.length === 0 ? (
                <div className="p-3 bg-slate-50 text-center text-slate-400 text-[10px] rounded-lg">
                  当前尚无项目与之挂钩绑定。
                </div>
              ) : (
                <div className="space-y-1.5">
                  {custProjects.map(p => (
                    <div key={p.id} className="p-2.5 bg-slate-50 border border-slate-100/50 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-slate-700">{p.name}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">经理: {p.manager} | 预算: ¥{p.budget.toLocaleString()}</div>
                      </div>
                      <span className={`text-[8px] font-medium px-1.5 py-0.5 rounded shrink-0 ${
                        p.status === 'executing' ? 'bg-indigo-50 text-indigo-600' :
                        p.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.status === 'executing' ? '施工中' : p.status === 'completed' ? '已收尾' : '筹划中'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Core Relational: Contracts list */}
            <div>
              <h5 className="font-bold text-slate-700 flex items-center gap-1 mb-2">
                <FileText size={13} className="text-emerald-500" />
                签署的合同 ({custContracts.length})
              </h5>

              {custContracts.length === 0 ? (
                <div className="p-3 bg-slate-50 text-center text-slate-400 text-[10px] rounded-lg">
                  暂无合同单据。
                </div>
              ) : (
                <div className="space-y-1.5">
                  {custContracts.map(c => (
                    <div key={c.id} className="p-2.5 bg-slate-50 border border-slate-100/50 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-slate-700">{c.name}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">
                          类型: <span className={c.type === 'income' ? 'text-emerald-600 font-medium' : 'text-rose-500 font-medium'}>
                            {c.type === 'income' ? '收款合同' : '付款采购分包'}
                          </span> | 金值: ¥{c.amount.toLocaleString()}
                        </div>
                      </div>
                      <span className={`text-[8px] font-medium px-1.5 py-0.5 rounded shrink-0 ${
                        c.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {c.status === 'active' ? '履行中' : '起草审定'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Register Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 text-xs text-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">登记往来客商</h3>
            {errorMsg && <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded">{errorMsg}</div>}
            
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">客商全称 *</label>
                  <input required type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">主要经营行业</label>
                  <input type="text" value={formIndustry} onChange={e => setFormIndustry(e.target.value)} placeholder="如: 重工、建筑、IT外包" className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">主要联系人 *</label>
                  <input required type="text" value={formContactName} onChange={e => setFormContactName(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">联系电话 *</label>
                  <input required type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">电子邮箱 *</label>
                  <input required type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-slate-400 mb-1">纳税人识别号</label>
                  <input type="text" value={formTaxNumber} onChange={e => setFormTaxNumber(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div className="col-span-1">
                  <label className="block text-slate-400 mb-1">基本开户银行</label>
                  <input type="text" value={formBankName} onChange={e => setFormBankName(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div className="col-span-1">
                  <label className="block text-slate-400 mb-1">结算银行账号</label>
                  <input type="text" value={formBankAccount} onChange={e => setFormBankAccount(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">工商注册地址</label>
                <input type="text" value={formAddress} onChange={e => setFormAddress(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">备注/资信评估说明</label>
                <textarea rows={2} value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 bg-slate-100 rounded text-slate-600">取消</button>
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">提交登记</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 text-xs text-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">修订客商要素信息</h3>
            {errorMsg && <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded">{errorMsg}</div>}
            
            <form onSubmit={handleUpdate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">客商全称 *</label>
                  <input required type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">主要经营行业</label>
                  <input type="text" value={formIndustry} onChange={e => setFormIndustry(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">主要联系人 *</label>
                  <input required type="text" value={formContactName} onChange={e => setFormContactName(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">联系电话 *</label>
                  <input required type="text" value={formPhone} onChange={e => setFormPhone(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">电子邮箱 *</label>
                  <input required type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">纳税人识别码</label>
                  <input type="text" value={formTaxNumber} onChange={e => setFormTaxNumber(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">基本开户银行</label>
                  <input type="text" value={formBankName} onChange={e => setFormBankName(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">结算银行账号</label>
                  <input type="text" value={formBankAccount} onChange={e => setFormBankAccount(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">工商注册地址</label>
                <input type="text" value={formAddress} onChange={e => setFormAddress(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">备注/资信评估说明</label>
                <textarea rows={2} value={formDesc} onChange={e => setFormDesc(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-3 py-1.5 bg-slate-100 rounded text-slate-600">取消</button>
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">保存修订</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
