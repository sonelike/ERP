import fs from 'fs';
import path from 'path';
import {
  User,
  Customer,
  Project,
  Contract,
  FinanceFlow,
  Invoice,
  Margin,
  Approval,
  AuditLog,
  DashboardStats
} from '../src/types';

const DB_FILE = path.join(process.cwd(), 'data', 'database.json');

interface Schema {
  users: User[];
  customers: Customer[];
  projects: Project[];
  contracts: Contract[];
  finances: FinanceFlow[];
  invoices: Invoice[];
  margins: Margin[];
  approvals: Approval[];
  audit_logs: AuditLog[];
}

// Initial seed data to demonstrate strong relationships out-of-the-box
const INITIAL_DB: Schema = {
  users: [
    {
      id: "usr-admin",
      username: "admin",
      name: "张立国",
      email: "admin@enterprise.com",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      department: "总经理室",
      status: "active",
      permissions: [
        { module: "dashboard", read: true, create: true, edit: true, delete: true },
        { module: "customer", read: true, create: true, edit: true, delete: true },
        { module: "project", read: true, create: true, edit: true, delete: true },
        { module: "contract", read: true, create: true, edit: true, delete: true },
        { module: "finance", read: true, create: true, edit: true, delete: true },
        { module: "invoice", read: true, create: true, edit: true, delete: true },
        { module: "margin", read: true, create: true, edit: true, delete: true },
        { module: "approval", read: true, create: true, edit: true, delete: true },
        { module: "user", read: true, create: true, edit: true, delete: true },
        { module: "permission", read: true, create: true, edit: true, delete: true },
        { module: "log", read: true, create: true, edit: true, delete: true }
      ],
      createdAt: "2026-01-01T08:00:00Z"
    },
    {
      id: "usr-pm",
      username: "pm_lynn",
      name: "林建华",
      email: "lynn@enterprise.com",
      role: "project_manager",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      department: "项目开发部",
      status: "active",
      permissions: [
        { module: "dashboard", read: true, create: false, edit: false, delete: false },
        { module: "customer", read: true, create: true, edit: true, delete: false },
        { module: "project", read: true, create: true, edit: true, delete: false },
        { module: "contract", read: true, create: true, edit: true, delete: false },
        { module: "finance", read: true, create: false, edit: false, delete: false },
        { module: "invoice", read: true, create: false, edit: false, delete: false },
        { module: "margin", read: true, create: false, edit: false, delete: false },
        { module: "approval", read: true, create: true, edit: false, delete: false },
        { module: "user", read: true, create: false, edit: false, delete: false },
        { module: "permission", read: false, create: false, edit: false, delete: false },
        { module: "log", read: false, create: false, edit: false, delete: false }
      ],
      createdAt: "2026-01-10T09:30:00Z"
    },
    {
      id: "usr-finance",
      username: "finance_qin",
      name: "秦晓雅",
      email: "finance@enterprise.com",
      role: "financial_manager",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      department: "财务管理部",
      status: "active",
      permissions: [
        { module: "dashboard", read: true, create: false, edit: false, delete: false },
        { module: "customer", read: true, create: false, edit: false, delete: false },
        { module: "project", read: true, create: false, edit: false, delete: false },
        { module: "contract", read: true, create: true, edit: true, delete: false },
        { module: "finance", read: true, create: true, edit: true, delete: true },
        { module: "invoice", read: true, create: true, edit: true, delete: true },
        { module: "margin", read: true, create: true, edit: true, delete: true },
        { module: "approval", read: true, create: true, edit: true, delete: false },
        { module: "user", read: true, create: false, edit: false, delete: false },
        { module: "permission", read: false, create: false, edit: false, delete: false },
        { module: "log", read: true, create: false, edit: false, delete: false }
      ],
      createdAt: "2026-01-15T10:00:00Z"
    }
  ],
  customers: [
    {
      id: "cust-1",
      code: "CUST-2026-001",
      name: "中铁一局集团建筑安装工程有限公司",
      industry: "建筑与重工业",
      contactName: "赵维国",
      phone: "13910023456",
      email: "zhaoweiguo@crfs.com",
      address: "北京市海淀区复兴路11号",
      taxNumber: "9111010876543210X1",
      bankName: "中国工商银行北京分行复兴路支行",
      bankAccount: "10293847560129384",
      description: "国家级核心国有建筑集成施工重企业，优质甲方合作伙伴。",
      creatorId: "usr-admin",
      createdAt: "2026-02-01T10:00:00Z"
    },
    {
      id: "cust-2",
      code: "CUST-2026-002",
      name: "国家电网电力建设有限公司",
      industry: "新能源与电网开发",
      contactName: "李明德",
      phone: "18633454721",
      email: "limingde@sgcc.com.cn",
      address: "北京市西城区西长安街86号",
      taxNumber: "9111010212345678A2",
      bankName: "中国建设银行北京西长安街支行",
      bankAccount: "33104928374950123",
      description: "大型中央企业，主要合作智能输变电子系统改造。履约信誉极佳。",
      creatorId: "usr-admin",
      createdAt: "2026-02-10T14:30:00Z"
    },
    {
      id: "cust-3",
      code: "CUST-2026-003",
      name: "极客风创软件科技有限公司",
      industry: "软件外包与技术服务",
      contactName: "韩雪儿",
      phone: "15549021251",
      email: "xueer.han@geekwind.com",
      address: "深圳市南山区科苑北路科兴科学园B栋",
      taxNumber: "9144030098765432Y4",
      bankName: "招商银行深圳科苑支行",
      bankAccount: "7559102938475612",
      description: "专业外包技术服务商，系统二级分包商主要付款对象。",
      creatorId: "usr-pm",
      createdAt: "2026-02-22T11:15:00Z"
    }
  ],
  projects: [
    {
      id: "proj-1",
      code: "PROJ-2026-001",
      name: "[父] 智慧城市路网综合态势感知一体化系统研发",
      parentId: null,
      type: "parent",
      customerId: "cust-1",
      status: "executing",
      manager: "林建华",
      budget: 8500000.00,
      startDate: "2026-03-01",
      endDate: "2027-04-30",
      description: "针对智慧城市道路车网感知、边缘设备管理与数据底座进行整套感知系统的集成性开发，主项目承载整体预算及大盘调配。",
      progress: 45,
      createdAt: "2026-02-25T09:00:00Z",
      creatorId: "usr-admin"
    },
    {
      id: "proj-1-1",
      code: "PROJ-2026-001-01",
      name: "[子] 智慧城市太原街区红绿灯路侧边缘AI计算部署",
      parentId: "proj-1",
      type: "child",
      customerId: "cust-1",
      status: "executing",
      manager: "林建华",
      budget: 3500000.00,
      startDate: "2026-03-10",
      endDate: "2026-11-30",
      description: "子工程：针对太原路段部署边缘AI盒子（边缘计算单元），对红绿灯进行自适应图像识别数据抓取，实时上传底盘。",
      progress: 60,
      createdAt: "2026-02-25T10:15:00Z",
      creatorId: "usr-pm"
    },
    {
      id: "proj-1-2",
      code: "PROJ-2026-001-02",
      name: "[子] 智慧城市数据三维高精地图可视化渲染面板",
      parentId: "proj-1",
      type: "child",
      customerId: "cust-1",
      status: "planning",
      manager: "周婷婷",
      budget: 3000000.00,
      startDate: "2026-07-01",
      endDate: "2027-03-15",
      description: "子工程：三维可视化数字底座在大屏端的WebGL和Cesium高精度渲染大屏定制开发。",
      progress: 10,
      createdAt: "2026-02-25T11:00:00Z",
      creatorId: "usr-pm"
    },
    {
      id: "proj-2",
      code: "PROJ-2026-002",
      name: "[父] 输变电站智能物联网巡检机器设备升级换代项目",
      parentId: null,
      type: "parent",
      customerId: "cust-2",
      status: "executing",
      manager: "王大勇",
      budget: 4200000.00,
      startDate: "2026-04-01",
      endDate: "2026-12-31",
      description: "巡检测温智能机器人在高负荷高电压环境下自动避障、红外测温与缺陷自动报警系统整体改造升级。",
      progress: 35,
      createdAt: "2026-03-05T14:00:00Z",
      creatorId: "usr-admin"
    }
  ],
  contracts: [
    {
      id: "cont-1",
      code: "HT-2026-IM-001",
      name: "智慧城市太原街区项目总承包收款合同",
      type: "income",
      projectId: "proj-1-1",
      customerId: "cust-1",
      amount: 4000000.00,
      status: "active",
      signDate: "2026-03-05",
      startDate: "2026-03-10",
      endDate: "2026-11-30",
      ourSigner: "张立国",
      customerSigner: "赵维国",
      isMarginIncluded: true,
      marginAmount: 200000.00,
      terms: "合同总价400万。首期付款：合同生效后付 30%（120万），提交边缘主控代码及巡检成果后付 40%（160万），最终通过太原交警大队初验后再付 20%（80万），余10%（40万）作为质保尾款在一年后结清。履约保证金20万，签订合同3日内汇入买方账户。",
      createdAt: "2026-03-05T16:00:00Z",
      creatorId: "usr-admin"
    },
    {
      id: "cont-2",
      code: "HT-2026-EX-001",
      name: "太原红绿灯路侧边缘AI计算模块设备软件采购分包合同",
      type: "expense",
      projectId: "proj-1-1",
      customerId: "cust-3",
      amount: 1200000.00,
      status: "active",
      signDate: "2026-03-12",
      startDate: "2026-03-15",
      endDate: "2026-10-31",
      ourSigner: "林建华",
      customerSigner: "韩雪儿",
      isMarginIncluded: true,
      marginAmount: 60000.00,
      terms: "分包硬件算法联合订购。首付 30%（36万）设备采购款启动，交货并调试通过支付 50%（60万）安装尾款，余20%（24万）为质保。分包商需缴纳 6 万履约保证金至我司。",
      createdAt: "2026-03-12T10:00:00Z",
      creatorId: "usr-pm"
    },
    {
      id: "cont-3",
      code: "HT-2026-IM-002",
      name: "变电站智能物联网巡检机器人设备升级收款合同",
      type: "income",
      projectId: "proj-2",
      customerId: "cust-2",
      amount: 4500000.00,
      status: "active",
      signDate: "2026-04-05",
      startDate: "2026-04-10",
      endDate: "2026-12-31",
      ourSigner: "张立国",
      customerSigner: "李明德",
      isMarginIncluded: false,
      marginAmount: 0.00,
      terms: "国网总承包，支持分三期：动工付 40%（180万），中期测试通过付 45%（202.5万），验收后15个工作日内结清 15%（67.5万）。该项目无履约保证金约定。",
      createdAt: "2026-04-05T09:30:00Z",
      creatorId: "usr-admin"
    }
  ],
  finances: [
    {
      id: "fin-1",
      code: "FLOW-2026-001",
      contractId: "cont-1",
      type: "income",
      amount: 1200000.00,
      recordDate: "2026-03-15",
      bankAccount: "招商银行深圳分行 88390129",
      flowCategory: "首付款",
      operator: "秦晓雅",
      status: "verified",
      description: "HT-2026-IM-001 收款合同对应的30%首期到账款，招行直联渠道成功认领并和项目进度挂钩。",
      createdAt: "2026-03-15T10:00:00Z"
    },
    {
      id: "fin-2",
      code: "FLOW-2026-002",
      contractId: "cont-2",
      type: "expense",
      amount: 360000.00,
      recordDate: "2026-03-18",
      bankAccount: "招商银行深圳分行 88390129",
      flowCategory: "设备采购款",
      operator: "秦晓雅",
      status: "verified",
      description: "HT-2026-EX-001 分包合同30%首付款拨付，极客风创研发启动资金。",
      createdAt: "2026-03-18T15:30:00Z"
    },
    {
      id: "fin-3",
      code: "FLOW-2026-003",
      contractId: "cont-3",
      type: "income",
      amount: 1800000.00,
      recordDate: "2026-04-12",
      bankAccount: "中国工商银行北京中关村支行 9012",
      flowCategory: "首付款",
      operator: "秦晓雅",
      status: "verified",
      description: "巡巡机器人合同首付款40%到账凭证挂钩。",
      createdAt: "2026-04-12T11:00:00Z"
    },
    {
      id: "fin-4",
      code: "FLOW-2026-004",
      contractId: "cont-1",
      type: "income",
      amount: 1600000.00,
      recordDate: "2026-06-15",
      bankAccount: "招商银行深圳分行 88390129",
      flowCategory: "进度款",
      operator: "秦晓雅",
      status: "pending",
      description: "【待审核】HT-2026-IM-001 二期工程进度款审核认领申请。林建华已确认红绿灯测试合格。",
      createdAt: "2026-06-15T14:22:00Z"
    }
  ],
  invoices: [
    {
      id: "inv-1",
      code: "INV-2026-001",
      contractId: "cont-1",
      type: "issued",
      amount: 1200000.00,
      taxRate: 6,
      taxAmount: 67924.53,
      invoiceNumber: "FP-10293848",
      invoiceDate: "2026-03-16",
      status: "issued",
      description: "对应首付120万人民币开具的增值税专用发票（6%税率，服务业类项目）。",
      createdAt: "2026-03-16T11:00:00Z",
      creatorId: "usr-finance"
    },
    {
      id: "inv-2",
      code: "INV-2026-002",
      contractId: "cont-2",
      type: "received",
      amount: 360000.00,
      taxRate: 13,
      taxAmount: 41415.93,
      invoiceNumber: "FP-90023412",
      invoiceDate: "2026-03-22",
      status: "registered",
      description: "收到极客风创因收到首付款开具并发来的增值税专用发票（13%硬件采购税率），已录入抵扣系统。",
      createdAt: "2026-03-22T09:12:00Z",
      creatorId: "usr-finance"
    },
    {
      id: "inv-3",
      code: "INV-2026-003",
      contractId: "cont-3",
      type: "issued",
      amount: 1800000.00,
      taxRate: 9,
      taxAmount: 148623.85,
      invoiceNumber: "FP-20194851",
      invoiceDate: "2026-04-15",
      status: "issued",
      description: "对巡检升级合同首期款开具的 9% 增值税专用发票（电站改造配套）。",
      createdAt: "2026-04-15T15:00:00Z",
      creatorId: "usr-finance"
    }
  ],
  margins: [
    {
      id: "marg-1",
      code: "BZJ-2026-001",
      contractId: "cont-1",
      type: "pay", // 缴纳保证金 (To Client)
      amount: 200000.00,
      status: "paid",
      dueDate: "2026-03-08",
      actualDate: "2026-03-07",
      description: "中铁一局履约保证金，已通过公对公转入对方指定共管账户。质保期满或项目初验收通过后退还。",
      createdAt: "2026-03-05T17:00:00Z",
      creatorId: "usr-finance"
    },
    {
      id: "marg-2",
      code: "BZJ-2026-002",
      contractId: "cont-2",
      type: "receive", // 收到保证金 (From Supplier)
      amount: 60000.00,
      status: "received",
      dueDate: "2026-03-15",
      actualDate: "2026-03-14",
      description: "收到极客风创缴纳的防拖期和设备质量安全履约金，已确认到账。",
      createdAt: "2026-03-12T11:00:00Z",
      creatorId: "usr-finance"
    }
  ],
  approvals: [
    {
      id: "appr-1",
      code: "APPR-2026-001",
      targetType: "contract",
      targetId: "cont-1",
      applicantId: "usr-pm",
      applicantName: "林建华",
      title: "关于《太原街区总承包收款合同HT-2026-IM-001》立项并正式执行审批",
      content: "该款合同金额合计400万元，包含保证金20万元。为大项目PROJ-2026-001的关键子项。价格、履约条款均已核对，法务审核通过，申请正式放行执行。",
      status: "approved",
      remark: "条款已评估，且首期回款概率高，准予立项并签字开票复核。",
      auditorId: "usr-admin",
      auditorName: "张立国",
      auditedAt: "2026-03-05T15:30:00Z",
      createdAt: "2026-03-05T12:00:00Z"
    },
    {
      id: "appr-2",
      code: "APPR-2026-002",
      targetType: "finance",
      targetId: "fin-4",
      applicantId: "usr-finance",
      applicantName: "秦晓雅",
      title: "关于收到太原红绿灯二期进度监控款 160 万元入账核销审批",
      content: " HT-2026-IM-001 项下第二笔进度款160万元。款项于6月14日汇入我行，已附上交警初验单和银行水单。由于账期原因涉及调配，请领导审核正式入账。",
      status: "pending",
      remark: "",
      createdAt: "2026-06-15T15:00:00Z"
    }
  ],
  audit_logs: [
    {
      id: "log-1",
      userId: "usr-admin",
      username: "张立国",
      role: "总经理/管理员",
      action: "INIT_SYSTEM",
      module: "permission",
      detail: "管理系统底层关系型核心初始化成功。装载出厂权限组、用户角色，配置数据库实体索引。",
      ipAddress: "127.0.0.1",
      createdAt: "2026-06-18T01:00:00Z"
    },
    {
      id: "log-2",
      userId: "usr-admin",
      username: "张立国",
      role: "总经理/管理员",
      action: "SEED_DATA",
      module: "dashboard",
      detail: "导入初始业务数据库切片：含3个客户、4个父子项目、3份收付款合同及对应发票保证金等勾连凭证。",
      ipAddress: "127.0.0.1",
      createdAt: "2026-06-18T01:05:00Z"
    }
  ]
};

class RelationalDatabase {
  private data: Schema;

  constructor() {
    this.data = { ...INITIAL_DB };
    this.init();
  }

  private init() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        console.log(`Database loaded successfully from ${DB_FILE}`);
      } else {
        this.save();
        console.log(`Database initialized and stored at ${DB_FILE}`);
      }
    } catch (e) {
      console.error("Failed to load / init DB from storage, running in memory.", e);
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error("Database failed to save:", e);
    }
  }

  /**
   * Generates a sequential, readable business serial code
   */
  private generateCode(prefix: string, length: number, entityList: any[]): string {
    const today = new Date();
    const year = today.getFullYear();
    const seq = String(entityList.length + 1).padStart(length, '0');
    return `${prefix}-${year}-${seq}`;
  }

  // --- AUDIT LOG UTILITY ---
  public log(userId: string, username: string, role: string, module: string, action: string, detail: string, ip: string = "127.0.0.1") {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId,
      username,
      role,
      action,
      module,
      detail,
      ipAddress: ip,
      createdAt: new Date().toISOString()
    };
    this.data.audit_logs.unshift(newLog);
    this.save();
    return newLog;
  }

  // ============== AUTH & USERS =============
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserByUsername(username: string): User | undefined {
    return this.data.users.find(u => u.username === username);
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(user: Omit<User, 'id' | 'createdAt'>, actor: User): User {
    // Transactional check
    if (this.data.users.some(u => u.username === user.username)) {
      throw new Error(`用户名 ${user.username} 已存在！`);
    }

    const newUser: User = {
      ...user,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.log(actor.id, actor.name, actor.role, "user", "CREATE_USER", `创建新用户: ${newUser.name} (账号: ${newUser.username}), 角色: ${newUser.role}`, "127.0.0.1");
    this.save();
    return newUser;
  }

  public updateUser(id: string, userUpdates: Partial<Omit<User, 'id' | 'createdAt'>>, actor: User): User {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error("用户未找到！");

    // Retain default admin constraints to protect environment
    if (id === 'usr-admin' && userUpdates.role && userUpdates.role !== 'admin') {
      throw new Error("不可更改系统初始超级管理员的角色属性！");
    }

    const updated = { ...this.data.users[idx], ...userUpdates };
    this.data.users[idx] = updated;

    this.log(actor.id, actor.name, actor.role, "user", "UPDATE_USER", `更新用户: ${updated.name} (ID: ${id})`, "127.0.0.1");
    this.save();
    return updated;
  }

  public deleteUser(id: string, actor: User): boolean {
    if (id === 'usr-admin') {
      throw new Error("无法删除超级管理员账户！");
    }
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error("用户不匹配！");

    const targetUser = this.data.users[idx];
    this.data.users.splice(idx, 1);

    this.log(actor.id, actor.name, actor.role, "user", "DELETE_USER", `删除了用户: ${targetUser.name}`, "127.0.0.1");
    this.save();
    return true;
  }

  // ============== CUSTOMER UTILS =============
  public getCustomers(): Customer[] {
    return this.data.customers;
  }

  public createCustomer(cust: Omit<Customer, 'id' | 'code' | 'createdAt'>, actor: User): Customer {
    const code = this.generateCode("CUST", 3, this.data.customers);
    const newCust: Customer = {
      ...cust,
      id: `cust-${Date.now()}`,
      code,
      createdAt: new Date().toISOString()
    };
    this.data.customers.push(newCust);
    this.log(actor.id, actor.name, actor.role, "customer", "CREATE_CUSTOMER", `录入新客商: ${newCust.name} (编码: ${code})`, "127.0.0.1");
    this.save();
    return newCust;
  }

  public updateCustomer(id: string, cust: Partial<Customer>, actor: User): Customer {
    const idx = this.data.customers.findIndex(c => c.id === id);
    if (idx === -1) throw new Error("客户未找到！");
    const updated = { ...this.data.customers[idx], ...cust };
    this.data.customers[idx] = updated;

    this.log(actor.id, actor.name, actor.role, "customer", "UPDATE_CUSTOMER", `修改了客商资料: ${updated.name}`, "127.0.0.1");
    this.save();
    return updated;
  }

  public deleteCustomer(id: string, actor: User): boolean {
    const idx = this.data.customers.findIndex(c => c.id === id);
    if (idx === -1) throw new Error("客户不存在！");

    // Relational Integrity Constraint: Prevent deletion if active projects refer to this customer
    const linkedProjCount = this.data.projects.filter(p => p.customerId === id).length;
    if (linkedProjCount > 0) {
      throw new Error(`约束违反(Foreign Key Restriction): 无法删除客户，该客户当前名下关联有 ${linkedProjCount} 个子母项目，请先迁移项目！`);
    }

    const linkedContCount = this.data.contracts.filter(c => c.customerId === id).length;
    if (linkedContCount > 0) {
      throw new Error(`约束违反(Foreign Key Restriction): 该客户当前关联有 ${linkedContCount} 笔执行合同，无法直接删除！`);
    }

    const custName = this.data.customers[idx].name;
    this.data.customers.splice(idx, 1);

    this.log(actor.id, actor.name, actor.role, "customer", "DELETE_CUSTOMER", `注销客商档案: ${custName}`, "127.0.0.1");
    this.save();
    return true;
  }

  // ============== PROJECTS (Parent-Child) =============
  // Returns list of projects, resolving customer specifications
  public getProjects(): Project[] {
    return this.data.projects.map(p => {
      const cust = this.data.customers.find(c => c.id === p.customerId);
      return {
        ...p,
        customerName: cust ? cust.name : "未知客户"
      };
    });
  }

  public createProject(proj: Omit<Project, 'id' | 'code' | 'createdAt'>, actor: User): Project {
    const code = this.generateCode("PROJ", 3, this.data.projects);
    const newProj: Project = {
      ...proj,
      id: `proj-${Date.now()}`,
      code,
      createdAt: new Date().toISOString()
    };

    // Sub-project validation: Parent exists check
    if (newProj.type === 'child' && newProj.parentId) {
      const parentExists = this.data.projects.some(p => p.id === newProj.parentId && p.type === 'parent');
      if (!parentExists) {
        throw new Error("所属父项不存在或其本身不是父工程，请重新选择！");
      }
    }

    this.data.projects.push(newProj);
    this.log(actor.id, actor.name, actor.role, "project", "CREATE_PROJECT", `立项创建项目: ${newProj.name} (${newProj.type === 'parent' ? '父项目' : '子项目'})`, "127.0.0.1");
    this.save();
    return newProj;
  }

  public updateProject(id: string, projUpdates: Partial<Project>, actor: User): Project {
    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx === -1) throw new Error("项目不存在");

    const old = this.data.projects[idx];
    const updated = { ...old, ...projUpdates };

    // Hierarchy updates restriction: Prevent turning parent to child if it already has sub-projects
    if (old.type === 'parent' && updated.type === 'child') {
      const hasChildren = this.data.projects.some(p => p.parentId === id);
      if (hasChildren) {
        throw new Error("由于此父项目下已有多笔正在执行的子项目，不能变更为子项目形态！");
      }
    }

    this.data.projects[idx] = updated;
    this.log(actor.id, actor.name, actor.role, "project", "UPDATE_PROJECT", `编辑项目要素: ${updated.name}`, "127.0.0.1");
    this.save();
    return updated;
  }

  public deleteProject(id: string, actor: User): boolean {
    const idx = this.data.projects.findIndex(p => p.id === id);
    if (idx === -1) throw new Error("项目不存在");

    const proj = this.data.projects[idx];

    // Cascading & Relational Safety Checks
    // 1. If it represents a parent, restrict deleting if secondary child projects exist
    if (proj.type === 'parent') {
      const subprojects = this.data.projects.filter(p => p.parentId === id);
      if (subprojects.length > 0) {
        throw new Error(`约束违反: 该项目下属仍有 ${subprojects.length} 个子项目(如:${subprojects[0].name})。请优先删除或解耦子项目！`);
      }
    }

    // 2. Restrict deletion if contracts are bound to this project
    const contractsBound = this.data.contracts.filter(c => c.projectId === id);
    if (contractsBound.length > 0) {
      throw new Error(`约束违反: 该项目已被《${contractsBound[0].name}》等 ${contractsBound.length} 个合同文件绑定，无法注销立项！`);
    }

    this.data.projects.splice(idx, 1);
    this.log(actor.id, actor.name, actor.role, "project", "DELETE_PROJECT", `项目注销下线: ${proj.name}`, "127.0.0.1");
    this.save();
    return true;
  }

  // ============== CONTRACTS (Income vs Expense) =============
  public getContracts(): Contract[] {
    return this.data.contracts.map(cont => {
      const proj = this.data.projects.find(p => p.id === cont.projectId);
      const cust = this.data.customers.find(c => c.id === cont.customerId);
      return {
        ...cont,
        projectName: proj ? proj.name : "解耦项目",
        customerName: cust ? cust.name : "解耦客户"
      };
    });
  }

  public createContract(cont: Omit<Contract, 'id' | 'code' | 'createdAt'>, actor: User): Contract {
    const prefix = cont.type === 'income' ? "HT-SK" : "HT-FK";
    const code = this.generateCode(prefix, 3, this.data.contracts);
    const newCont: Contract = {
      ...cont,
      id: `cont-${Date.now()}`,
      code,
      createdAt: new Date().toISOString()
    };

    this.data.contracts.push(newCont);

    // Dynamic relational creation: If contractual guarantee money (保证金) exists, automatically record in the margins table (transaction-like integrity!)
    if (newCont.isMarginIncluded && newCont.marginAmount > 0) {
      const marginCode = this.generateCode("BZJ", 4, this.data.margins);
      const tempMargin: Margin = {
        id: `marg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        code: marginCode,
        contractId: newCont.id,
        type: newCont.type === 'income' ? 'receive' : 'pay', // income contract receives margin, expense contract pays margin
        amount: newCont.marginAmount,
        status: 'pending',
        dueDate: newCont.startDate, // default due date sets to contract start
        description: `伴随合同 [${newCont.name}] 签订，机制自动生成之保证金条目。`,
        createdAt: new Date().toISOString(),
        creatorId: actor.id
      };
      this.data.margins.push(tempMargin);
    }

    this.log(actor.id, actor.name, actor.role, "contract", "CREATE_CONTRACT", `合同立约核项: [${newCont.type === 'income' ? '收款收款' : '承包付款'}] ${newCont.name} (金额: ¥${newCont.amount})`, "127.0.0.1");
    this.save();
    return newCont;
  }

  public updateContract(id: string, cont: Partial<Contract>, actor: User): Contract {
    const idx = this.data.contracts.findIndex(c => c.id === id);
    if (idx === -1) throw new Error("合同不存在");

    const old = this.data.contracts[idx];
    const updated = { ...old, ...cont };

    // Transaction consistency on margin inclusion edits
    if (!old.isMarginIncluded && updated.isMarginIncluded && updated.marginAmount > 0) {
      // Create margin log if none exists currently
      const exists = this.data.margins.some(m => m.contractId === id);
      if (!exists) {
        const marginCode = this.generateCode("BZJ", 4, this.data.margins);
        this.data.margins.push({
          id: `marg-${Date.now()}`,
          code: marginCode,
          contractId: id,
          type: updated.type === 'income' ? 'receive' : 'pay',
          amount: updated.marginAmount,
          status: 'pending',
          dueDate: updated.startDate || new Date().toISOString().split('T')[0],
          description: `追加保证金跟踪：${updated.name}`,
          createdAt: new Date().toISOString(),
          creatorId: actor.id
        });
      }
    }

    this.data.contracts[idx] = updated;
    this.log(actor.id, actor.name, actor.role, "contract", "UPDATE_CONTRACT", `修改合同文本/金额: ${updated.name}`, "127.0.0.1");
    this.save();
    return updated;
  }

  public deleteContract(id: string, actor: User): boolean {
    const idx = this.data.contracts.findIndex(c => c.id === id);
    if (idx === -1) throw new Error("合同不存在");

    const cont = this.data.contracts[idx];

    // Strong consistency constraints: Prevent deleting contract if cash flow, invoice, or approvals exist
    const linkedFlows = this.data.finances.filter(f => f.contractId === id);
    if (linkedFlows.length > 0) {
      throw new Error(`财务安全性受阻: 合同当前存有共 ${linkedFlows.length} 笔相关的银行现金流水(首付或后期款印鉴)，强行删除会彻底破坏财务平衡！`);
    }

    const linkedInvoices = this.data.invoices.filter(i => i.contractId === id);
    if (linkedInvoices.length > 0) {
      throw new Error(`约束违反: 合同已被开具或登记了 ${linkedInvoices.length} 张专用增值税发票，请先处理关联的发票资产！`);
    }

    // Cascade delete margins under strict locks if only they are still pending
    const paidOrReceivedMargin = this.data.margins.some(m => m.contractId === id && (m.status === 'paid' || m.status === 'received' || m.status === 'refunded'));
    if (paidOrReceivedMargin) {
      throw new Error(`保证金状态拘束: 对应的履约保证金已发生实际打款/收取事件。不可删除该合同底单！`);
    }

    // Cascade remove pending margins
    this.data.margins = this.data.margins.filter(m => m.contractId !== id);

    this.data.contracts.splice(idx, 1);
    this.log(actor.id, actor.name, actor.role, "contract", "DELETE_CONTRACT", `合同清盘注销: ${cont.name}`, "127.0.0.1");
    this.save();
    return true;
  }

  // ============== FINANCES (Cash Flows / 财务流水) =============
  public getFinances(): FinanceFlow[] {
    return this.data.finances.map(f => {
      const cont = this.data.contracts.find(c => c.id === f.contractId);
      let pName = "";
      let pId = "";
      if (cont) {
        const proj = this.data.projects.find(p => p.id === cont.projectId);
        pName = proj ? proj.name : "";
        pId = proj ? proj.id : "";
      }
      return {
        ...f,
        contractName: cont ? cont.name : "未知合同",
        projectName: pName,
        projectId: pId
      };
    });
  }

  public createFinanceFlow(flow: Omit<FinanceFlow, 'id' | 'code' | 'createdAt'>, actor: User): FinanceFlow {
    // 1. Transaction check: contract validation
    const targetCont = this.data.contracts.find(c => c.id === flow.contractId);
    if (!targetCont) {
      throw new Error("拟绑定合同不存在，无法归档银行流水");
    }

    // Verify contract flow agreement type
    if (targetCont.type !== flow.type) {
      throw new Error(`财务数据逻辑错谬: 该合同属于 [${targetCont.type === 'income' ? '收款合同' : '付款合同'}]，不能创设 [${flow.type === 'income' ? '收款' : '付款'}] 性质的流水！`);
    }

    const code = this.generateCode("FLOW", 4, this.data.finances);
    const newFlow: FinanceFlow = {
      ...flow,
      id: `fin-${Date.now()}`,
      code,
      createdAt: new Date().toISOString()
    };

    this.data.finances.push(newFlow);

    // Write audit log
    this.log(
      actor.id,
      actor.name,
      actor.role,
      "finance",
      "CREATE_FIN_FLOW",
      `登记一笔银行交易流水 (金额: ¥${newFlow.amount}, 状态: ${newFlow.status}, 合同: ${targetCont.name})`,
      "127.0.0.1"
    );

    this.save();
    return newFlow;
  }

  public updateFinanceFlow(id: string, flowUpdates: Partial<FinanceFlow>, actor: User): FinanceFlow {
    const idx = this.data.finances.findIndex(f => f.id === id);
    if (idx === -1) throw new Error("流水记录不存在");

    const old = this.data.finances[idx];
    const updated = { ...old, ...flowUpdates };

    this.data.finances[idx] = updated;
    this.log(actor.id, actor.name, actor.role, "finance", "UPDATE_FIN_FLOW", `微调银行流水细节 (代码: ${old.code}, 状态更新：${updated.status})`, "127.0.0.1");
    this.save();
    return updated;
  }

  public deleteFinanceFlow(id: string, actor: User): boolean {
    const idx = this.data.finances.findIndex(f => f.id === id);
    if (idx === -1) throw new Error("银行账目流水不匹配");

    const flow = this.data.finances[idx];
    if (flow.status === 'verified') {
      throw new Error("流水已经通过财务复核入账，属于锁定凭证，无法直接删除！请先做红字冲销或寻求特权特批！");
    }

    this.data.finances.splice(idx, 1);
    this.log(actor.id, actor.name, actor.role, "finance", "DELETE_FIN_FLOW", `删除了未复核的流水款项 (金额: ¥${flow.amount})`, "127.0.0.1");
    this.save();
    return true;
  }

  // ============== INVOICES (发票管理) =============
  public getInvoices(): Invoice[] {
    return this.data.invoices.map(inv => {
      const c = this.data.contracts.find(ct => ct.id === inv.contractId);
      return {
        ...inv,
        contractName: c ? c.name : "未知合同"
      };
    });
  }

  public createInvoice(inv: Omit<Invoice, 'id' | 'code' | 'createdAt'>, actor: User): Invoice {
    const refContract = this.data.contracts.find(c => c.id === inv.contractId);
    if (!refContract) {
      throw new Error("开票关联的合同未找到");
    }

    const code = this.generateCode("INV", 4, this.data.invoices);
    const newInv: Invoice = {
      ...inv,
      id: `inv-${Date.now()}`,
      code,
      createdAt: new Date().toISOString()
    };

    this.data.invoices.push(newInv);
    this.log(actor.id, actor.name, actor.role, "invoice", "CREATE_INVOICE", `开具/登记${newInv.type === 'issued' ? '开端销项' : '进项抵扣'}税票：号码:${newInv.invoiceNumber}, 金额: ¥${newInv.amount}`, "127.0.0.1");
    this.save();
    return newInv;
  }

  public updateInvoice(id: string, invUpdates: Partial<Invoice>, actor: User): Invoice {
    const idx = this.data.invoices.findIndex(i => i.id === id);
    if (idx === -1) throw new Error("发票不存在");
    const updated = { ...this.data.invoices[idx], ...invUpdates };
    this.data.invoices[idx] = updated;

    this.log(actor.id, actor.name, actor.role, "invoice", "UPDATE_INVOICE", `变更发票信息 (号码: ${updated.invoiceNumber})`, "127.0.0.1");
    this.save();
    return updated;
  }

  public deleteInvoice(id: string, actor: User): boolean {
    const idx = this.data.invoices.findIndex(i => i.id === id);
    if (idx === -1) throw new Error("发票未找到");

    const inv = this.data.invoices[idx];
    this.data.invoices.splice(idx, 1);
    this.log(actor.id, actor.name, actor.role, "invoice", "DELETE_INVOICE", `作废/删除系统登记发票号: ${inv.invoiceNumber}`, "127.0.0.1");
    this.save();
    return true;
  }

  // ============== MARGINS (保证金管理) =============
  public getMargins(): Margin[] {
    return this.data.margins.map(m => {
      const c = this.data.contracts.find(ct => ct.id === m.contractId);
      return {
        ...m,
        contractName: c ? c.name : "未知合同"
      };
    });
  }

  public createMargin(margin: Omit<Margin, 'id' | 'code' | 'createdAt'>, actor: User): Margin {
    const code = this.generateCode("BZJ", 4, this.data.margins);
    const newMargin: Margin = {
      ...margin,
      id: `marg-${Date.now()}`,
      code,
      createdAt: new Date().toISOString()
    };
    this.data.margins.push(newMargin);
    this.log(actor.id, actor.name, actor.role, "margin", "CREATE_MARGIN", `核设保证金项 (金额: ¥${newMargin.amount}, 说明: ${newMargin.description})`, "127.0.0.1");
    this.save();
    return newMargin;
  }

  public updateMargin(id: string, argUpdates: Partial<Margin>, actor: User): Margin {
    const idx = this.data.margins.findIndex(m => m.id === id);
    if (idx === -1) throw new Error("履约金明细项缺失");

    const updated = { ...this.data.margins[idx], ...argUpdates };
    this.data.margins[idx] = updated;

    this.log(actor.id, actor.name, actor.role, "margin", "UPDATE_MARGIN", `修订保证金账期或收付款状态 (流水: ${updated.code})`, "127.0.0.1");
    this.save();
    return updated;
  }

  public deleteMargin(id: string, actor: User): boolean {
    const idx = this.data.margins.findIndex(m => m.id === id);
    if (idx === -1) throw new Error("项目不存在");

    const item = this.data.margins[idx];
    if (item.status === 'paid' || item.status === 'received' || item.status === 'refunded') {
      throw new Error("保证金已经结转实际收支、核账或退还，无法直接从台账册子内涂抹删除！");
    }

    this.data.margins.splice(idx, 1);
    this.log(actor.id, actor.name, actor.role, "margin", "DELETE_MARGIN", `注销拟划拨的保证金跟踪 (代码: ${item.code})`, "127.0.0.1");
    this.save();
    return true;
  }

  // ============== APPROVALS (流程审核) =============
  public getApprovals(): Approval[] {
    return this.data.approvals.map(appr => {
      let titleOfTarget = "关联目标";
      if (appr.targetType === 'contract') {
        const c = this.data.contracts.find(x => x.id === appr.targetId);
        titleOfTarget = c ? c.name : "未知合同";
      } else if (appr.targetType === 'project') {
        const p = this.data.projects.find(x => x.id === appr.targetId);
        titleOfTarget = p ? p.name : "未知项目";
      } else if (appr.targetType === 'finance') {
        const f = this.data.finances.find(x => x.id === appr.targetId);
        titleOfTarget = f ? `${f.flowCategory} ¥${f.amount}` : "未知流水";
      } else if (appr.targetType === 'invoice') {
        const i = this.data.invoices.find(x => x.id === appr.targetId);
        titleOfTarget = i ? `税票号码 ${i.invoiceNumber}` : "未知发票";
      }

      return {
        ...appr,
        targetName: titleOfTarget
      };
    });
  }

  public createApproval(appr: Omit<Approval, 'id' | 'code' | 'createdAt'>, actor: User): Approval {
    const code = this.generateCode("APPR", 3, this.data.approvals);
    const newAppr: Approval = {
      ...appr,
      id: `appr-${Date.now()}`,
      code,
      createdAt: new Date().toISOString()
    };
    this.data.approvals.unshift(newAppr);
    this.log(actor.id, actor.name, actor.role, "approval", "CREATE_APPROVAL", `提请了流程审批 [${newAppr.title}]`, "127.0.0.1");
    this.save();
    return newAppr;
  }

  public processApproval(id: string, status: 'approved' | 'rejected', remark: string, auditor: User): Approval {
    const idx = this.data.approvals.findIndex(a => a.id === id);
    if (idx === -1) throw new Error("审批单不匹配");

    const old = this.data.approvals[idx];
    if (old.status !== 'pending') {
      throw new Error("该流程早先已经做出审核判定，不能重复做决策。");
    }

    const updated: Approval = {
      ...old,
      status,
      remark,
      auditorId: auditor.id,
      auditorName: auditor.name,
      auditedAt: new Date().toISOString()
    };

    this.data.approvals[idx] = updated;

    // Trigger state synchronization based on relational workflow bindings (Rigorous transactional workflow!)
    // 1. If it's contract approval and gets approved, we change the contract's status from 'draft'/'under_review' to 'active'
    if (updated.targetType === 'contract') {
      const cIdx = this.data.contracts.findIndex(c => c.id === updated.targetId);
      if (cIdx !== -1) {
        this.data.contracts[cIdx].status = status === 'approved' ? 'active' : 'draft';
      }
    }

    // 2. If it's finance transaction approval and gets approved, we set the corresponding bank flow status to 'verified'
    if (updated.targetType === 'finance') {
      const fIdx = this.data.finances.findIndex(f => f.id === updated.targetId);
      if (fIdx !== -1) {
        this.data.finances[fIdx].status = status === 'approved' ? 'verified' : 'pending';
      }
    }

    // 3. If it's invoice approval and gets approved, set invoice to registered/issued
    if (updated.targetType === 'invoice') {
      const iIdx = this.data.invoices.findIndex(inv => inv.id === updated.targetId);
      if (iIdx !== -1) {
        this.data.invoices[iIdx].status = status === 'approved' ? 'registered' : 'pending';
      }
    }

    this.log(auditor.id, auditor.name, auditor.role, "approval", status === 'approved' ? "APPROVE_WORKFLOW" : "REJECT_WORKFLOW", `审核通过/驳回流程单: [${old.title}] 结论: ${status === 'approved' ? '同意放行' : '驳回意见'}`, "127.0.0.1");
    this.save();
    return updated;
  }

  // ============== AUDIT LOGS =============
  public getAuditLogs(): AuditLog[] {
    return this.data.audit_logs;
  }

  // ============== BUSINESS ANALYSIS REPORT (DASHBOARD METRICS) =============
  public getDashboardStats(): DashboardStats {
    const parentChildren = this.getProjects();
    const activeProjects = parentChildren.filter(p => p.status === 'executing' || p.status === 'completed');

    // Total income/expense contract values
    const incomeContracts = this.data.contracts.filter(c => c.type === 'income' && c.status !== 'suspended');
    const expenseContracts = this.data.contracts.filter(c => c.type === 'expense' && c.status !== 'suspended');

    const totalIncomeContractAmount = incomeContracts.reduce((sum, c) => sum + c.amount, 0);
    const totalExpenseContractAmount = expenseContracts.reduce((sum, c) => sum + c.amount, 0);

    // Dynamic validated flow metrics (Real-time and highly synchronized)
    const activeFinances = this.data.finances.filter(f => f.status === 'verified');
    const totalCashIn = activeFinances.filter(f => f.type === 'income').reduce((sum, f) => sum + f.amount, 0);
    const totalCashOut = activeFinances.filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0);

    // Invoice tallies
    const totalInvoicedIssued = this.data.invoices.filter(i => i.type === 'issued' && i.status === 'issued').reduce((sum, i) => sum + i.amount, 0);
    const totalInvoicedReceived = this.data.invoices.filter(i => i.type === 'received' && i.status === 'registered').reduce((sum, i) => sum + i.amount, 0);

    // Margins locked / processed
    const marginsPaid = this.data.margins.filter(m => m.type === 'pay' && m.status === 'paid').reduce((sum, m) => sum + m.amount, 0);
    const marginsReceived = this.data.margins.filter(m => m.type === 'receive' && m.status === 'received').reduce((sum, m) => sum + m.amount, 0);

    const pendingApprovals = this.data.approvals.filter(a => a.status === 'pending').length;

    return {
      totalProjectCount: this.data.projects.length,
      totalProjectBudget: this.data.projects.reduce((sum, p) => p.type === 'parent' ? sum + p.budget : sum, 0), // Count only parent project budgets to prevent over-inflating parent-child duplicates
      totalIncomeContractAmount,
      totalExpenseContractAmount,
      totalCashIn,
      totalCashOut,
      totalInvoicedIssued,
      totalInvoicedReceived,
      marginPaidAmount: marginsPaid,
      marginReceivedAmount: marginsReceived,
      pendingApprovals
    };
  }

  // Visual report charts
  public getContractPerformance(): any[] {
    // Collect contract names, total amount, and actual received/paid to chart it nicely
    return this.data.contracts.map(cont => {
      const flows = this.data.finances.filter(f => f.contractId === cont.id && f.status === 'verified');
      const paidOrReceived = flows.reduce((sum, f) => sum + f.amount, 0);
      const invoices = this.data.invoices.filter(i => i.contractId === cont.id);
      const invoiceAmount = invoices.reduce((sum, i) => sum + i.amount, 0);

      return {
        name: cont.name.length > 10 ? cont.name.substr(0, 10) + '...' : cont.name,
        code: cont.code,
        type: cont.type === 'income' ? '收款合同' : '付款合同',
        totalAmount: cont.amount,
        cashFlowAmount: paidOrReceived,
        invoiceAmount: invoiceAmount,
        ratio: cont.amount > 0 ? Number(((paidOrReceived / cont.amount) * 100).toFixed(1)) : 0
      };
    });
  }

  public getFinanceMonthlyTrend(): any[] {
    // Generate static monthly trend analysis for cash-in and cash-out
    // Based on the record dates of verified transactions
    const months = ["01月", "02月", "03月", "04月", "05月", "06月", "07月", "08月", "09月", "10月", "11月", "12月"];
    const results = months.map(m => ({ month: m, '收到资金': 0, '发出资金': 0 }));

    this.data.finances.forEach(f => {
      if (f.status !== 'verified') return;
      const date = new Date(f.recordDate);
      if (date.getFullYear() === 2026) {
        const mIdx = date.getMonth();
        if (mIdx >= 0 && mIdx < 12) {
          if (f.type === 'income') {
            results[mIdx]['收到资金'] += f.amount;
          } else {
            results[mIdx]['发出资金'] += f.amount;
          }
        }
      }
    });

    return results;
  }
}

export const db = new RelationalDatabase();
