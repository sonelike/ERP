import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserPlus, ShieldAlert, BadgeCheck, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import { User, UserRole, UserPermission } from '../types';

interface UserViewProps {
  currentUser: User;
  onRefresh: () => void;
}

export default function UserView({ currentUser, onRefresh }: UserViewProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [formUsername, setFormUsername] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('guest');
  const [formDept, setFormDept] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');
  const [editId, setEditId] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', { headers: { 'X-User-Id': currentUser.id } });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      // Default basic permission layout
      const defaultPerms: UserPermission[] = [
        { module: "dashboard", read: true, create: false, edit: false, delete: false },
        { module: "customer", read: true, create: true, edit: false, delete: false },
        { module: "project", read: true, create: true, edit: false, delete: false },
        { module: "contract", read: true, create: false, edit: false, delete: false },
        { module: "finance", read: false, create: false, edit: false, delete: false },
        { module: "invoice", read: false, create: false, edit: false, delete: false },
        { module: "margin", read: false, create: false, edit: false, delete: false },
        { module: "approval", read: true, create: false, edit: false, delete: false },
        { module: "user", read: false, create: false, edit: false, delete: false },
        { module: "permission", read: false, create: false, edit: false, delete: false },
        { module: "log", read: false, create: false, edit: false, delete: false }
      ];

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id
        },
        body: JSON.stringify({
          username: formUsername,
          name: formName,
          email: formEmail,
          role: formRole,
          department: formDept,
          status: formStatus,
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80", // generic avatar
          permissions: defaultPerms
        })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "创建账户立案挫败");
      }

      setShowAddModal(false);
      resetForm();
      fetchUsers();
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleEditClick = (u: User) => {
    setEditId(u.id);
    setFormUsername(u.username);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormRole(u.role);
    setFormDept(u.department || '');
    setFormStatus(u.status);
    setErrorMsg('');
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch(`/api/users/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id
        },
        body: JSON.stringify({
          username: formUsername,
          name: formName,
          email: formEmail,
          role: formRole,
          department: formDept,
          status: formStatus
        })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "修改失败！");
      }

      setShowEditModal(false);
      resetForm();
      fetchUsers();
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("确定要销毁注销该用户的系统登录主体钥匙吗？此动作不可转还！")) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': currentUser.id }
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "注销失败！");
        return;
      }
      fetchUsers();
      onRefresh();
    } catch (e: any) {
      alert("通信失败");
    }
  };

  const resetForm = () => {
    setFormUsername('');
    setFormName('');
    setFormEmail('');
    setFormRole('guest');
    setFormDept('');
    setFormStatus('active');
    setErrorMsg('');
    setEditId('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4 text-xs text-slate-700">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
            <Users size={18} className="text-blue-500" />
            企业组织架构与用户管理 (人员主体)
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            管理具有系统登录权限的雇员主体与行政隶属组。在此创设的用户可直接调入底盘流程、业务签章、及顶格模拟控制中。
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          <UserPlus size={14} /> 注册新雇员
        </button>
      </div>

      {/* Info Warning banner */}
      <div className="p-3 bg-blue-50/40 rounded-lg border border-blue-100 flex gap-2 text-[10.5px] leading-relaxed text-blue-700 font-mono">
        <ShieldAlert size={14} className="shrink-0 mt-0.5" />
        <span>系统左上方（侧边栏顶部）提供了快捷模拟切换用户中枢。您在此注册、注销、修改的账户角色会实时映射该切换面板，便于迅速下钻演练林建华、秦晓雅、张立国等不同角色的限度审计权！</span>
      </div>

      {/* User listing card grid or table */}
      <div className="overflow-x-auto border border-slate-100 rounded-lg">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
            <tr>
              <th className="py-2.5 px-3">姓名拼配</th>
              <th className="py-2.5 px-3">系统登录账密(唯一码)</th>
              <th className="py-2.5 px-3">邮箱</th>
              <th className="py-2.5 px-3">隶属行政部室</th>
              <th className="py-2.5 px-3">系统角色组</th>
              <th className="py-2.5 px-3">账户登录状态</th>
              <th className="py-2.5 px-3 text-right">更改要素</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-600">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-3 font-bold text-slate-800 flex items-center gap-2">
                  <img src={u.avatar} alt="head" className="w-6 h-6 rounded-full border shadow-xs" referrerPolicy="no-referrer" />
                  <span>{u.name}</span>
                </td>
                <td className="py-3 px-3 font-mono">{u.username}</td>
                <td className="py-3 px-3">{u.email}</td>
                <td className="py-3 px-3 font-semibold text-slate-600">{u.department || '综合行政组'}</td>
                <td className="py-3 px-3">
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
                    u.role === 'admin' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                    u.role === 'financial_manager' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    u.role === 'project_manager' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {u.role === 'admin' ? '超级主控管理员' : u.role === 'financial_manager' ? '财务总监CFO' : u.role === 'project_manager' ? '项目群主主管PM' : '访客只读'}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    u.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {u.status === 'active' ? '● 授钥可登录' : '○ 已冻结解付'}
                  </span>
                </td>
                <td className="py-3 px-3 text-right space-x-1" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => handleEditClick(u)}
                    className="p-1 hover:text-blue-600 hover:bg-slate-50 rounded"
                    title="修改要素"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="p-1 hover:text-rose-500 hover:bg-slate-50 rounded"
                    title="注销雇员"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL: 添加用户 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-xs text-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">创设全新登录雇员档案</h3>
            {errorMsg && <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded">{errorMsg}</div>}
            
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">统一身份登录户名 *</label>
                <input required type="text" placeholder="例: pm_wang..." value={formUsername} onChange={e => setFormUsername(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">中文本名 *</label>
                <input required type="text" placeholder="例: 王大卫..." value={formName} onChange={e => setFormName(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">工作邮箱 *</label>
                <input required type="email" placeholder="wang@enterprise.com" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">隶属部门 *</label>
                  <input required type="text" placeholder="研发部 / 审计部" value={formDept} onChange={e => setFormDept(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">系统配定角色 *</label>
                  <select required value={formRole} onChange={e => setFormRole(e.target.value as any)} className="w-full p-1.5 border border-slate-200 rounded text-slate-700">
                    <option value="admin">总经理 (特权全资)</option>
                    <option value="project_manager">项目主管 (立项及客商要素权)</option>
                    <option value="financial_manager">财务经理 (记账核税发票保证金权)</option>
                    <option value="guest">只读访客 (无任何写及流程判定权)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">登录状态授权 *</label>
                <select required value={formStatus} onChange={e => setFormStatus(e.target.value as any)} className="w-full p-1.5 border border-slate-200 rounded text-slate-700">
                  <option value="active">正常允许授权登录</option>
                  <option value="inactive">封禁冻结凭证</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 bg-slate-100 rounded text-slate-600">取消</button>
                <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">完成注册</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: 编辑项目要素 */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-xs text-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">更更订雇员资料大类</h3>
            {errorMsg && <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded">{errorMsg}</div>}
            
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">特配登录代码 *</label>
                <input required type="text" value={formUsername} onChange={e => setFormUsername(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded bg-slate-50" disabled />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">中文本名 *</label>
                <input required type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">工作邮箱 *</label>
                <input required type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">行政部门 *</label>
                  <input required type="text" value={formDept} onChange={e => setFormDept(e.target.value)} className="w-full p-1.5 border border-slate-200 rounded" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">系统角色 *</label>
                  <select required value={formRole} onChange={e => setFormRole(e.target.value as any)} className="w-full p-1.5 border border-slate-200 rounded text-slate-700">
                    <option value="admin">超级主控总管理员</option>
                    <option value="project_manager">项目工程主管</option>
                    <option value="financial_manager">财务结算经理</option>
                    <option value="guest">只读访客</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">账户登录状态 *</label>
                <select required value={formStatus} onChange={e => setFormStatus(e.target.value as any)} className="w-full p-1.5 border border-slate-200 rounded text-slate-700">
                  <option value="active">授钥正常登录</option>
                  <option value="inactive">彻底中止解付冻结</option>
                </select>
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
