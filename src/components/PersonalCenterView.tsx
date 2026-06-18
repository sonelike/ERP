import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Mail, Lock, Landmark, Calendar, ShieldCheck, UserCheck, HelpCircle } from 'lucide-react';
import { User, AuditLog } from '../types';

interface PersonalCenterViewProps {
  currentUser: User;
}

export default function PersonalCenterView({ currentUser }: PersonalCenterViewProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    fetchLogs();
  }, [currentUser]);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs', { headers: { 'X-User-Id': currentUser.id } });
      const data = await res.json();
      if (Array.isArray(data)) {
        // filter by current logged in user name
        const userLogs = data.filter(l => l.userId === currentUser.id || l.operator === currentUser.name);
        setLogs(userLogs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatRole = (role: string) => {
    switch (role) {
      case 'admin': return '超级总经理管理员 (General Manager)';
      case 'project_manager': return '资深项目群主管 (Project Director)';
      case 'financial_manager': return '资深财务总监 (Chief Financial Officer)';
      case 'guest': return '外部多变审计访客 (Audit Inspector)';
      default: return role;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-slate-700">
      
      {/* Profile summary card */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-4 flex flex-col items-center text-center">
        <div className="relative mt-2">
          <img 
            src={currentUser.avatar} 
            alt="avat" 
            className="w-20 h-20 rounded-full border-4 border-slate-50 shadow-md object-cover" 
            referrerPolicy="no-referrer"
          />
          <span className="absolute bottom-1 right-1 bg-emerald-500 w-4.5 h-4.5 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold" title="在线授信激活">
            ✓
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-slate-800">{currentUser.name}</h3>
          <span className="text-[10px] bg-slate-100 font-mono px-2 py-0.5 rounded text-slate-500">
            ID: {currentUser.id}
          </span>
        </div>

        <div className="w-full pt-4 border-t border-slate-50 text-left space-y-3 text-[11px]">
          <div>
            <span className="text-slate-400 block">系统岗位职级:</span>
            <span className="font-bold text-slate-700 flex items-center gap-1 mt-0.5">
              <Shield size={12} className="text-blue-500" />
              {formatRole(currentUser.role)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">隶属部室:</span>
            <span className="font-semibold text-slate-700 block mt-0.5">{currentUser.department || '综合行政组'}</span>
          </div>
          <div>
            <span className="text-slate-400 block">登录工作信箱:</span>
            <span className="font-semibold text-slate-600 block mt-0.5 flex items-center gap-1">
              <Mail size={12} className="text-slate-400" />
              {currentUser.email}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">数字公钥指纹 (安全凭据):</span>
            <span className="font-mono text-[9px] text-slate-400 block mt-0.5 break-all">
              sha256:d8a1ef96b3a2eaac77cbfde377fde{currentUser.id}
            </span>
          </div>
        </div>

        <div className="w-full p-3 bg-indigo-50/50 rounded-xl text-left border border-indigo-100/30 text-[10.5px] leading-relaxed text-indigo-800 mt-2">
          <h5 className="font-bold mb-1 flex items-center gap-1 text-[11px]">
            <Sparkles size={12} className="text-indigo-600" /> 经办业务提醒
          </h5>
          根据安防与ACID一致审计，您作为 {currentUser.name}，目前具有对本系统的相应只读查阅及流程呈报放行职责。
        </div>
      </div>

      {/* Audit logs of active user */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <UserCheck size={16} className="text-emerald-500" />
            个人经办审计跟踪与操作日志
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            系统安全复核。展示您在本系统下触发的所有写、签核、驳回、修改等对数据库有实质变动的记录，作为内审合规依据。
          </p>
        </div>

        <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
          {logs.length === 0 ? (
            <div className="text-center py-16 text-slate-400 flex flex-col items-center justify-center gap-2">
              <HelpCircle size={32} className="text-slate-300" />
              <span>本系统在此会话中尚未被您触发实质审计修改。</span>
            </div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="p-3 bg-slate-50 border border-slate-100/60 rounded-xl space-y-1.5 font-mono text-[10px]">
                <div className="flex justify-between text-slate-400">
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded text-[9px]">{log.action.toUpperCase()}</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-slate-700 font-sans font-semibold leading-normal">{log.details}</div>
                <div className="text-[9px] text-slate-400/90 flex justify-between">
                  <span>客户端IP: 127.0.0.1 (沙箱私网内网)</span>
                  <span>事务哈希: {log.id}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
