import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, BadgeCheck, Save, RefreshCw, Layers, CheckSquare, Square } from 'lucide-react';
import { User, UserPermission } from '../types';

interface PermissionViewProps {
  currentUser: User;
  onRefresh: () => void;
}

export default function PermissionView({ currentUser, onRefresh }: PermissionViewProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'err'; text: string } | null>(null);

  // Available functional modules
  const moduleLabels: Record<string, string> = {
    dashboard: '仪表盘大看板 (Cockpit)',
    customer: '组织客商资信簿 (Customers)',
    project: '父子项目多分支 (Projects)',
    contract: '双边履行合同契约 (Contracts)',
    finance: '银行公账收支流水 (Finances)',
    invoice: '税务增值专用发票 (Invoices)',
    margin: '履约保证金跟踪 (Guarantees)',
    approval: '裁决放行工作台 (Approvals)',
    user: '雇员主体与行政组 (Users)',
    permission: '安防细颗粒矩阵 (Permissions)',
    log: '操作安全审计日志 (Audit Logs)'
  };

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', { headers: { 'X-User-Id': currentUser.id } });
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
        // Default select the first user
        if (data.length > 0 && !selectedUserId) {
          const first = data[0];
          setSelectedUserId(first.id);
          setPermissions(first.permissions || []);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUserSelect = (id: string) => {
    setSelectedUserId(id);
    const u = users.find(x => x.id === id);
    if (u) {
      setPermissions(u.permissions || []);
    }
    setMsg(null);
  };

  const handleToggle = (moduleName: string, action: 'read' | 'create' | 'edit' | 'delete') => {
    setPermissions(prev => 
      prev.map(p => {
        if (p.module === moduleName) {
          return {
            ...p,
            [action]: !p[action]
          };
        }
        return p;
      })
    );
  };

  const handleSave = async () => {
    if (currentUser.role === 'guest') {
      alert("只读访客无权修改系统安全模块！");
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/users/${selectedUserId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id
        },
        body: JSON.stringify({ permissions })
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "配置修改受限");
      }

      setMsg({ type: 'success', text: '细粒度安全访问权限矩阵(ACL)更新成功！配置已入库锁定。' });
      fetchUsers();
      onRefresh();
    } catch (e: any) {
      setMsg({ type: 'err', text: e.message || '保存失败' });
    } finally {
      setSaving(false);
    }
  };

  const targetUserObj = users.find(u => u.id === selectedUserId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700">
      
      {/* Users selection checklist column */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800">系统受控账号组</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">请选中下方人员载入其对齐的岗位ACL安全矩阵。</p>
        </div>

        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {users.map(u => {
            const isSelected = u.id === selectedUserId;
            return (
              <div
                key={u.id}
                onClick={() => handleUserSelect(u.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50/20 shadow-xs' 
                    : 'border-slate-100 bg-slate-50/40 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <img src={u.avatar} alt="avatar" className="w-6 h-6 rounded-full border" referrerPolicy="no-referrer" />
                  <div>
                    <div className="font-bold text-slate-800">{u.name}</div>
                    <div className="text-[8px] font-mono text-slate-400">{u.role.toUpperCase()}</div>
                  </div>
                </div>
                {u.role === 'admin' && (
                  <span className="text-[8px] px-1 py-0.2 bg-blue-100 text-blue-700 rounded font-semibold">
                    不受控
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Permissions edit schema grid */}
      <div className="md:col-span-2 bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <Shield size={18} className="text-indigo-500" />
              ACL 细粒度控制机制矩阵
            </h3>
            {targetUserObj && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                当前正在更订: <strong className="text-slate-600">{targetUserObj.name}</strong> 的各个业务模块的精细阻断权限。
              </p>
            )}
          </div>
          
          <button
            onClick={handleSave}
            disabled={saving || !selectedUserId}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1 transition-colors hover:cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            <Save size={13} /> {saving ? '更新入库...' : '保存受控制矩阵'}
          </button>
        </div>

        {msg && (
          <div className={`p-2.5 rounded border text-[11px] font-mono flex items-center gap-1.5 ${
            msg.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
          }`}>
            <ShieldAlert size={14} />
            <span>{msg.text}</span>
          </div>
        )}

        {targetUserObj?.role === 'admin' && (
          <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100 text-[10.5px] leading-relaxed text-amber-800 font-mono">
            <strong>安全提调警告：</strong>该雇员属于<b>超级总经理管理员(Admin)</b>特权主体。系统核心安全中枢对总经理采取硬编码放行，拥有无阻断读写删及复核权利。此时即便调整下方各行状态也将无条件放行。
          </div>
        )}

        {/* Matrix grid block */}
        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-bold">
              <tr>
                <th className="py-2.5 px-3">受控实体模块</th>
                <th className="py-2.5 px-3 text-center">可读 (Read)</th>
                <th className="py-2.5 px-3 text-center">创建 (Create)</th>
                <th className="py-2.5 px-3 text-center">修改 (Edit)</th>
                <th className="py-2.5 px-3 text-center">删除/审结 (Delete)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-600">
              {Object.keys(moduleLabels).map(modKey => {
                const userPerm = permissions.find(p => p.module === modKey) || {
                  module: modKey, read: false, create: false, edit: false, delete: false
                };

                return (
                  <tr key={modKey} className="hover:bg-slate-50/40">
                    <td className="py-3 px-3 font-semibold text-slate-800 bg-slate-50/10">
                      {moduleLabels[modKey]}
                    </td>
                    
                    {/* Read toggles */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(modKey, 'read')}
                        className={`p-1.5 rounded transition ${userPerm.read ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-300 hover:bg-slate-100'}`}
                      >
                        {userPerm.read ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </td>

                    {/* Create toggles */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(modKey, 'create')}
                        className={`p-1.5 rounded transition ${userPerm.create ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-300 hover:bg-slate-100'}`}
                      >
                        {userPerm.create ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </td>

                    {/* Edit toggles */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(modKey, 'edit')}
                        className={`p-1.5 rounded transition ${userPerm.edit ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-300 hover:bg-slate-100'}`}
                      >
                        {userPerm.edit ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </td>

                    {/* Delete toggles */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(modKey, 'delete')}
                        className={`p-1.5 rounded transition ${userPerm.delete ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-300 hover:bg-slate-100'}`}
                      >
                        {userPerm.delete ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
