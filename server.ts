import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { User, UserRole, UserPermission } from './src/types';

const app = express();
const PORT = 3000;

// Body parser middleware
app.use(express.json());

// Helper to retrieve the acting user from request headers
// Pass a header X-User-Id to simulate fine-grained permissions easily
function getActingUser(req: express.Request): User {
  const userId = (req.headers['x-user-id'] as string) || 'usr-admin';
  const user = db.getUserById(userId);
  if (!user || user.status === 'inactive') {
    // Fail-safe to admin
    return db.getUserById('usr-admin')!;
  }
  return user;
}

// Permission checking helper
function checkPermission(module: string, action: 'read' | 'create' | 'edit' | 'delete' | 'approve') {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const actor = getActingUser(req);
    
    // Admin is omnipresent
    if (actor.role === 'admin') {
      return next();
    }

    const perm = actor.permissions.find(p => p.module === module);
    if (!perm) {
      db.log(actor.id, actor.name, actor.role, module, "PERMISSION_DENIED", `非法试图访问模块 [${module}]-[${action}] 的API受控端！`, req.ip);
      return res.status(403).json({ error: `您的账户角色(${actor.name})无权读取或操作 [${module}] 模块！` });
    }

    // Check action boolean flags
    let allowed = false;
    if (action === 'read') allowed = perm.read;
    else if (action === 'create') allowed = perm.create;
    else if (action === 'edit') allowed = perm.edit;
    else if (action === 'delete') allowed = perm.delete;
    else if (action === 'approve') allowed = perm.approve || perm.edit; // fallback to edit if approve field omitted

    if (!allowed) {
      db.log(actor.id, actor.name, actor.role, module, "PERMISSION_DENIED", `拒绝了账户对 [${module}] 的 [${action}] 写操作。`, req.ip);
      return res.status(403).json({ error: `您的账户角色(${actor.name})无权执行 [${module}] 模块的[${action}]写操作！` });
    }

    next();
  };
}

// ================= API ENDPOINTS =================

// --- SYSTEM USER ROLES SWAPPING (For Interactive Simulation) ---
app.get('/api/users/profiles', (req, res) => {
  res.json(db.getUsers());
});

// --- DASHBOARD ANALYSIS REPORTS ---
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const stats = db.getDashboardStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dashboard/charts', (req, res) => {
  try {
    res.json({
      contractPerformance: db.getContractPerformance(),
      monthlyTrends: db.getFinanceMonthlyTrend()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- CUSTOMERS ---
app.get('/api/customers', checkPermission('customer', 'read'), (req, res) => {
  res.json(db.getCustomers());
});

app.post('/api/customers', checkPermission('customer', 'create'), (req, res) => {
  try {
    const actor = getActingUser(req);
    const newCust = db.createCustomer(req.body, actor);
    res.status(201).json(newCust);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/customers/:id', checkPermission('customer', 'edit'), (req, res) => {
  try {
    const actor = getActingUser(req);
    const updated = db.updateCustomer(req.params.id, req.body, actor);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/customers/:id', checkPermission('customer', 'delete'), (req, res) => {
  try {
    const actor = getActingUser(req);
    db.deleteCustomer(req.params.id, actor);
    res.json({ success: true, message: "客户删除已完成交易闭环核销。" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// --- PROJECTS ---
app.get('/api/projects', checkPermission('project', 'read'), (req, res) => {
  res.json(db.getProjects());
});

app.post('/api/projects', checkPermission('project', 'create'), (req, res) => {
  try {
    const actor = getActingUser(req);
    const newProj = db.createProject(req.body, actor);
    res.status(201).json(newProj);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/projects/:id', checkPermission('project', 'edit'), (req, res) => {
  try {
    const actor = getActingUser(req);
    const updated = db.updateProject(req.params.id, req.body, actor);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/projects/:id', checkPermission('project', 'delete'), (req, res) => {
  try {
    const actor = getActingUser(req);
    db.deleteProject(req.params.id, actor);
    res.json({ success: true, message: "项目已成功注销" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// --- CONTRACTS ---
app.get('/api/contracts', checkPermission('contract', 'read'), (req, res) => {
  res.json(db.getContracts());
});

app.post('/api/contracts', checkPermission('contract', 'create'), (req, res) => {
  try {
    const actor = getActingUser(req);
    const newCont = db.createContract(req.body, actor);
    res.status(201).json(newCont);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/contracts/:id', checkPermission('contract', 'edit'), (req, res) => {
  try {
    const actor = getActingUser(req);
    const updated = db.updateContract(req.params.id, req.body, actor);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/contracts/:id', checkPermission('contract', 'delete'), (req, res) => {
  try {
    const actor = getActingUser(req);
    db.deleteContract(req.params.id, actor);
    res.json({ success: true, message: "合同删除成功，保证金缓冲已释放。" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// --- FINANCES (流水) ---
app.get('/api/finances', checkPermission('finance', 'read'), (req, res) => {
  res.json(db.getFinances());
});

app.post('/api/finances', checkPermission('finance', 'create'), (req, res) => {
  try {
    const actor = getActingUser(req);
    const newFlow = db.createFinanceFlow(req.body, actor);
    res.status(201).json(newFlow);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/finances/:id', checkPermission('finance', 'edit'), (req, res) => {
  try {
    const actor = getActingUser(req);
    const updated = db.updateFinanceFlow(req.params.id, req.body, actor);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/finances/:id', checkPermission('finance', 'delete'), (req, res) => {
  try {
    const actor = getActingUser(req);
    db.deleteFinanceFlow(req.params.id, actor);
    res.json({ success: true, message: "流水已撤销删除" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// --- INVOICES ---
app.get('/api/invoices', checkPermission('invoice', 'read'), (req, res) => {
  res.json(db.getInvoices());
});

app.post('/api/invoices', checkPermission('invoice', 'create'), (req, res) => {
  try {
    const actor = getActingUser(req);
    const newInv = db.createInvoice(req.body, actor);
    res.status(201).json(newInv);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/invoices/:id', checkPermission('invoice', 'edit'), (req, res) => {
  try {
    const actor = getActingUser(req);
    const updated = db.updateInvoice(req.params.id, req.body, actor);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/invoices/:id', checkPermission('invoice', 'delete'), (req, res) => {
  try {
    const actor = getActingUser(req);
    db.deleteInvoice(req.params.id, actor);
    res.json({ success: true, message: "发票作废删除成功" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// --- MARGINS (保证金) ---
app.get('/api/margins', checkPermission('margin', 'read'), (req, res) => {
  res.json(db.getMargins());
});

app.post('/api/margins', checkPermission('margin', 'create'), (req, res) => {
  try {
    const actor = getActingUser(req);
    const newMargin = db.createMargin(req.body, actor);
    res.status(201).json(newMargin);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/margins/:id', checkPermission('margin', 'edit'), (req, res) => {
  try {
    const actor = getActingUser(req);
    const updated = db.updateMargin(req.params.id, req.body, actor);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/margins/:id', checkPermission('margin', 'delete'), (req, res) => {
  try {
    const actor = getActingUser(req);
    db.deleteMargin(req.params.id, actor);
    res.json({ success: true, message: "保证金删除成功" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// --- APPROVAL WORKFLOWS ---
app.get('/api/approvals', checkPermission('approval', 'read'), (req, res) => {
  res.json(db.getApprovals());
});

app.post('/api/approvals', checkPermission('approval', 'create'), (req, res) => {
  try {
    const actor = getActingUser(req);
    const newAppr = db.createApproval({
      ...req.body,
      applicantId: actor.id,
      applicantName: actor.name,
      status: 'pending'
    }, actor);
    res.status(201).json(newAppr);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/approvals/:id/action', checkPermission('approval', 'approve'), (req, res) => {
  try {
    const auditor = getActingUser(req);
    const { status, remark } = req.body;
    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ error: "决策属性必须为 approved (通过) 或者 rejected (驳回)！" });
    }
    const updated = db.processApproval(req.params.id, status, remark || "", auditor);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// --- USERS MANAGEMENT (Admin Panel) ---
app.get('/api/users', checkPermission('user', 'read'), (req, res) => {
  res.json(db.getUsers());
});

app.post('/api/users', checkPermission('user', 'create'), (req, res) => {
  try {
    const actor = getActingUser(req);
    const newUser = db.createUser(req.body, actor);
    res.status(201).json(newUser);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/users/:id', checkPermission('user', 'edit'), (req, res) => {
  try {
    const actor = getActingUser(req);
    const updated = db.updateUser(req.params.id, req.body, actor);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/users/:id', checkPermission('user', 'delete'), (req, res) => {
  try {
    const actor = getActingUser(req);
    db.deleteUser(req.params.id, actor);
    res.json({ success: true, message: "用户已删除" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// --- AUDIT LOGS ---
app.get('/api/audit_logs', checkPermission('log', 'read'), (req, res) => {
  res.json(db.getAuditLogs());
});


// ================= VITE OR STATIC SERVING =================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running at HTTP://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
