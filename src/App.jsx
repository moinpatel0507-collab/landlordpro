import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from "recharts";

// ══════════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════════
const ADMIN_USER = {
  id: "ADMIN", name: "System Administrator",
  email: "admin@landlordpro.co.uk", password: "LandlordPro#BF1AF9",
  role: "admin", company: "LandlordPro", phone: ""
};

const DEMO_LANDLORD = {
  id: "DEMO", name: "Demo Landlord",
  email: "demo@landlordpro.co.uk", password: "Demo@2024",
  role: "landlord", company: "", phone: "07700 900000", createdAt: "2024-01-01"
};

const CERT_TYPES = [
  { id: "gas",       label: "Gas Safety Certificate",        months: 12,  icon: "🔥" },
  { id: "epc",       label: "Energy Performance Cert (EPC)", months: 120, icon: "⚡" },
  { id: "eicr",      label: "Electrical Installation (EICR)",months: 60,  icon: "💡" },
  { id: "pat",       label: "PAT Testing",                   months: 12,  icon: "🔌" },
  { id: "hmo",       label: "HMO Licence",                   months: 60,  icon: "🏠" },
  { id: "fire",      label: "Fire Safety Certificate",        months: 12,  icon: "🧯" },
  { id: "legionella",label: "Legionella Risk Assessment",     months: 24,  icon: "💧" },
  { id: "other",     label: "Other Certificate",             months: 12,  icon: "📋" },
];

const S8_GROUNDS = [
  { g: "Ground 8",  mandatory: true,  desc: "Mandatory: At least 2 months' (or 8 weeks') rent unpaid at notice date AND court hearing date" },
  { g: "Ground 10", mandatory: false, desc: "Discretionary: Some rent lawfully due and unpaid at notice date and court date" },
  { g: "Ground 11", mandatory: false, desc: "Discretionary: Persistent delay in paying rent (even if not currently in arrears)" },
  { g: "Ground 12", mandatory: false, desc: "Discretionary: Breach of any tenancy obligation other than rent" },
  { g: "Ground 13", mandatory: false, desc: "Discretionary: Deterioration of property condition through waste, neglect or default" },
  { g: "Ground 14", mandatory: false, desc: "Discretionary: Nuisance, annoyance or illegal/immoral use of the property" },
  { g: "Ground 17", mandatory: false, desc: "Discretionary: False or misleading statement to obtain the tenancy" },
];

const PROP_TYPES = ["Detached House","Semi-Detached House","Terraced House","Flat / Apartment","Bungalow","Studio Flat","HMO","Maisonette","Cottage","Other"];
const DEPOSIT_SCHEMES = ["Deposit Protection Service (DPS)","MyDeposits","Tenancy Deposit Scheme (TDS)","Other","None"];

const EXPENSE_CATS = [
  {id:"mortgage",label:"Mortgage Payment",icon:"🏦"},
  {id:"insurance",label:"Buildings Insurance",icon:"🛡️"},
  {id:"repairs",label:"Repairs & Maintenance",icon:"🔧"},
  {id:"management",label:"Letting Agent / Management Fee",icon:"💼"},
  {id:"utilities",label:"Utilities (Void Period)",icon:"💡"},
  {id:"legal",label:"Legal & Professional Fees",icon:"⚖️"},
  {id:"ground_rent",label:"Ground Rent / Service Charge",icon:"🏢"},
  {id:"council_tax",label:"Council Tax (Void)",icon:"🏛️"},
  {id:"furnishings",label:"Furnishings & Equipment",icon:"🛋️"},
  {id:"safety",label:"Safety Inspections & Certs",icon:"📋"},
  {id:"other",label:"Other Expense",icon:"📎"},
];

const ROOM_CONDITIONS = ["Excellent","Good","Fair","Poor","Damaged"];
const DEFAULT_ROOMS = ["Entrance Hall","Living Room","Kitchen","Master Bedroom","Bedroom 2","Bathroom","Garden / Outdoor","Garage / Storage"];

const TEMPLATE_CATS = [
  {id:"rent",label:"Rent"},{id:"inspection",label:"Inspection"},
  {id:"notice",label:"Notices"},{id:"welcome",label:"Welcome"},
  {id:"maintenance",label:"Maintenance"},{id:"general",label:"General"},
];

const BUILT_IN_TEMPLATES = [
  {id:"bi-1",name:"Rent Due Reminder",category:"rent",subject:"Friendly Rent Reminder – [PROPERTY_ADDRESS]",body:"Dear [TENANT_NAME],\n\nThis is a friendly reminder that your monthly rent of [RENT_AMOUNT] for [PROPERTY_ADDRESS] is due on [DUE_DATE].\n\nPlease ensure payment reaches us by the due date.\n\nKind regards,\n[LANDLORD_NAME]",builtin:true},
  {id:"bi-2",name:"Overdue Rent – First Notice",category:"rent",subject:"Urgent: Overdue Rent – [PROPERTY_ADDRESS]",body:"Dear [TENANT_NAME],\n\nWe write to advise that your rent of [RENT_AMOUNT] for [PROPERTY_ADDRESS], due on [DUE_DATE], remains outstanding. Please make payment immediately or contact us to discuss.\n\nYours faithfully,\n[LANDLORD_NAME]",builtin:true},
  {id:"bi-3",name:"Property Inspection Notice",category:"inspection",subject:"Notice of Property Inspection – [PROPERTY_ADDRESS]",body:"Dear [TENANT_NAME],\n\nA routine inspection will be carried out at [PROPERTY_ADDRESS].\n\nDate: [INSPECTION_DATE]\nTime: [INSPECTION_TIME]\n\nWe are required to give at least 24 hours' written notice. Please contact us if inconvenient.\n\nKind regards,\n[LANDLORD_NAME]",builtin:true},
  {id:"bi-4",name:"Welcome to Your New Home",category:"welcome",subject:"Welcome to [PROPERTY_ADDRESS]",body:"Dear [TENANT_NAME],\n\nWelcome to [PROPERTY_ADDRESS]!\n\n• Rent of [RENT_AMOUNT] due on the [RENT_DUE_DAY]th of each month\n• Deposit of [DEPOSIT_AMOUNT] protected with [DEPOSIT_SCHEME]\n• Emergency maintenance: [LANDLORD_PHONE]\n\nKind regards,\n[LANDLORD_NAME]",builtin:true},
  {id:"bi-5",name:"Tenancy Renewal Notice",category:"notice",subject:"Tenancy Renewal – [PROPERTY_ADDRESS]",body:"Dear [TENANT_NAME],\n\nYour tenancy at [PROPERTY_ADDRESS] expires on [END_DATE]. Please advise whether you wish to renew, continue periodically, or vacate. Please respond within 14 days.\n\nKind regards,\n[LANDLORD_NAME]",builtin:true},
  {id:"bi-6",name:"Maintenance Acknowledgement",category:"maintenance",subject:"Maintenance Request Acknowledged – [PROPERTY_ADDRESS]",body:"Dear [TENANT_NAME],\n\nThank you for reporting the maintenance issue at [PROPERTY_ADDRESS]. We will arrange for works to be carried out and a contractor will be in touch shortly.\n\nKind regards,\n[LANDLORD_NAME]",builtin:true},
  {id:"bi-7",name:"End of Tenancy – Deposit Return",category:"notice",subject:"End of Tenancy & Deposit Return – [PROPERTY_ADDRESS]",body:"Dear [TENANT_NAME],\n\nThank you for your tenancy at [PROPERTY_ADDRESS]. Your deposit of [DEPOSIT_AMOUNT] will be returned in full / less deductions of [DEDUCTION_AMOUNT] for [DEDUCTION_REASON]. The balance of [RETURN_AMOUNT] will be returned via [DEPOSIT_SCHEME] within 10 days.\n\nKind regards,\n[LANDLORD_NAME]",builtin:true},
];

const CONTRACTOR_TRADES = [
  "Plumber","Electrician","Gas Engineer","Carpenter & Joiner",
  "Painter & Decorator","Roofer","General Builder","Locksmith",
  "Cleaner","Glazier","Plasterer","Landscaper","Other"
];

const VOID_REASONS = [
  "Between tenancies","Renovation / Refurbishment","Property for sale",
  "Landlord use","Awaiting planning permission","Other"
];

const SA105_ROWS = [
  {box:"20",label:"Total rents and other income from property",cats:null,income:true},
  {box:"24",label:"Buildings & contents insurance premiums",cats:["insurance"],income:false},
  {box:"25",label:"Repairs, maintenance & renewals",cats:["repairs"],income:false},
  {box:"26",label:"Finance charges (mortgage interest)",cats:["mortgage"],income:false},
  {box:"27",label:"Legal, management & professional fees",cats:["legal","management"],income:false},
  {box:"28",label:"Ground rent & service charges",cats:["ground_rent"],income:false},
  {box:"29",label:"Council tax, utilities & other expenses",cats:["council_tax","utilities","safety","other"],income:false},
  {box:"30",label:"Furnishings & equipment (replacement relief)",cats:["furnishings"],income:false},
];

// ══════════════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════════════
const RTR_DOCS = [
  "UK or Irish Passport",
  "Biometric Residence Permit (BRP)",
  "Biometric Residence Card (BRC)",
  "eVisa / Online Immigration Status",
  "Share Code – EU Settled Status",
  "Share Code – EU Pre-Settled Status",
  "Passport with UK Visa / Vignette",
  "Certificate of Application",
  "Other Document",
];
const RTR_TIME_LIMITED = new Set([
  "Share Code – EU Pre-Settled Status",
  "Passport with UK Visa / Vignette",
  "Certificate of Application",
  "Other Document",
]);
const INSP_RATINGS = ["Excellent","Good","Satisfactory","Needs Attention","Urgent Action Required"];
const INSP_ROOMS   = ["Entrance Hall","Living Room","Kitchen","Bedroom 1","Bedroom 2","Bathroom","Garden","Garage / Outbuilding"];

const uid   = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const gbp   = (n) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(n || 0);
const fmt   = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "–";
const fmtLg = (d) => d ? new Date(d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "–";
const daysTo = (d) => d ? Math.ceil((new Date(d).setHours(12,0,0,0) - Date.now()) / 86400000) : null;
const today  = () => new Date().toISOString().slice(0, 10);
const addM   = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x.toISOString().slice(0, 10); };
const certSt = (exp) => { const d = daysTo(exp); if (d === null) return "unknown"; if (d < 0) return "expired"; if (d <= 30) return "expiring"; return "valid"; };
const pad2   = n => String(n).padStart(2,"0");

const downloadCSV = (filename, headers, rows) => {
  const esc = v => `"${String(v==null?"":v).replace(/"/g,'""')}"`;
  const csv = [headers,...rows].map(r=>r.map(esc).join(",")).join("\n");
  const blob = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url; a.download=filename; document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
};

const downloadJSON = (filename, data) => {
  const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url; a.download=filename; document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
};

const hashPassword = async (pw) => {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw));
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
  } catch { return btoa(pw); } // fallback for older browsers
};

const openEmail = (to, subject, body) => {
  if (!to) { alert("No email address saved for this tenant."); return; }
  window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const advanceDate=(date,freq)=>{const d=new Date(date);if(freq==="weekly")d.setDate(d.getDate()+7);else if(freq==="monthly")d.setMonth(d.getMonth()+1);else if(freq==="quarterly")d.setMonth(d.getMonth()+3);else if(freq==="biannual")d.setMonth(d.getMonth()+6);else if(freq==="annual")d.setFullYear(d.getFullYear()+1);return d.toISOString().slice(0,10);};

const autoGenerateRent = (db, saveF) => {
  const active = (db.tenancies||[]).filter(t=>t.status==="active");
  const existing = db.payments||[];
  const now = new Date();
  const added = [];
  active.forEach(ten => {
    const start = new Date(ten.startDate);
    const dueDay = Math.min(parseInt(ten.rentDueDay||1), 28);
    for (let m = 0; m <= 13; m++) {
      const d = new Date(now.getFullYear(), now.getMonth()-m, dueDay);
      if (d > now) continue;
      if (d < start) continue;
      if (ten.endDate && d > new Date(ten.endDate)) continue;
      const ds = d.toISOString().slice(0,10);
      const mk = ds.slice(0,7);
      if (existing.some(p=>p.tenancyId===ten.id&&(p.dueDate||"").slice(0,7)===mk)) continue;
      added.push({id:uid(),landlordId:ten.landlordId,propertyId:ten.propertyId,
        tenancyId:ten.id,amount:ten.rentAmount,dueDate:ds,paidDate:"",
        status:"due",auto:true,notes:"Auto-generated",createdAt:now.toISOString().slice(0,10)});
    }
  });
  if (added.length) saveF("payments",[...existing,...added]);
  return added.length;
};

// ══════════════════════════════════════════════════════════════════
// PERSISTENT STORAGE
// ══════════════════════════════════════════════════════════════════
const DB = {
  async get(k)   { try { const v=localStorage.getItem("lp_"+k); return v?JSON.parse(v):null; } catch { return null; } },
  async set(k,v) { try { localStorage.setItem("lp_"+k,JSON.stringify(v)); return true; } catch { return false; } },
  async del(k)   { try { localStorage.removeItem("lp_"+k); return true; } catch { return false; } },
};

// ══════════════════════════════════════════════════════════════════
// GLOBAL CSS
// ══════════════════════════════════════════════════════════════════
const GCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Playfair+Display:wght@600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{margin:0;background:var(--bg);font-family:'DM Sans',system-ui,sans-serif;transition:background .3s,color .3s;}
  input,select,textarea,button{font-family:'DM Sans',system-ui,sans-serif;}
  input:focus,select:focus,textarea:focus{border-color:#2D5BE3!important;box-shadow:0 0 0 3px rgba(45,91,227,.1)!important;outline:none;}
  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-track{background:#EEF2F7;}
  ::-webkit-scrollbar-thumb{background:#C5D3E8;border-radius:4px;}
  table{width:100%;border-collapse:collapse;}
  th{background:var(--table-head);color:var(--text2);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;padding:11px 16px;text-align:left;border-bottom:1px solid var(--border2);white-space:nowrap;}
  td{padding:13px 16px;border-bottom:1px solid var(--border3);font-size:14px;color:var(--text3);vertical-align:middle;}
  tr:hover td{background:var(--row-hover);}
  @keyframes fadeSlide{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
  .fs{animation:fadeSlide .2s ease;}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.6}}
  .loading{animation:pulse 1.5s infinite;}
  .cal-day:hover{background:var(--cal-hover)!important;cursor:pointer;}
  :root{
    --bg:#EEF2F7;--card:#ffffff;--card-shadow:0 2px 12px rgba(27,43,75,.06);
    --text:#1B2B4B;--text2:#6B7C93;--text3:#4A5568;
    --border:#D5E0EE;--border2:#E8F0FA;--border3:#F0F4FA;
    --input-bg:#FAFCFE;--table-head:#F8FAFD;--row-hover:#F7FAFF;
    --subtle:#F8FAFD;--subtle2:#EEF2F7;--cal-hover:#EBF4FF;
    --topbar:#ffffff;--topbar-border:#E8F0F8;
  }
  .dark-mode{
    --bg:#070E1A;--card:#0F1E33;--card-shadow:0 2px 16px rgba(0,0,0,.5);
    --text:#D4E4FF;--text2:#7A94B8;--text3:#9BB5D0;
    --border:rgba(255,255,255,.1);--border2:rgba(255,255,255,.07);--border3:rgba(255,255,255,.05);
    --input-bg:#172640;--table-head:#0A1628;--row-hover:rgba(45,91,227,.1);
    --subtle:#0F1E33;--subtle2:#152035;--cal-hover:rgba(45,91,227,.15);
    --topbar:#0F1E33;--topbar-border:rgba(255,255,255,.07);
  }
  @media(max-width:768px){
    .sidebar-desktop{display:none!important;}
    .main-no-margin{margin-left:0!important;}
    .stat-grid{grid-template-columns:1fr 1fr!important;gap:14px!important;}
    .two-col{grid-template-columns:1fr!important;}
    .three-col{grid-template-columns:1fr!important;}
    .four-col{grid-template-columns:1fr 1fr!important;}
    .ph-wrap{flex-direction:column!important;align-items:flex-start!important;}
    th,td{padding:9px 10px!important;font-size:12px!important;}
    .mob-full{width:100%!important;}
    .mob-hide{display:none!important;}
    .mob-scroll{overflow-x:auto!important;}
    .topbar-date{display:none!important;}
  }
  @media(max-width:480px){
    .stat-grid{grid-template-columns:1fr!important;}
  }
`;


// ══════════════════════════════════════════════════════════════════
// STYLE TOKENS
// ══════════════════════════════════════════════════════════════════
const T = {
  inp: { width:"100%",padding:"10px 14px",border:"1.5px solid var(--border)",borderRadius:10,fontSize:14,color:"var(--text)",background:"var(--input-bg)" },
  sel: { width:"100%",padding:"10px 14px",border:"1.5px solid var(--border)",borderRadius:10,fontSize:14,color:"var(--text)",background:"var(--input-bg)",cursor:"pointer" },
  tex: { width:"100%",padding:"10px 14px",border:"1.5px solid var(--border)",borderRadius:10,fontSize:14,color:"var(--text)",background:"var(--input-bg)",minHeight:90,resize:"vertical",lineHeight:1.6 },
  pri: { background:"#2D5BE3",color:"white",border:"none",padding:"10px 22px",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:14 },
  sec: { background:"var(--subtle2)",color:"var(--text)",border:"1.5px solid var(--border)",padding:"10px 22px",borderRadius:10,cursor:"pointer",fontWeight:600,fontSize:14 },
  dan: { background:"#E53E3E",color:"white",border:"none",padding:"7px 14px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13 },
  gol: { background:"#E8A838",color:"#1B2B4B",border:"none",padding:"10px 22px",borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:14 },
  grn: { background:"#2AAE7F",color:"white",border:"none",padding:"7px 14px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13 },
  pur: { background:"#7C3AED",color:"white",border:"none",padding:"7px 14px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13 },
};

const BM = {
  valid:    {bg:"#D4FAE6",c:"#1A7A4A",t:"Valid"},
  expiring: {bg:"#FEEBC8",c:"#C05621",t:"Expiring"},
  expired:  {bg:"#FDE8E8",c:"#C53030",t:"Expired"},
  active:   {bg:"#D4FAE6",c:"#1A7A4A",t:"Active"},
  ended:    {bg:"#EDF2F7",c:"#4A5568",t:"Ended"},
  paid:     {bg:"#D4FAE6",c:"#1A7A4A",t:"Paid"},
  overdue:  {bg:"#FDE8E8",c:"#C53030",t:"Overdue"},
  due:      {bg:"#EBF4FF",c:"#2B6CB0",t:"Due"},
  sent:     {bg:"#D4FAE6",c:"#1A7A4A",t:"Sent"},
  section8: {bg:"#FDE8E8",c:"#C53030",t:"Section 8"},
  section13:{bg:"#EBF4FF",c:"#2B6CB0",t:"Section 13"},
};

// ══════════════════════════════════════════════════════════════════
// ATOMS
// ══════════════════════════════════════════════════════════════════
function Bdg({ s }) {
  const b = BM[s] || {bg:"#EDF2F7",c:"#4A5568",t:s||"–"};
  return <span style={{background:b.bg,color:b.c,padding:"3px 12px",borderRadius:20,fontSize:12,fontWeight:700,display:"inline-block",whiteSpace:"nowrap"}}>{b.t}</span>;
}

function Modal({ open, onClose, title, children, width=580 }) {
  if (!open) return null;
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,background:"rgba(10,20,45,.7)",backdropFilter:"blur(4px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div className="fs" style={{background:"white",borderRadius:20,width:"100%",maxWidth:width,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,.3)"}}>
        <div style={{padding:"22px 28px",borderBottom:"1px solid #EEF2F7",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:"var(--card)",zIndex:1,borderRadius:"20px 20px 0 0"}}>
          <h3 style={{fontFamily:"Playfair Display,serif",fontSize:20,color:"#1B2B4B",fontWeight:700}}>{title}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:26,color:"#9BAEC8",lineHeight:1,padding:4}}>×</button>
        </div>
        <div style={{padding:"24px 28px"}}>{children}</div>
      </div>
    </div>
  );
}

function Fld({ label, required, span, children }) {
  return (
    <div style={{marginBottom:18,gridColumn:span?"1/-1":undefined}}>
      <label style={{display:"block",fontSize:13,fontWeight:600,color:"#1B2B4B",marginBottom:6}}>
        {label}{required&&<span style={{color:"#E53E3E"}}> *</span>}
      </label>
      {children}
    </div>
  );
}

function Card({ children, style={} }) {
  return <div style={{background:"var(--card)",borderRadius:16,padding:24,boxShadow:"var(--card-shadow)",...style}}>{children}</div>;
}

function PH({ title, sub, right }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,flexWrap:"wrap",gap:12}}>
      <div>
        <h1 style={{fontFamily:"Playfair Display,serif",fontSize:28,fontWeight:700,color:"var(--text)",lineHeight:1.2}}>{title}</h1>
        {sub&&<p style={{color:"var(--text2)",fontSize:14,marginTop:4}}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

function SC({ label, value, sub, color="#2D5BE3", icon }) {
  return (
    <div style={{background:"white",borderRadius:16,padding:"22px 24px",boxShadow:"0 2px 12px rgba(27,43,75,.06)",borderLeft:`4px solid ${color}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
        <span style={{fontSize:11,color:"var(--text2)",fontWeight:700,textTransform:"uppercase",letterSpacing:".6px"}}>{label}</span>
        <span style={{fontSize:22}}>{icon}</span>
      </div>
      <div style={{fontSize:28,fontWeight:800,color:"#1B2B4B",fontFamily:"Playfair Display,serif",lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontSize:12,color:"#6B7C93",marginTop:6}}>{sub}</div>}
    </div>
  );
}

function Empty({ icon, title, sub }) {
  return (
    <div style={{textAlign:"center",padding:"56px 20px"}}>
      <div style={{fontSize:44,marginBottom:12}}>{icon}</div>
      <div style={{fontFamily:"Playfair Display,serif",fontSize:18,color:"#1B2B4B",fontWeight:700,marginBottom:6}}>{title}</div>
      <div style={{color:"#6B7C93",fontSize:14}}>{sub}</div>
    </div>
  );
}

function GG({ cols=2, gap=16, style={}, children }) {
  return <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap,...style}}>{children}</div>;
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{display:"flex",gap:0,marginBottom:24,background:"white",borderRadius:14,padding:5,boxShadow:"0 2px 12px rgba(27,43,75,.06)",width:"fit-content"}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>onChange(t.id)}
          style={{padding:"9px 22px",borderRadius:10,border:"none",cursor:"pointer",fontSize:13,fontWeight:active===t.id?700:500,background:active===t.id?"#1B2B4B":"transparent",color:active===t.id?"white":"var(--text2)",transition:"all .2s"}}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// NOTICE GENERATORS
// ══════════════════════════════════════════════════════════════════
function genS8Notice({ ten, prop, grounds, arrears, noticeDate, notes, landlord }) {
  const hasMandatory = grounds.some(g => S8_GROUNDS.find(x=>x.g===g)?.mandatory);
  const noticePeriodDays = hasMandatory ? 14 : 28;
  const expDate = new Date(noticeDate);
  expDate.setDate(expDate.getDate() + noticePeriodDays);
  const expStr = expDate.toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"});

  const groundDetails = grounds.map(g => {
    const gd = S8_GROUNDS.find(x=>x.g===g);
    return `  • ${g} — ${gd?.desc||""}`;
  }).join("\n");

  const arrearsPara = (grounds.includes("Ground 8")||grounds.includes("Ground 10")||grounds.includes("Ground 11")) && arrears
    ? `\nRENT ARREARS:\nAs at the date of this notice, the tenant is in rent arrears in the sum of £${arrears}. The tenant is required to pay this sum immediately to avoid proceedings.\n` : "";
  const notesPara = notes ? `\nFURTHER PARTICULARS:\n${notes}\n` : "";

  return `NOTICE SEEKING POSSESSION OF A PROPERTY LET ON AN ASSURED TENANCY
Housing Act 1988 Section 8 as amended by Housing Act 1996

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT — PLEASE READ THIS NOTICE CAREFULLY. If you do not
understand this notice, or if you need help, take it immediately
to a Citizens Advice Bureau, housing aid centre, or solicitor.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TO:       ${ten?.tenantName || "[TENANT NAME]"}
ADDRESS:  ${prop?.address || "[PROPERTY ADDRESS]"}${prop?.postcode ? ", " + prop.postcode : ""}

DATE:     ${fmt(noticeDate)}

FROM:     ${landlord?.name || "[LANDLORD NAME]"}
${landlord?.company ? "          " + landlord.company + "\n" : ""}${landlord?.email ? "          " + landlord.email + "\n" : ""}${landlord?.phone ? "          " + landlord.phone + "\n" : ""}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PROPERTY

   The dwelling-house to which this notice relates is:
   ${prop?.address || "[PROPERTY ADDRESS]"}${prop?.postcode ? ", " + prop.postcode : ""}

2. NOTICE TO QUIT

   I/We, the landlord(s) of the above property, hereby give you
   notice that I/we intend to apply to the court for an order
   requiring you to give up possession of the above property.

3. GROUNDS FOR POSSESSION

   The grounds on which I/we seek possession are:

${groundDetails}
${arrearsPara}${notesPara}
4. NOTICE PERIOD

   ${hasMandatory
     ? "As this notice relies on a MANDATORY ground, possession proceedings\n   may be brought no earlier than 14 days after service of this notice."
     : "As this notice relies on DISCRETIONARY grounds, possession proceedings\n   may be brought no earlier than 2 months after service of this notice."}

   This notice expires on: ${expStr}

   After expiry, proceedings may be begun within 12 months of
   this notice being served.

5. COURT ACTION

   If you do not leave the property voluntarily, the landlord
   will apply to the County Court for a Possession Order.
   You will be able to attend court and state your case.

   ${hasMandatory
     ? "Where mandatory grounds are proved, the court MUST make an order for possession."
     : "Where discretionary grounds are relied upon, the court will only make an order if it considers it reasonable to do so."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Signed: _______________________________

Name:   ${landlord?.name || "[LANDLORD NAME]"}

Date:   ${fmt(noticeDate)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated by LandlordPro | For guidance purposes only.
Always seek qualified legal advice before serving notice.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

function genS13Notice({ ten, prop, currentRent, newRent, noticeDate, effectiveDate, notes, landlord }) {
  const increase = Number(newRent || 0) - Number(currentRent || 0);
  const pct = currentRent ? ((increase / Number(currentRent)) * 100).toFixed(2) : "N/A";
  const notesPara = notes ? `\n5. ADDITIONAL NOTES\n\n   ${notes}\n` : "";

  return `NOTICE OF INCREASE OF RENT
Housing Act 1988 Section 13(2)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORM 4 — LANDLORD'S NOTICE PROPOSING A NEW RENT UNDER AN
ASSURED PERIODIC TENANCY OR AGRICULTURAL OCCUPANCY

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TO:           ${ten?.tenantName || "[TENANT NAME]"}
PROPERTY:     ${prop?.address || "[PROPERTY ADDRESS]"}${prop?.postcode ? ", " + prop.postcode : ""}
DATE:         ${fmt(noticeDate)}
FROM:         ${landlord?.name || "[LANDLORD NAME]"}
${landlord?.company ? "              " + landlord.company + "\n" : ""}${landlord?.email ? "              " + landlord.email + "\n" : ""}${landlord?.phone ? "              " + landlord.phone + "\n" : ""}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PROPOSED NEW RENT

   As from:           ${fmt(effectiveDate) || "[EFFECTIVE DATE]"}

   Current rent:      ${gbp(currentRent || 0)} per month
   Proposed new rent: ${gbp(newRent || 0)} per month
   Increase:          ${gbp(Math.abs(increase))} per month (${pct}%)

2. STATEMENT

   I/We, the landlord(s), give notice under Section 13(2) of
   the Housing Act 1988 that the rent for the above property
   shall be increased to £${newRent || "[NEW RENT]"} per month
   with effect from ${fmt(effectiveDate) || "[EFFECTIVE DATE]"}.

3. TENANT'S RIGHT TO CHALLENGE

   If you consider the proposed new rent is above the market
   rate, you may apply to the First-tier Tribunal (Property
   Chamber) under Section 13(4) of the Housing Act 1988.

   YOU MUST APPLY BEFORE: ${fmt(effectiveDate) || "[EFFECTIVE DATE]"}

   For information on applying to the Tribunal, visit:
   www.gov.uk/rent-tribunal

4. IMPORTANT STATUTORY NOTES

   • This notice can only be used for periodic assured tenancies.
     It cannot be used during a fixed-term tenancy.
   • The rent may not be increased more than once in any period
     of 52 weeks using this procedure.
   • A monthly periodic tenancy requires at least one month's
     notice. A yearly periodic tenancy requires at least 6
     months' notice.
   • The notice period must not end before the day on which
     a complete period of the tenancy expires.
${notesPara}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Signed: _______________________________

Name:   ${landlord?.name || "[LANDLORD NAME]"}

Date:   ${fmt(noticeDate)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated by LandlordPro | For guidance purposes only.
Verify legal requirements before serving this notice.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}


// ══════════════════════════════════════════════════════════════════
// RESPONSIVE HOOK
// ══════════════════════════════════════════════════════════════════
function useWinSize(){
  const[w,setW]=useState(typeof window!=="undefined"?window.innerWidth:1200);
  useEffect(()=>{
    const h=()=>setW(window.innerWidth);
    window.addEventListener("resize",h);
    return()=>window.removeEventListener("resize",h);
  },[]);
  return w;
}

// ══════════════════════════════════════════════════════════════════
// PAGE: AUTH
// ══════════════════════════════════════════════════════════════════
function AuthPage({ db, save, setUser, showToast }) {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name:"",email:"",phone:"",password:"",confirm:"" });
  const [err, setErr] = useState("");
  const upd = k => e => setF(x=>({...x,[k]:e.target.value}));

  const doLogin = async () => {
    setErr("");
    // Built-in system accounts — compare directly (not stored in user data)
    if (f.email === ADMIN_USER.email && f.password === ADMIN_USER.password) {
      setUser(ADMIN_USER); showToast("Welcome back, Administrator!"); return;
    }
    if (f.email === DEMO_LANDLORD.email && f.password === DEMO_LANDLORD.password) {
      setUser(DEMO_LANDLORD); showToast("Welcome! You're using the demo account."); return;
    }
    // Registered landlords — try hash first, then plaintext (auto-upgrades old accounts)
    let hashed = f.password;
    try { hashed = await hashPassword(f.password); } catch {}
    const found = (db.landlords||[]).find(l =>
      l.email.toLowerCase() === f.email.toLowerCase() &&
      (l.password === hashed || l.password === f.password)
    );
    if (found) {
      // Auto-upgrade legacy plaintext to hash
      if (found.password === f.password && found.password !== hashed) {
        save("landlords", (db.landlords||[]).map(l => l.id===found.id ? {...l,password:hashed} : l));
      }
      setUser(found); showToast(`Welcome back, ${found.name}!`);
    } else {
      setErr("Invalid email or password. Please try again.");
    }
  };

  const doRegister = async () => {
    setErr("");
    if (!f.name||!f.email||!f.password) { setErr("Name, email and password are required."); return; }
    if (f.password !== f.confirm) { setErr("Passwords do not match."); return; }
    if (f.password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if ((db.landlords||[]).find(l=>l.email.toLowerCase()===f.email.toLowerCase())) { setErr("Email already registered."); return; }
    const hashed = await hashPassword(f.password);
    const nl = { id:uid(), name:f.name, email:f.email, phone:f.phone||"", password:hashed, role:"landlord", createdAt:today() };
    save("landlords", [...(db.landlords||[]), nl]);
    setUser(nl); showToast(`Welcome to LandlordPro, ${nl.name}!`);
  };

  const inp = { width:"100%",padding:"12px 14px",border:"1.5px solid #D5E0EE",borderRadius:10,fontSize:14,color:"#1B2B4B",background:"white",outline:"none" };

  return (
    <div style={{minHeight:"100vh",display:"flex",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      {/* Left hero */}
      <div style={{flex:1,background:"linear-gradient(155deg,#080F1E 0%,#0D1C38 40%,#142B5A 100%)",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:"40px 60px",position:"relative",overflow:"hidden"}}>
        {/* Decorative rings */}
        {[350,280,210,140].map((s,i)=>(
          <div key={i} style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:s+"%",height:s+"%",border:`1px solid rgba(232,168,56,${0.04+i*0.02})`,borderRadius:"50%",pointerEvents:"none"}} />
        ))}
        <div style={{position:"relative",zIndex:1,maxWidth:460,textAlign:"center"}}>
          <div style={{width:80,height:80,background:"linear-gradient(135deg,#E8A838,#F4C56A)",borderRadius:24,display:"flex",alignItems:"center",justifyContent:"center",fontSize:38,margin:"0 auto 28px",boxShadow:"0 12px 40px rgba(232,168,56,.4)"}}>🏠</div>
          <h1 style={{fontFamily:"Playfair Display,serif",fontSize:44,fontWeight:700,color:"white",lineHeight:1.1,marginBottom:6}}>LandlordPro</h1>
          <div style={{color:"#E8A838",fontSize:11,fontWeight:700,letterSpacing:"4px",textTransform:"uppercase",marginBottom:28}}>UK Property Management</div>
          <p style={{color:"rgba(255,255,255,.65)",fontSize:15,lineHeight:1.85,marginBottom:36}}>
            Your complete private landlord portal. Manage properties, track certificates, collect rent and generate legally compliant Section 8 & 13 notices — all in one secure place.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[["🏢","Property & Tenancy"],["📋","Certificate Tracking"],["💷","Rent Collection"],["📄","Section 8 & 13"],["🔔","Smart Reminders"],["📊","Reports & Analytics"]].map(([ic,lb])=>(
              <div key={lb} style={{background:"rgba(255,255,255,.07)",borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,textAlign:"left",border:"1px solid rgba(255,255,255,.06)"}}>
                <span style={{fontSize:20}}>{ic}</span>
                <span style={{color:"rgba(255,255,255,.8)",fontSize:13,fontWeight:500}}>{lb}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div style={{width:480,background:"white",display:"flex",flexDirection:"column",justifyContent:"center",padding:"50px 48px",overflowY:"auto"}}>
        <div style={{marginBottom:32}}>
          <h2 style={{fontFamily:"Playfair Display,serif",fontSize:30,fontWeight:700,color:"#1B2B4B",lineHeight:1.15}}>{mode==="login"?"Welcome Back":"Create Account"}</h2>
          <p style={{color:"#6B7C93",fontSize:14,marginTop:6}}>{mode==="login"?"Sign in to your landlord portal":"Register your LandlordPro account"}</p>
        </div>

        {err&&<div style={{background:"#FDE8E8",color:"#C53030",padding:"12px 16px",borderRadius:10,marginBottom:20,fontSize:13,fontWeight:500,borderLeft:"3px solid #E53E3E"}}>{err}</div>}

        {mode==="register"&&<>
          <div style={{marginBottom:16}}><label style={{display:"block",fontSize:13,fontWeight:600,color:"#1B2B4B",marginBottom:6}}>Full Name *</label><input value={f.name} onChange={upd("name")} placeholder="John Smith" style={inp} /></div>
          <div style={{marginBottom:16}}><label style={{display:"block",fontSize:13,fontWeight:600,color:"#1B2B4B",marginBottom:6}}>Phone Number</label><input value={f.phone} onChange={upd("phone")} placeholder="07700 900000" style={inp} /></div>
        </>}

        <div style={{marginBottom:16}}><label style={{display:"block",fontSize:13,fontWeight:600,color:"#1B2B4B",marginBottom:6}}>Email Address *</label><input type="email" value={f.email} onChange={upd("email")} placeholder="landlord@email.co.uk" style={inp} /></div>
        <div style={{marginBottom:16}}><label style={{display:"block",fontSize:13,fontWeight:600,color:"#1B2B4B",marginBottom:6}}>Password *</label><input type="password" value={f.password} onChange={upd("password")} placeholder={mode==="login"?"Your password":"Minimum 6 characters"} style={inp} /></div>
        {mode==="register"&&<div style={{marginBottom:20}}><label style={{display:"block",fontSize:13,fontWeight:600,color:"#1B2B4B",marginBottom:6}}>Confirm Password *</label><input type="password" value={f.confirm} onChange={upd("confirm")} placeholder="Repeat password" style={inp} /></div>}

        <button onClick={mode==="login"?doLogin:doRegister}
          style={{width:"100%",padding:14,background:"linear-gradient(135deg,#142B5A,#2D5BE3)",color:"white",border:"none",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer",letterSpacing:".3px",boxShadow:"0 4px 16px rgba(45,91,227,.35)"}}>
          {mode==="login"?"Sign In →":"Create Account →"}
        </button>

        <div style={{textAlign:"center",marginTop:22,fontSize:14}}>
          {mode==="login" ? <>
            <span style={{color:"#6B7C93"}}>Don't have an account? </span>
            <span onClick={()=>{setMode("register");setErr("");setF({name:"",email:"",phone:"",password:"",confirm:""});}} style={{color:"#2D5BE3",fontWeight:700,cursor:"pointer"}}>Register Free</span>
          </> : <>
            <span style={{color:"#6B7C93"}}>Already registered? </span>
            <span onClick={()=>{setMode("login");setErr("");}} style={{color:"#2D5BE3",fontWeight:700,cursor:"pointer"}}>Sign In</span>
          </>}
        </div>


      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE: DASHBOARD
// ══════════════════════════════════════════════════════════════════
function DashboardPage({ ctx }) {
  const { myData, setPage, user } = ctx;
  const { properties, tenancies, payments, certs } = myData;

  const activeTens = tenancies.filter(t=>t.status==="active");
  const monthlyIncome = activeTens.reduce((s,t)=>s+Number(t.rentAmount||0),0);
  const overduePay = payments.filter(p=>p.status==="overdue"||(p.status==="due"&&new Date(p.dueDate)<new Date()));
  const overdueTotal = overduePay.reduce((s,p)=>s+Number(p.amount||0),0);
  const expCerts = certs.filter(c=>{const d=daysTo(c.expiryDate);return d!==null&&d>=0&&d<=30;});
  const expiredCerts = certs.filter(c=>{const d=daysTo(c.expiryDate);return d!==null&&d<0;});

  return (
    <div>
      <PH title={`Welcome back, ${user.name.split(" ")[0]} 👋`} sub={fmtLg(today())} />

      <div className="stat-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,marginBottom:28}}>
        <SC label="Total Properties"  value={properties.length} icon="🏢" color="#2D5BE3" sub={`${activeTens.length} occupied`} />
        <SC label="Monthly Income"   value={gbp(monthlyIncome)} icon="💷" color="#2AAE7F" sub="from active tenancies" />
        <SC label="Overdue Rent"     value={gbp(overdueTotal)} icon="⚠️" color={overdueTotal>0?"#E53E3E":"#2AAE7F"} sub={`${overduePay.length} payment(s)`} />
        <SC label="Cert Alerts"      value={expCerts.length+expiredCerts.length} icon="📋" color={expCerts.length+expiredCerts.length>0?"#E8A838":"#2AAE7F"} sub={`${expiredCerts.length} expired`} />
      </div>

      {/* Alerts banner */}
      {(expiredCerts.length>0||expCerts.length>0||overduePay.length>0)&&(
        <Card style={{marginBottom:24,border:"1px solid #FEE2B6"}}>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:17,fontWeight:700,color:"#1B2B4B",marginBottom:14}}>🚨 Action Required</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {expiredCerts.map(c=>{
              const prop=(myData.properties||[]).find(p=>p.id===c.propertyId);
              const ct=CERT_TYPES.find(x=>x.id===c.type);
              return(<div key={c.id} style={{background:"#FDE8E8",borderRadius:10,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
                <span style={{fontSize:14,color:"#2D3748"}}><strong style={{color:"#C53030"}}>EXPIRED:</strong> {ct?.label} at <strong>{prop?.address||"–"}</strong> — expired {fmt(c.expiryDate)}</span>
                <button onClick={()=>setPage("certs")} style={T.dan}>Renew Now</button>
              </div>);
            })}
            {expCerts.map(c=>{
              const prop=(myData.properties||[]).find(p=>p.id===c.propertyId);
              const ct=CERT_TYPES.find(x=>x.id===c.type);
              const d=daysTo(c.expiryDate);
              return(<div key={c.id} style={{background:"#FEEBC8",borderRadius:10,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
                <span style={{fontSize:14,color:"#2D3748"}}><strong style={{color:"#C05621"}}>EXPIRING IN {d} DAYS:</strong> {ct?.label} at <strong>{prop?.address||"–"}</strong></span>
                <button onClick={()=>setPage("certs")} style={T.gol}>Renew</button>
              </div>);
            })}
            {overduePay.slice(0,3).map(p=>{
              const ten=tenancies.find(t=>t.id===p.tenancyId);
              return(<div key={p.id} style={{background:"#FDE8E8",borderRadius:10,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
                <span style={{fontSize:14,color:"#2D3748"}}><strong style={{color:"#C53030"}}>OVERDUE:</strong> {gbp(p.amount)} from <strong>{ten?.tenantName||"–"}</strong> (due {fmt(p.dueDate)})</span>
                <button onClick={()=>setPage("rent")} style={T.dan}>Manage</button>
              </div>);
            })}
          </div>
        </Card>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:24}}>
        {/* Recent properties */}
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"#1B2B4B"}}>Recent Properties</div>
            <button onClick={()=>setPage("properties")} style={{...T.sec,padding:"7px 14px",fontSize:12}}>View All</button>
          </div>
          {properties.length===0?<Empty icon="🏢" title="No properties yet" sub="Add your first property to begin" />:
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {properties.slice(0,5).map(p=>{
                const ten=activeTens.find(t=>t.propertyId===p.id);
                return(<div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",background:"#F8FAFD",borderRadius:12,border:"1px solid #EBF0FA"}}>
                  <div>
                    <div style={{fontWeight:600,color:"#1B2B4B",fontSize:14}}>{p.address}</div>
                    <div style={{color:"#6B7C93",fontSize:12,marginTop:2}}>{p.type}{p.bedrooms?` • ${p.bedrooms} bed`:""}{p.bathrooms?` • ${p.bathrooms} bath`:""}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontWeight:700,color:"#2D5BE3",fontSize:15}}>{gbp(p.monthlyRent||0)}<span style={{color:"#6B7C93",fontWeight:400,fontSize:11}}>/mo</span></div>
                    <Bdg s={ten?"active":"ended"} />
                  </div>
                </div>);
              })}
            </div>
          }
        </Card>

        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          {/* Quick actions */}
          <Card>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"#1B2B4B",marginBottom:16}}>Quick Actions</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                {label:"Add Property",icon:"🏢",pg:"properties",col:"#2D5BE3"},
                {label:"Record Rent Payment",icon:"💷",pg:"rent",col:"#2AAE7F"},
                {label:"Add Expense",icon:"📉",pg:"finances",col:"#E53E3E"},
                {label:"Upload Document",icon:"📁",pg:"documents",col:"#059669"},
                {label:"Add Certificate",icon:"📋",pg:"certs",col:"#E8A838"},
                {label:"SA105 Tax Summary",icon:"🧾",pg:"sa105",col:"#D97706"},
                {label:"Void Periods",icon:"🏚️",pg:"voids",col:"#C05621"},
                {label:"Contractors",icon:"🔧",pg:"contractors",col:"#7C3AED"},
                {label:"Legal Notice",icon:"📄",pg:"notices",col:"#C53030"},
              ].map(a=>(
                <button key={a.pg} onClick={()=>setPage(a.pg)}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"#F8FAFD",border:"1px solid #EBF0FA",borderRadius:10,cursor:"pointer",fontSize:13,fontWeight:600,color:"#1B2B4B",textAlign:"left",width:"100%"}}>
                  <span style={{width:32,height:32,background:a.col,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{a.icon}</span>
                  {a.label}
                  <span style={{marginLeft:"auto",color:"#9BAEC8"}}>›</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Summary */}
          <Card>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"#1B2B4B",marginBottom:16}}>Portfolio Summary</div>
            {[
              {label:"Properties",val:properties.length,icon:"🏢"},
              {label:"Active Tenancies",val:activeTens.length,icon:"👥"},
              {label:"Vacant",val:Math.max(0,properties.length-activeTens.length),icon:"🔓"},
              {label:"Certificates",val:(myData.certs||[]).length,icon:"📋"},
              {label:"Notices Generated",val:(myData.notices||[]).length,icon:"📄"},
            ].map(r=>(
              <div key={r.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #F0F4FA"}}>
                <span style={{color:"#6B7C93",fontSize:14}}>{r.icon} {r.label}</span>
                <span style={{fontWeight:800,color:"#1B2B4B",fontSize:15}}>{r.val}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE: PROPERTIES
// ══════════════════════════════════════════════════════════════════
function PropertiesPage({ ctx }) {
  const { myData, db, save, showToast, user } = ctx;
  const { properties } = myData;
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [delId, setDelId] = useState(null);
  const blank = { address:"",postcode:"",city:"",type:"Terraced House",bedrooms:"",bathrooms:"",monthlyRent:"",purchasePrice:"",description:"",notes:"" };
  const [f, setF] = useState(blank);
  const upd = k => e => setF(x=>({...x,[k]:e.target.value}));

  const openAdd  = () => { setEditing(null); setF(blank); setModal(true); };
  const openEdit = p  => { setEditing(p); setF({...p}); setModal(true); };

  const doSave = () => {
    if (!f.address) { showToast("Property address is required.","error"); return; }
    const prop = editing ? {...editing,...f} : {...f,id:uid(),landlordId:user.id,createdAt:today()};
    const upd2 = editing ? (db.properties||[]).map(p=>p.id===editing.id?prop:p) : [...(db.properties||[]),prop];
    save("properties", upd2); setModal(false);
    showToast(editing?"Property updated!":"Property added successfully!");
  };

  const doDelete = id => {
    save("properties", (db.properties||[]).filter(p=>p.id!==id));
    save("tenancies",  (db.tenancies||[]).filter(t=>t.propertyId!==id));
    save("payments",   (db.payments||[]).filter(p=>p.propertyId!==id));
    save("certs",      (db.certs||[]).filter(c=>c.propertyId!==id));
    save("expenses",   (db.expenses||[]).filter(e=>e.propertyId!==id));
    save("inventory",  (db.inventory||[]).filter(i=>i.propertyId!==id));
    save("voids",      (db.voids||[]).filter(v=>v.propertyId!==id));
    save("documents",  (db.documents||[]).filter(d=>d.propertyId!==id));
    setDelId(null); showToast("Property deleted.");
  };

  return (
    <div>
      <PH title="Properties" sub={`${properties.length} propert${properties.length===1?"y":"ies"} in your portfolio`}
        right={<button onClick={openAdd} style={T.pri}>+ Add Property</button>} />

      <Card>
        {properties.length===0?<Empty icon="🏢" title="No properties yet" sub='Click "+ Add Property" to get started' />:(
          <div style={{overflowX:"auto"}}>
            <table>
              <thead><tr><th>Property Address</th><th>Type</th><th>Beds/Bath</th><th>Monthly Rent</th><th>Tenancy</th><th style={{textAlign:"right"}}>Actions</th></tr></thead>
              <tbody>
                {properties.map(p=>{
                  const ten=(myData.tenancies||[]).find(t=>t.propertyId===p.id&&t.status==="active");
                  return(<tr key={p.id}>
                    <td><div style={{fontWeight:600,color:"#1B2B4B"}}>{p.address}</div><div style={{color:"#6B7C93",fontSize:12}}>{[p.city,p.postcode].filter(Boolean).join(", ")||"–"}</div></td>
                    <td style={{color:"#4A5568"}}>{p.type||"–"}</td>
                    <td>{p.bedrooms||"–"} / {p.bathrooms||"–"}</td>
                    <td style={{fontWeight:700,color:"#2D5BE3"}}>{gbp(p.monthlyRent||0)}</td>
                    <td><Bdg s={ten?"active":"ended"} /></td>
                    <td style={{textAlign:"right"}}>
                      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                        <button onClick={()=>printPropertyReport(p,myData)} style={{...T.sec,padding:"6px 12px",fontSize:12}}>🖨️</button>
                        <button onClick={()=>openEdit(p)} style={{...T.sec,padding:"6px 14px",fontSize:12}}>Edit</button>
                        <button onClick={()=>setDelId(p.id)} style={T.dan}>Delete</button>
                      </div>
                    </td>
                  </tr>);
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modal} onClose={()=>setModal(false)} title={editing?"Edit Property":"Add New Property"} width={640}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div style={{gridColumn:"1/-1"}}><Fld label="Street Address" required><input value={f.address} onChange={upd("address")} placeholder="12 High Street" style={T.inp} /></Fld></div>
          <Fld label="City / Town"><input value={f.city||""} onChange={upd("city")} placeholder="Manchester" style={T.inp} /></Fld>
          <Fld label="Postcode"><input value={f.postcode||""} onChange={upd("postcode")} placeholder="M1 1AA" style={T.inp} /></Fld>
          <Fld label="Property Type"><select value={f.type} onChange={upd("type")} style={T.sel}>{PROP_TYPES.map(t=><option key={t}>{t}</option>)}</select></Fld>
          <Fld label="Monthly Rent (£)"><input type="number" value={f.monthlyRent||""} onChange={upd("monthlyRent")} placeholder="1200" style={T.inp} min="0" /></Fld>
          <Fld label="Bedrooms"><input type="number" value={f.bedrooms||""} onChange={upd("bedrooms")} placeholder="3" style={T.inp} min="0" /></Fld>
          <Fld label="Bathrooms"><input type="number" value={f.bathrooms||""} onChange={upd("bathrooms")} placeholder="1" style={T.inp} min="0" /></Fld>
          <Fld label="Purchase Price (£)"><input type="number" value={f.purchasePrice||""} onChange={upd("purchasePrice")} placeholder="250000" style={T.inp} min="0" /></Fld>
          <div style={{gridColumn:"1/-1"}}><Fld label="Description"><textarea value={f.description||""} onChange={upd("description")} placeholder="Brief property description…" style={T.tex} /></Fld></div>
          <div style={{gridColumn:"1/-1"}}><Fld label="Private Notes"><textarea value={f.notes||""} onChange={upd("notes")} placeholder="Internal notes (not visible to tenants)…" style={T.tex} /></Fld></div>
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"flex-end",paddingTop:8}}>
          <button onClick={()=>setModal(false)} style={T.sec}>Cancel</button>
          <button onClick={doSave} style={T.pri}>{editing?"Save Changes":"Add Property"}</button>
        </div>
      </Modal>

      <Modal open={!!delId} onClose={()=>setDelId(null)} title="Delete Property" width={420}>
        <p style={{color:"#4A5568",lineHeight:1.7,marginBottom:24}}>Are you sure you want to delete this property? This action cannot be undone. All linked data remains but will be unlinked.</p>
        <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
          <button onClick={()=>setDelId(null)} style={T.sec}>Cancel</button>
          <button onClick={()=>doDelete(delId)} style={T.dan}>Delete Property</button>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE: TENANCIES
// ══════════════════════════════════════════════════════════════════
function TenanciesPage({ ctx }) {
  const { myData, db, save, showToast, user } = ctx;
  const { tenancies, properties } = myData;
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const blank = { propertyId:"",room:"",tenantName:"",tenantEmail:"",tenantPhone:"",startDate:today(),endDate:"",rentAmount:"",depositAmount:"",depositScheme:"Deposit Protection Service (DPS)",rentDueDay:"1",status:"active",notes:"" };
  const [f, setF] = useState(blank);
  const upd = k => e => setF(x=>({...x,[k]:e.target.value}));

  const openAdd  = () => { setEditing(null); setF({...blank,propertyId:properties[0]?.id||"",rentAmount:properties[0]?.monthlyRent||""}); setModal(true); };
  const openEdit = t  => { setEditing(t); setF({...t}); setModal(true); };

  const onPropChange = e => {
    const p=properties.find(x=>x.id===e.target.value);
    setF(x=>({...x,propertyId:e.target.value,rentAmount:p?.monthlyRent||x.rentAmount}));
  };

  const selProp = f.propertyId ? properties.find(p=>p.id===f.propertyId) : null;

  const doSave = () => {
    if (!f.tenantName||!f.propertyId) { showToast("Tenant name and property are required.","error"); return; }
    const ten=editing?{...editing,...f}:{...f,id:uid(),landlordId:user.id,createdAt:today()};
    const updated=editing?(db.tenancies||[]).map(t=>t.id===editing.id?ten:t):[...(db.tenancies||[]),ten];
    save("tenancies",updated); setModal(false);
    showToast(editing?"Tenancy updated!":"Tenancy created!");
  };

  const endTenancy = id => {
    save("tenancies",(db.tenancies||[]).map(t=>t.id===id?{...t,status:"ended",endDate:today()}:t));
    showToast("Tenancy ended.");
  };

  return (
    <div>
      <PH title="Tenancies"
        sub={`${tenancies.filter(t=>t.status==="active").length} active · ${tenancies.filter(t=>t.status==="ended").length} ended`}
        right={<button onClick={openAdd} style={T.pri} disabled={properties.length===0}>+ Add Tenancy</button>} />

      {properties.length===0&&<div style={{background:"#EBF4FF",border:"1px solid #BEE3F8",borderRadius:12,padding:"14px 20px",marginBottom:20,color:"#2B6CB0",fontSize:14,fontWeight:500}}>ℹ️ Add a property first before creating a tenancy.</div>}

      <Card>
        {tenancies.length===0?<Empty icon="👥" title="No tenancies yet" sub="Add your first tenancy agreement" />:(
          <div style={{overflowX:"auto"}}>
            <table>
              <thead><tr><th>Tenant</th><th>Property / Room</th><th>Start</th><th>End / Periodic</th><th>Monthly Rent</th><th>Deposit</th><th>Status</th><th style={{textAlign:"right"}}>Actions</th></tr></thead>
              <tbody>
                {tenancies.map(t=>{
                  const prop=properties.find(p=>p.id===t.propertyId);
                  return(<tr key={t.id}>
                    <td><div style={{fontWeight:600,color:"#1B2B4B"}}>{t.tenantName}</div><div style={{color:"#6B7C93",fontSize:12}}>{t.tenantEmail||"–"}</div></td>
                    <td><div style={{color:"#4A5568",fontSize:13}}>{prop?.address||"–"}</div>{t.room&&<div style={{color:"#7C3AED",fontSize:12,fontWeight:600}}>Room: {t.room}</div>}</td>
                    <td style={{color:"#4A5568"}}>{fmt(t.startDate)}</td>
                    <td>{t.endDate?fmt(t.endDate):<span style={{color:"#2AAE7F",fontWeight:600,fontSize:12}}>Periodic</span>}</td>
                    <td style={{fontWeight:700,color:"#2D5BE3"}}>{gbp(t.rentAmount)}</td>
                    <td>{gbp(t.depositAmount||0)}</td>
                    <td><Bdg s={t.status||"active"} /></td>
                    <td style={{textAlign:"right"}}>
                      <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
                        {t.tenantEmail&&<button onClick={()=>openEmail(t.tenantEmail,"Re: "+prop?.address,"Dear "+t.tenantName+",\n\n")} style={{...T.sec,padding:"5px 10px",fontSize:12}}>✉️</button>}
                        <button onClick={()=>openEdit(t)} style={{...T.sec,padding:"5px 12px",fontSize:12}}>Edit</button>
                        {t.status==="active"&&<button onClick={()=>endTenancy(t.id)} style={T.dan}>End</button>}
                      </div>
                    </td>
                  </tr>);
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modal} onClose={()=>setModal(false)} title={editing?"Edit Tenancy":"New Tenancy Agreement"} width={640}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div style={{gridColumn:"1/-1"}}><Fld label="Property" required><select value={f.propertyId} onChange={onPropChange} style={T.sel}><option value="">-- Select Property --</option>{properties.map(p=><option key={p.id} value={p.id}>{p.address}{p.type==="HMO"?" (HMO)":""}</option>)}</select></Fld></div>
          {selProp?.type==="HMO"&&<div style={{gridColumn:"1/-1"}}><Fld label="Room / Unit (HMO)"><input value={f.room||""} onChange={upd("room")} placeholder="e.g. Room 1, Ground Floor Room" style={T.inp}/></Fld></div>}
          <Fld label="Tenant Full Name" required><input value={f.tenantName} onChange={upd("tenantName")} placeholder="Jane Brown" style={T.inp} /></Fld>
          <Fld label="Tenant Email"><input type="email" value={f.tenantEmail||""} onChange={upd("tenantEmail")} placeholder="jane@email.co.uk" style={T.inp} /></Fld>
          <Fld label="Tenant Phone"><input value={f.tenantPhone||""} onChange={upd("tenantPhone")} placeholder="07700 900000" style={T.inp} /></Fld>
          <Fld label="Rent Due Day (1–28)"><input type="number" value={f.rentDueDay||"1"} onChange={upd("rentDueDay")} min="1" max="28" style={T.inp} /></Fld>
          <Fld label="Start Date" required><input type="date" value={f.startDate} onChange={upd("startDate")} style={T.inp} /></Fld>
          <Fld label="End Date (blank = periodic)"><input type="date" value={f.endDate||""} onChange={upd("endDate")} style={T.inp} /></Fld>
          <Fld label="Monthly Rent (£)" required><input type="number" value={f.rentAmount||""} onChange={upd("rentAmount")} placeholder="1200" style={T.inp} /></Fld>
          <Fld label="Deposit (£)"><input type="number" value={f.depositAmount||""} onChange={upd("depositAmount")} placeholder="1200" style={T.inp} /></Fld>
          <div style={{gridColumn:"1/-1"}}><Fld label="Deposit Protection Scheme"><select value={f.depositScheme} onChange={upd("depositScheme")} style={T.sel}>{DEPOSIT_SCHEMES.map(d=><option key={d}>{d}</option>)}</select></Fld></div>
          <div style={{gridColumn:"1/-1"}}><Fld label="Status"><select value={f.status} onChange={upd("status")} style={T.sel}><option value="active">Active</option><option value="ended">Ended</option></select></Fld></div>
          <div style={{gridColumn:"1/-1"}}><Fld label="Notes"><textarea value={f.notes||""} onChange={upd("notes")} placeholder="Additional notes…" style={T.tex} /></Fld></div>
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"flex-end",paddingTop:8}}>
          <button onClick={()=>setModal(false)} style={T.sec}>Cancel</button>
          <button onClick={doSave} style={T.pri}>{editing?"Save Changes":"Create Tenancy"}</button>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE: RENT LEDGER
// ══════════════════════════════════════════════════════════════════
function RentPage({ ctx }) {
  const { myData, db, save, showToast, user } = ctx;
  const { payments, tenancies, properties } = myData;
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("all");
  const blank = { tenancyId:"",amount:"",dueDate:today(),paidDate:"",status:"due",notes:"" };
  const [f, setF] = useState(blank);
  const upd = k => e => setF(x=>({...x,[k]:e.target.value}));

  const actTens = tenancies.filter(t=>t.status==="active");

  const openAdd = () => {
    const t=actTens[0];
    setEditing(null); setF({...blank,tenancyId:t?.id||"",amount:t?.rentAmount||""}); setModal(true);
  };
  const openEdit = p => { setEditing(p); setF({...p}); setModal(true); };

  const onTenChange = e => {
    const t=tenancies.find(x=>x.id===e.target.value);
    setF(x=>({...x,tenancyId:e.target.value,amount:t?.rentAmount||x.amount}));
  };

  const doSave = () => {
    if (!f.tenancyId||!f.amount||!f.dueDate) { showToast("Tenancy, amount and due date required.","error"); return; }
    const ten=tenancies.find(t=>t.id===f.tenancyId);
    const p=editing?{...editing,...f}:{...f,id:uid(),landlordId:user.id,propertyId:ten?.propertyId||"",createdAt:today()};
    const upd2=editing?(db.payments||[]).map(x=>x.id===editing.id?p:x):[...(db.payments||[]),p];
    save("payments",upd2); setModal(false);
    showToast(editing?"Payment updated!":"Payment recorded!");
  };

  const markPaid = id => {
    save("payments",(db.payments||[]).map(p=>p.id===id?{...p,status:"paid",paidDate:today()}:p));
    showToast("✓ Payment marked as paid!");
  };

  const effStatus = p => (p.status==="due"&&new Date(p.dueDate)<new Date())?"overdue":p.status;
  const filtered  = payments.filter(p=>filter==="all"||effStatus(p)===filter);
  const totalPaid = payments.filter(p=>p.status==="paid").reduce((s,p)=>s+Number(p.amount||0),0);
  const totalDue  = payments.filter(p=>effStatus(p)!=="paid").reduce((s,p)=>s+Number(p.amount||0),0);

  return (
    <div>
      <PH title="Rent Ledger" sub="Track all rent payments across your portfolio"
        right={<div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <button onClick={()=>{const n=autoGenerateRent(db,save);showToast(n?`✓ Generated ${n} rent entr${n===1?"y":"ies"}`:"All entries up to date");}} style={T.sec}>⟳ Auto-Fill</button>
          <button onClick={openAdd} style={T.pri} disabled={actTens.length===0}>+ Record Payment</button>
        </div>} />

      <div className="stat-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,marginBottom:24}}>
        <SC label="Total Collected"  value={gbp(totalPaid)}  icon="✅" color="#2AAE7F" />
        <SC label="Outstanding"      value={gbp(totalDue)}   icon="⏳" color={totalDue>0?"#E8A838":"#2AAE7F"} />
        <SC label="Total Records"    value={payments.length} icon="📋" color="#2D5BE3" />
      </div>

      <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
        {["all","due","overdue","paid"].map(s=>(
          <button key={s} onClick={()=>setFilter(s)}
            style={{padding:"8px 18px",borderRadius:20,border:`1.5px solid ${filter===s?"#2D5BE3":"#D5E0EE"}`,background:filter===s?"#2D5BE3":"white",color:filter===s?"white":"#4A5568",fontWeight:filter===s?700:500,cursor:"pointer",fontSize:13,transition:"all .2s"}}>
            {s==="all"?"All":s.charAt(0).toUpperCase()+s.slice(1)} ({s==="all"?payments.length:payments.filter(p=>effStatus(p)===s).length})
          </button>
        ))}
      </div>

      <Card>
        {filtered.length===0?<Empty icon="💷" title="No payments found" sub="Record payments or adjust the filter" />:(
          <div style={{overflowX:"auto"}}>
            <table>
              <thead><tr><th>Tenant</th><th>Property</th><th>Amount</th><th>Due Date</th><th>Paid Date</th><th>Status</th><th style={{textAlign:"right"}}>Actions</th></tr></thead>
              <tbody>
                {[...filtered].sort((a,b)=>new Date(b.dueDate)-new Date(a.dueDate)).map(p=>{
                  const ten=tenancies.find(t=>t.id===p.tenancyId);
                  const prop=properties.find(x=>x.id===p.propertyId);
                  const st=effStatus(p);
                  return(<tr key={p.id}>
                    <td style={{fontWeight:600,color:"#1B2B4B"}}>{ten?.tenantName||"–"}</td>
                    <td style={{color:"#6B7C93",fontSize:13}}>{prop?.address||"–"}</td>
                    <td style={{fontWeight:700,color:"#1B2B4B"}}>{gbp(p.amount)}</td>
                    <td style={{color:st==="overdue"?"#C53030":undefined}}>{fmt(p.dueDate)}</td>
                    <td>{p.paidDate?fmt(p.paidDate):"–"}</td>
                    <td><Bdg s={st} /></td>
                    <td style={{textAlign:"right"}}>
                      <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
                        {p.status!=="paid"&&<button onClick={()=>markPaid(p.id)} style={T.grn}>✓ Paid</button>}
                        <button onClick={()=>openEdit(p)} style={{...T.sec,padding:"5px 12px",fontSize:12}}>Edit</button>
                      </div>
                    </td>
                  </tr>);
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modal} onClose={()=>setModal(false)} title={editing?"Edit Payment":"Record Rent Payment"}>
        <Fld label="Tenancy" required>
          <select value={f.tenancyId} onChange={onTenChange} style={T.sel}>
            <option value="">-- Select Tenancy --</option>
            {actTens.map(t=>{const p=properties.find(x=>x.id===t.propertyId);return <option key={t.id} value={t.id}>{t.tenantName} – {p?.address||"–"}</option>;})}
          </select>
        </Fld>
        <GG cols={2}>
          <Fld label="Amount (£)" required><input type="number" value={f.amount||""} onChange={upd("amount")} placeholder="1200" style={T.inp} /></Fld>
          <Fld label="Status"><select value={f.status} onChange={upd("status")} style={T.sel}><option value="due">Due</option><option value="paid">Paid</option><option value="overdue">Overdue</option></select></Fld>
          <Fld label="Due Date" required><input type="date" value={f.dueDate} onChange={upd("dueDate")} style={T.inp} /></Fld>
          <Fld label="Paid Date"><input type="date" value={f.paidDate||""} onChange={upd("paidDate")} style={T.inp} /></Fld>
        </GG>
        <Fld label="Notes"><textarea value={f.notes||""} onChange={upd("notes")} placeholder="Notes about this payment…" style={T.tex} /></Fld>
        <div style={{display:"flex",gap:12,justifyContent:"flex-end",paddingTop:8}}>
          <button onClick={()=>setModal(false)} style={T.sec}>Cancel</button>
          <button onClick={doSave} style={T.pri}>{editing?"Save Changes":"Record Payment"}</button>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE: CERTIFICATES
// ══════════════════════════════════════════════════════════════════
function CertsPage({ ctx }) {
  const { myData, db, save, showToast, user } = ctx;
  const { certs, properties } = myData;
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const blank = { propertyId:"",type:"gas",issueDate:today(),expiryDate:addM(today(),12),provider:"",reference:"",notes:"" };
  const [f, setF] = useState(blank);
  const upd = k => e => setF(x=>({...x,[k]:e.target.value}));

  const openAdd  = () => { setEditing(null); setF({...blank,propertyId:properties[0]?.id||""}); setModal(true); };
  const openEdit = c  => { setEditing(c); setF({...c}); setModal(true); };

  const onTypeChange = e => {
    const ct=CERT_TYPES.find(c=>c.id===e.target.value);
    setF(x=>({...x,type:e.target.value,expiryDate:x.issueDate?addM(x.issueDate,ct?.months||12):""}));
  };
  const onIssueDateChange = e => {
    const ct=CERT_TYPES.find(c=>c.id===f.type);
    setF(x=>({...x,issueDate:e.target.value,expiryDate:e.target.value?addM(e.target.value,ct?.months||12):""}));
  };

  const doSave = () => {
    if (!f.propertyId||!f.type||!f.issueDate||!f.expiryDate) { showToast("All required fields must be filled.","error"); return; }
    const cert=editing?{...editing,...f}:{...f,id:uid(),landlordId:user.id,createdAt:today()};
    const upd2=editing?(db.certs||[]).map(c=>c.id===editing.id?cert:c):[...(db.certs||[]),cert];
    save("certs",upd2); setModal(false);
    showToast(editing?"Certificate updated!":"Certificate added!");
  };

  const doDelete = id => { save("certs",(db.certs||[]).filter(c=>c.id!==id)); showToast("Certificate deleted."); };

  const expired  = certs.filter(c=>certSt(c.expiryDate)==="expired");
  const expiring = certs.filter(c=>certSt(c.expiryDate)==="expiring");

  return (
    <div>
      <PH title="Certificates" sub="Track all property compliance certificates and renewal dates"
        right={<button onClick={openAdd} style={T.pri} disabled={properties.length===0}>+ Add Certificate</button>} />

      {(expired.length>0||expiring.length>0)&&(
        <Card style={{marginBottom:24,border:"1px solid #F6B2B2"}}>
          <div style={{fontWeight:700,color:"#C53030",fontSize:15,marginBottom:12}}>🚨 Certificate Alerts ({expired.length+expiring.length})</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
            {expired.map(c=>{const p=properties.find(x=>x.id===c.propertyId);const ct=CERT_TYPES.find(x=>x.id===c.type);return <div key={c.id} style={{background:"#FDE8E8",borderRadius:8,padding:"8px 14px",fontSize:13,color:"#C53030",fontWeight:600}}>{ct?.icon} {ct?.label} @ {p?.address||"–"} — EXPIRED {fmt(c.expiryDate)}</div>;})}
            {expiring.map(c=>{const p=properties.find(x=>x.id===c.propertyId);const ct=CERT_TYPES.find(x=>x.id===c.type);const d=daysTo(c.expiryDate);return <div key={c.id} style={{background:"#FEEBC8",borderRadius:8,padding:"8px 14px",fontSize:13,color:"#C05621",fontWeight:600}}>{ct?.icon} {ct?.label} @ {p?.address||"–"} — expires in {d} days</div>;})}
          </div>
        </Card>
      )}

      <Card>
        {certs.length===0?<Empty icon="📋" title="No certificates yet" sub="Add compliance certificates to track renewals" />:(
          <div style={{overflowX:"auto"}}>
            <table>
              <thead><tr><th>Type</th><th>Property</th><th>Provider</th><th>Issued</th><th>Expires</th><th>Days Left</th><th>Status</th><th style={{textAlign:"right"}}>Actions</th></tr></thead>
              <tbody>
                {[...certs].sort((a,b)=>new Date(a.expiryDate)-new Date(b.expiryDate)).map(c=>{
                  const prop=properties.find(p=>p.id===c.propertyId);
                  const ct=CERT_TYPES.find(x=>x.id===c.type);
                  const st=certSt(c.expiryDate);
                  const d=daysTo(c.expiryDate);
                  return(<tr key={c.id}>
                    <td><div style={{display:"flex",alignItems:"center",gap:8,fontWeight:600,color:"#1B2B4B"}}><span>{ct?.icon||"📋"}</span><span>{ct?.label||c.type}</span></div></td>
                    <td style={{color:"#6B7C93",fontSize:13}}>{prop?.address||"–"}</td>
                    <td style={{color:"#4A5568"}}>{c.provider||"–"}</td>
                    <td>{fmt(c.issueDate)}</td>
                    <td style={{fontWeight:600,color:st==="expired"?"#C53030":st==="expiring"?"#C05621":"#1B2B4B"}}>{fmt(c.expiryDate)}</td>
                    <td style={{fontWeight:700,color:st==="expired"?"#C53030":st==="expiring"?"#C05621":"#2AAE7F"}}>
                      {d===null?"–":d<0?`${Math.abs(d)}d ago`:`${d}d`}
                    </td>
                    <td><Bdg s={st} /></td>
                    <td style={{textAlign:"right"}}>
                      <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
                        <button onClick={()=>openEdit(c)} style={{...T.sec,padding:"5px 12px",fontSize:12}}>Edit</button>
                        <button onClick={()=>doDelete(c.id)} style={T.dan}>Delete</button>
                      </div>
                    </td>
                  </tr>);
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modal} onClose={()=>setModal(false)} title={editing?"Edit Certificate":"Add Certificate"}>
        <Fld label="Property" required><select value={f.propertyId} onChange={upd("propertyId")} style={T.sel}><option value="">-- Select Property --</option>{properties.map(p=><option key={p.id} value={p.id}>{p.address}</option>)}</select></Fld>
        <Fld label="Certificate Type" required><select value={f.type} onChange={onTypeChange} style={T.sel}>{CERT_TYPES.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select></Fld>
        <GG cols={2}>
          <Fld label="Issue Date" required><input type="date" value={f.issueDate} onChange={onIssueDateChange} style={T.inp} /></Fld>
          <Fld label="Expiry Date" required><input type="date" value={f.expiryDate} onChange={upd("expiryDate")} style={T.inp} /></Fld>
          <Fld label="Provider / Contractor"><input value={f.provider||""} onChange={upd("provider")} placeholder="e.g. Gas Safe Engineer" style={T.inp} /></Fld>
          <Fld label="Certificate Reference"><input value={f.reference||""} onChange={upd("reference")} placeholder="Cert number" style={T.inp} /></Fld>
        </GG>
        <Fld label="Notes"><textarea value={f.notes||""} onChange={upd("notes")} placeholder="Any relevant notes…" style={T.tex} /></Fld>
        <div style={{display:"flex",gap:12,justifyContent:"flex-end",paddingTop:8}}>
          <button onClick={()=>setModal(false)} style={T.sec}>Cancel</button>
          <button onClick={doSave} style={T.pri}>{editing?"Save Changes":"Add Certificate"}</button>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE: LEGAL NOTICES
// ══════════════════════════════════════════════════════════════════
function NoticesPage({ ctx }) {
  const { myData, db, save, showToast, user } = ctx;
  const { notices, tenancies, properties } = myData;
  const [tab, setTab] = useState("s8");
  const [viewNotice, setViewNotice] = useState(null);

  const [s8, setS8] = useState({ tenancyId:"",grounds:[],arrears:"",noticeDate:today(),notes:"" });
  const [s13, setS13] = useState({ tenancyId:"",currentRent:"",newRent:"",noticeDate:today(),effectiveDate:"",notes:"" });

  const upd8  = k => e => setS8(x=>({...x,[k]:e.target.value}));
  const upd13 = k => e => setS13(x=>({...x,[k]:e.target.value}));

  const actTens = tenancies.filter(t=>t.status==="active");

  const onS13TenChange = e => {
    const t=tenancies.find(x=>x.id===e.target.value);
    setS13(x=>({...x,tenancyId:e.target.value,currentRent:t?.rentAmount||""}));
  };

  const toggleGround = g => setS8(x=>({...x,grounds:x.grounds.includes(g)?x.grounds.filter(x=>x!==g):[...x.grounds,g]}));

  const genSection8 = () => {
    if (!s8.tenancyId||s8.grounds.length===0) { showToast("Select a tenancy and at least one ground.","error"); return; }
    const ten=tenancies.find(t=>t.id===s8.tenancyId);
    const prop=properties.find(p=>p.id===ten?.propertyId);
    const content=genS8Notice({ten,prop,grounds:s8.grounds,arrears:s8.arrears,noticeDate:s8.noticeDate,notes:s8.notes,landlord:user});
    const n={id:uid(),landlordId:user.id,type:"section8",tenancyId:s8.tenancyId,propertyId:ten?.propertyId||"",generatedDate:today(),data:{...s8},content};
    save("notices",[...(db.notices||[]),n]);
    setViewNotice({content,title:"Section 8 Notice – Housing Act 1988"});
    showToast("Section 8 notice generated and saved!");
  };

  const genSection13 = () => {
    if (!s13.tenancyId||!s13.newRent||!s13.effectiveDate) { showToast("Fill all required fields.","error"); return; }
    const ten=tenancies.find(t=>t.id===s13.tenancyId);
    const prop=properties.find(p=>p.id===ten?.propertyId);
    const content=genS13Notice({ten,prop,...s13,landlord:user});
    const n={id:uid(),landlordId:user.id,type:"section13",tenancyId:s13.tenancyId,propertyId:ten?.propertyId||"",generatedDate:today(),data:{...s13},content};
    save("notices",[...(db.notices||[]),n]);
    setViewNotice({content,title:"Section 13 Notice – Housing Act 1988"});
    showToast("Section 13 notice generated and saved!");
  };

  const printNotice = (content) => {
    const w=window.open("","_blank","width=900,height=700");
    w.document.write(`<!DOCTYPE html><html><head><title>LandlordPro Notice</title><style>body{font-family:'Courier New',monospace;font-size:13px;padding:40px;max-width:760px;margin:auto;line-height:1.9;color:#111;}pre{white-space:pre-wrap;font-family:inherit;}</style></head><body><pre>${content}</pre></body></html>`);
    w.document.close(); w.print();
  };

  const InfoPanel = ({ items }) => (
    <Card style={{background:"linear-gradient(160deg,#080F1E,#142B5A)",color:"white"}}>
      {items.map(i=>(
        <div key={i.title} style={{marginBottom:18,paddingBottom:18,borderBottom:"1px solid rgba(255,255,255,.08)"}}>
          <div style={{color:"#E8A838",fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>{i.title}</div>
          <div style={{color:"rgba(255,255,255,.72)",fontSize:13,lineHeight:1.7}}>{i.text}</div>
        </div>
      ))}
      <div style={{background:"rgba(232,168,56,.12)",borderRadius:10,padding:"12px 14px",fontSize:12,color:"rgba(255,255,255,.75)",lineHeight:1.7,border:"1px solid rgba(232,168,56,.2)"}}>
        ⚠️ These notices are generated as guidance only. Always seek qualified legal advice before serving notice on a tenant.
      </div>
    </Card>
  );

  return (
    <div>
      <PH title="Legal Notices" sub="Generate legally compliant UK housing possession & rent notices" />

      <Tabs tabs={[{id:"s8",label:"Section 8 Notice"},{id:"s13",label:"Section 13 Rent Increase"},{id:"history",label:"Notice History"}]} active={tab} onChange={setTab} />

      {tab==="s8"&&(
        <GG cols={2} gap={24}>
          <Card>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:20,fontWeight:700,color:"#1B2B4B",marginBottom:4}}>Section 8 – Notice Seeking Possession</div>
            <div style={{color:"#6B7C93",fontSize:13,marginBottom:22,lineHeight:1.6}}>Housing Act 1988 Section 8. Used when the tenant has breached the tenancy agreement, typically rent arrears.</div>
            {actTens.length===0?<div style={{background:"#EBF4FF",borderRadius:10,padding:16,color:"#2B6CB0",fontSize:14}}>No active tenancies found. Please create a tenancy first.</div>:<>
              <Fld label="Tenancy" required><select value={s8.tenancyId} onChange={upd8("tenancyId")} style={T.sel}><option value="">-- Select Tenancy --</option>{actTens.map(t=>{const p=properties.find(x=>x.id===t.propertyId);return <option key={t.id} value={t.id}>{t.tenantName} – {p?.address||"–"}</option>;})}</select></Fld>
              <GG cols={2}>
                <Fld label="Notice Date" required><input type="date" value={s8.noticeDate} onChange={upd8("noticeDate")} style={T.inp} /></Fld>
                <Fld label="Rent Arrears (£)"><input type="number" value={s8.arrears||""} onChange={upd8("arrears")} placeholder="0.00" style={T.inp} /></Fld>
              </GG>
              <Fld label="Grounds (select all that apply)" required>
                <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:4}}>
                  {S8_GROUNDS.map(g=>(
                    <label key={g.g} style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",padding:"10px 14px",borderRadius:10,background:s8.grounds.includes(g.g)?"#EBF4FF":"#FAFCFE",border:`1.5px solid ${s8.grounds.includes(g.g)?"#2D5BE3":"#E8F0FA"}`,transition:"all .15s"}}>
                      <input type="checkbox" checked={s8.grounds.includes(g.g)} onChange={()=>toggleGround(g.g)} style={{marginTop:2,flexShrink:0}} />
                      <div>
                        <div style={{fontWeight:700,fontSize:13,color:g.mandatory?"#C53030":"#1B2B4B"}}>{g.g} {g.mandatory?"✦ Mandatory":"(Discretionary)"}</div>
                        <div style={{fontSize:12,color:"#6B7C93",marginTop:2,lineHeight:1.5}}>{g.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </Fld>
              <Fld label="Additional Notes"><textarea value={s8.notes||""} onChange={upd8("notes")} placeholder="Additional particulars of the grounds…" style={T.tex} /></Fld>
              <button onClick={genSection8} style={{...T.pri,width:"100%",padding:14,fontSize:15,borderRadius:12,boxShadow:"0 4px 16px rgba(45,91,227,.3)"}}>Generate Section 8 Notice →</button>
            </>}
          </Card>
          <InfoPanel items={[
            {title:"When to use",text:"Section 8 is served when your tenant has breached the tenancy, most commonly due to rent arrears of 2+ months."},
            {title:"Notice period",text:"2 weeks minimum for Ground 8 (mandatory). 2 months minimum for discretionary grounds."},
            {title:"Court proceedings",text:"After the notice period expires, if the tenant hasn't vacated you can apply to the County Court for a Possession Order."},
            {title:"Mandatory vs discretionary",text:"Mandatory grounds (Ground 8): court MUST grant possession if proven. Discretionary: court decides if it's reasonable."},
          ]} />
        </GG>
      )}

      {tab==="s13"&&(
        <GG cols={2} gap={24}>
          <Card>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:20,fontWeight:700,color:"#1B2B4B",marginBottom:4}}>Section 13 – Rent Increase Notice</div>
            <div style={{color:"#6B7C93",fontSize:13,marginBottom:22,lineHeight:1.6}}>Housing Act 1988 Section 13(2). Formal notice to increase rent on a periodic assured tenancy.</div>
            {actTens.length===0?<div style={{background:"#EBF4FF",borderRadius:10,padding:16,color:"#2B6CB0",fontSize:14}}>No active tenancies found.</div>:<>
              <Fld label="Tenancy" required><select value={s13.tenancyId} onChange={onS13TenChange} style={T.sel}><option value="">-- Select Tenancy --</option>{actTens.map(t=>{const p=properties.find(x=>x.id===t.propertyId);return <option key={t.id} value={t.id}>{t.tenantName} – {p?.address||"–"}</option>;})}</select></Fld>
              <GG cols={2}>
                <Fld label="Current Monthly Rent (£)"><input type="number" value={s13.currentRent||""} onChange={upd13("currentRent")} placeholder="1200" style={T.inp} /></Fld>
                <Fld label="New Monthly Rent (£)" required><input type="number" value={s13.newRent||""} onChange={upd13("newRent")} placeholder="1350" style={T.inp} /></Fld>
                <Fld label="Notice Date" required><input type="date" value={s13.noticeDate} onChange={upd13("noticeDate")} style={T.inp} /></Fld>
                <Fld label="Effective From" required><input type="date" value={s13.effectiveDate||""} onChange={upd13("effectiveDate")} style={T.inp} /></Fld>
              </GG>
              {s13.currentRent&&s13.newRent&&(
                <div style={{background:"#EBF8F0",borderRadius:10,padding:"14px 16px",marginBottom:16,border:"1px solid #9AE6B4"}}>
                  <div style={{fontWeight:700,color:"#2AAE7F",fontSize:13,marginBottom:4}}>Rent Increase Summary</div>
                  <div style={{color:"#2D3748",fontSize:14}}>
                    Increase: <strong>{gbp(Number(s13.newRent||0)-Number(s13.currentRent||0))}/month</strong>
                    {" "}({s13.currentRent?((((Number(s13.newRent||0)-Number(s13.currentRent||0))/Number(s13.currentRent||1))*100).toFixed(1)):"0"}%)
                  </div>
                </div>
              )}
              <Fld label="Additional Notes"><textarea value={s13.notes||""} onChange={upd13("notes")} placeholder="Any additional information…" style={T.tex} /></Fld>
              <button onClick={genSection13} style={{...T.pri,width:"100%",padding:14,fontSize:15,borderRadius:12,boxShadow:"0 4px 16px rgba(45,91,227,.3)"}}>Generate Section 13 Notice →</button>
            </>}
          </Card>
          <InfoPanel items={[
            {title:"When to use",text:"Use Section 13 to formally increase the rent of a periodic (rolling month-to-month) assured tenancy."},
            {title:"Notice period",text:"At least 1 month for monthly tenancies. At least 6 months for yearly tenancies. Cannot increase rent more than once in 12 months."},
            {title:"Tenant rights",text:"The tenant can refer the proposed rent to the First-tier Tribunal (Property Chamber) if they believe it exceeds market rate."},
            {title:"Fixed-term tenancies",text:"Section 13 cannot be used during a fixed-term. Wait for the tenancy to become periodic or include a review clause in the agreement."},
          ]} />
        </GG>
      )}

      {tab==="history"&&(
        <Card>
          {notices.length===0?<Empty icon="📄" title="No notices generated yet" sub="Generate a Section 8 or Section 13 notice to see history" />:(
            <div style={{overflowX:"auto"}}>
              <table>
                <thead><tr><th>Type</th><th>Tenant</th><th>Property</th><th>Generated</th><th style={{textAlign:"right"}}>Actions</th></tr></thead>
                <tbody>
                  {[...notices].sort((a,b)=>new Date(b.generatedDate)-new Date(a.generatedDate)).map(n=>{
                    const ten=tenancies.find(t=>t.id===n.tenancyId);
                    const prop=properties.find(p=>p.id===n.propertyId);
                    return(<tr key={n.id}>
                      <td><Bdg s={n.type} /></td>
                      <td style={{fontWeight:600}}>{ten?.tenantName||"–"}</td>
                      <td style={{color:"#6B7C93",fontSize:13}}>{prop?.address||"–"}</td>
                      <td>{fmt(n.generatedDate)}</td>
                      <td style={{textAlign:"right"}}>
                        <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
                          <button onClick={()=>setViewNotice({content:n.content,title:n.type==="section8"?"Section 8 Notice":"Section 13 Notice"})} style={{...T.sec,padding:"5px 14px",fontSize:12}}>View</button>
                          <button onClick={()=>printNotice(n.content)} style={{...T.gol,padding:"5px 14px",fontSize:12}}>Print</button>
                        </div>
                      </td>
                    </tr>);
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <Modal open={!!viewNotice} onClose={()=>setViewNotice(null)} title={viewNotice?.title||"Notice"} width={740}>
        <div style={{background:"#F8FAFD",borderRadius:12,padding:22,fontFamily:"'Courier New',monospace",fontSize:12.5,lineHeight:1.9,whiteSpace:"pre-wrap",color:"#1B2B4B",maxHeight:520,overflowY:"auto",border:"1px solid #E8F0FA"}}>{viewNotice?.content}</div>
        <div style={{display:"flex",gap:12,justifyContent:"flex-end",paddingTop:16}}>
          <button onClick={()=>printNotice(viewNotice?.content)} style={T.gol}>🖨️ Print Notice</button>
          <button onClick={()=>setViewNotice(null)} style={T.sec}>Close</button>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE: REMINDERS
// ══════════════════════════════════════════════════════════════════
function RemindersPage({ ctx }) {
  const { myData, db, save, showToast, user, setPage } = ctx;
  const { reminders, certs, tenancies, payments, properties } = myData;
  const recurring = myData.recurring||[];
  const [tab,      setTab]      = useState("alerts");
  const [modal,    setModal]    = useState(false);
  const [recModal, setRecModal] = useState(false);
  const [recEdit,  setRecEdit]  = useState(null);
  const FREQS=[{v:"weekly",l:"Every Week"},{v:"monthly",l:"Every Month"},{v:"quarterly",l:"Every 3 Months"},{v:"biannual",l:"Every 6 Months"},{v:"annual",l:"Every Year"}];
  const recBlank={tenancyId:"",type:"rent_reminder",message:"",frequency:"monthly",nextDate:today(),active:true};
  const [rf, setRf] = useState(recBlank);
  const rupd = k=>e=>setRf(x=>({...x,[k]:e.target.value}));
  const [f, setF] = useState({ tenancyId:"",type:"rent_reminder",message:"",scheduledDate:today() });
  const upd = k => e => setF(x=>({...x,[k]:e.target.value}));
  const actTens = tenancies.filter(t=>t.status==="active");
  const dueRec = recurring.filter(r=>r.active&&r.nextDate&&r.nextDate<=today());

  const doSaveRec=()=>{
    if(!rf.tenancyId||!rf.message){showToast("Tenancy and message required.","error");return;}
    const ten=tenancies.find(t=>t.id===rf.tenancyId);
    const r=recEdit?{...recEdit,...rf}:{...rf,id:uid(),landlordId:user.id,tenantName:ten?.tenantName||"",tenantEmail:ten?.tenantEmail||"",createdAt:today()};
    const u2=recEdit?(db.recurring||[]).map(x=>x.id===recEdit.id?r:x):[...(db.recurring||[]),r];
    save("recurring",u2);setRecModal(false);showToast(recEdit?"Updated!":"Scheduled!");
  };
  const markRecSent=r=>{
    const logEntry={id:uid(),landlordId:user.id,tenancyId:r.tenancyId,tenantName:r.tenantName,tenantEmail:r.tenantEmail,type:r.type,message:r.message,scheduledDate:r.nextDate,sentAt:today(),status:"sent"};
    const nextDate=advanceDate(r.nextDate,r.frequency);
    save("reminders",[...(db.reminders||[]),logEntry]);
    save("recurring",(db.recurring||[]).map(x=>x.id===r.id?{...x,nextDate,lastSent:today()}:x));
    showToast("✓ Sent & next scheduled: "+fmt(nextDate));
  };
  const delRec=id=>{save("recurring",(db.recurring||[]).filter(r=>r.id!==id));showToast("Deleted.");};

  // Build auto-alerts
  const alerts = [];
  certs.forEach(c=>{
    const d=daysTo(c.expiryDate);
    const ct=CERT_TYPES.find(x=>x.id===c.type);
    const prop=properties.find(p=>p.id===c.propertyId);
    if (d!==null&&d<0) alerts.push({id:"exp-"+c.id,type:"cert_expired",urg:"critical",msg:`${ct?.label} at ${prop?.address||"–"} EXPIRED (${fmt(c.expiryDate)})`});
    else if (d!==null&&d<=30) alerts.push({id:"exp-"+c.id,type:"cert_expiring",urg:d<7?"high":"medium",msg:`${ct?.label} at ${prop?.address||"–"} expires in ${d} day${d===1?"":"s"} (${fmt(c.expiryDate)})`});
  });
  payments.forEach(p=>{
    const t=tenancies.find(x=>x.id===p.tenancyId);
    if (p.status==="overdue"||(p.status==="due"&&new Date(p.dueDate)<new Date())) {
      alerts.push({id:"ov-"+p.id,type:"rent_overdue",urg:"high",msg:`Overdue rent ${gbp(p.amount)} from ${t?.tenantName||"–"} (due ${fmt(p.dueDate)})`});
    }
  });
  if(dueRec.length) alerts.push(...dueRec.map(r=>({id:"rec-"+r.id,urg:"medium",msg:`Scheduled reminder due: ${r.tenantName} — ${r.message.slice(0,60)}…`})));

  const urgConf = { critical:{bg:"#FDE8E8",c:"#C53030",dot:"#E53E3E",lbl:"Critical"}, high:{bg:"#FEEBC8",c:"#C05621",dot:"#E8A838",lbl:"High"}, medium:{bg:"#EBF4FF",c:"#2B6CB0",dot:"#2D5BE3",lbl:"Medium"} };

  const sendReminder = () => {
    if (!f.tenancyId||!f.message) { showToast("Please select a tenancy and enter a message.","error"); return; }
    const ten=tenancies.find(t=>t.id===f.tenancyId);
    const r={id:uid(),landlordId:user.id,tenancyId:f.tenancyId,tenantName:ten?.tenantName||"",tenantEmail:ten?.tenantEmail||"",type:f.type,message:f.message,scheduledDate:f.scheduledDate,sentAt:today(),status:"sent"};
    save("reminders",[...(db.reminders||[]),r]); setModal(false);
    showToast(`✓ Reminder logged for ${ten?.tenantName}!`);
  };

  const TYPES = [
    {v:"rent_reminder",l:"Rent Payment Reminder"},{v:"rent_overdue",l:"Overdue Rent Notice"},
    {v:"inspection",l:"Property Inspection Notice"},{v:"cert_renewal",l:"Certificate Renewal Notice"},
    {v:"tenancy_renewal",l:"Tenancy Renewal Notice"},{v:"general",l:"General Communication"},
  ];

  return (
    <div>
      <PH title="Reminders" sub="System alerts, one-off and scheduled tenant communications"
        right={<div style={{display:"flex",gap:10}}><button onClick={()=>{setRecEdit(null);setRf({...recBlank,tenancyId:actTens[0]?.id||""});setRecModal(true);}} style={T.sec}>🔁 Schedule</button><button onClick={()=>{setF({tenancyId:actTens[0]?.id||"",type:"rent_reminder",message:"",scheduledDate:today()});setModal(true);}} style={T.pri}>+ Send Reminder</button></div>} />

      <Tabs tabs={[{id:"alerts",label:`Alerts${alerts.length>0?` (${alerts.length})`:""}`},{id:"recurring",label:`Scheduled (${recurring.length})`},{id:"log",label:`Log (${reminders.length})`}]} active={tab} onChange={setTab}/>

      {/* ── ALERTS TAB ── */}
      {tab==="alerts"&&(<div>
        {alerts.length===0?(<Card><Empty icon="✅" title="No alerts" sub="All certificates, rent and reminders are up to date"/></Card>):(
          <Card>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {alerts.map(a=>{const uc=urgConf[a.urg]||urgConf.medium;return(<div key={a.id} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",background:uc.bg,borderRadius:10,border:`1px solid ${uc.dot}20`}}><div style={{width:10,height:10,borderRadius:"50%",background:uc.dot,flexShrink:0}}/><span style={{flex:1,fontSize:14,color:"#2D3748"}}>{a.msg}</span><span style={{background:uc.dot+"25",color:uc.c,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,flexShrink:0}}>{uc.lbl}</span></div>);})}
            </div>
          </Card>
        )}
      </div>)}

      {/* ── RECURRING TAB ── */}
      {tab==="recurring"&&(<div>
        {dueRec.length>0&&(<Card style={{marginBottom:16,border:"1px solid #E53E3E40"}}><div style={{fontWeight:700,color:"#C53030",marginBottom:10}}>🔴 {dueRec.length} reminder{dueRec.length>1?"s":""} due now</div><div style={{display:"flex",flexDirection:"column",gap:8}}>{dueRec.map(r=>(<div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8,padding:"10px 14px",background:"#FDE8E8",borderRadius:10}}><div><div style={{fontWeight:600}}>{r.tenantName}</div><div style={{fontSize:13,color:"#C53030"}}>{r.message.slice(0,80)}</div></div><div style={{display:"flex",gap:8}}>{r.tenantEmail&&<button onClick={()=>openEmail(r.tenantEmail,"Reminder",r.message)} style={{...T.sec,padding:"6px 12px",fontSize:12}}>✉️ Email</button>}<button onClick={()=>markRecSent(r)} style={{...T.pri,padding:"6px 12px",fontSize:12}}>✓ Send &amp; Schedule Next</button></div></div>))}</div></Card>)}
        {recurring.length===0?(<Card><Empty icon="🔁" title="No scheduled reminders" sub='Click "🔁 Schedule" to set up repeating reminders'/></Card>):(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {recurring.map(r=>{const prop=properties.find(p=>p.id===tenancies.find(t=>t.id===r.tenancyId)?.propertyId);const isDue=r.nextDate<=today();return(<Card key={r.id} style={{border:`1px solid ${isDue?"#E53E3E":"var(--border2)"}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:44,height:44,background:"#EBF4FF",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🔁</div>
                <div><div style={{fontWeight:700,color:"var(--text)",fontSize:15}}>{r.tenantName} {!r.active&&<span style={{background:"var(--subtle2)",color:"var(--text2)",fontSize:11,padding:"1px 7px",borderRadius:8}}>Paused</span>}</div><div style={{color:"var(--text2)",fontSize:13,marginTop:2}}>{prop?.address||"–"} · {FREQS.find(f=>f.v===r.frequency)?.l}</div><div style={{fontSize:12,color:"var(--text2)",marginTop:2}}>Next: <strong style={{color:isDue?"#E53E3E":"var(--text)"}}>{fmt(r.nextDate)}</strong>{r.lastSent?` · Last: ${fmt(r.lastSent)}`:""}</div><div style={{fontSize:12,color:"var(--text3)",marginTop:4,maxWidth:400}}>{r.message.slice(0,100)}{r.message.length>100?"…":""}</div></div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button onClick={()=>save("recurring",(db.recurring||[]).map(x=>x.id===r.id?{...x,active:!x.active}:x))} style={{...T.sec,padding:"6px 12px",fontSize:12}}>{r.active?"Pause":"Resume"}</button>
                <button onClick={()=>{setRecEdit(r);setRf({tenancyId:r.tenancyId,type:r.type,message:r.message,frequency:r.frequency,nextDate:r.nextDate,active:r.active});setRecModal(true);}} style={{...T.sec,padding:"6px 12px",fontSize:12}}>Edit</button>
                <button onClick={()=>delRec(r.id)} style={T.dan}>Del</button>
              </div>
            </Card>);})}
          </div>
        )}
        <Modal open={recModal} onClose={()=>setRecModal(false)} title={recEdit?"Edit Scheduled Reminder":"Schedule Recurring Reminder"}>
          <Fld label="Tenancy" required><select value={rf.tenancyId} onChange={rupd("tenancyId")} style={T.sel}><option value="">-- Select --</option>{actTens.map(t=>{const p=properties.find(x=>x.id===t.propertyId);return <option key={t.id} value={t.id}>{t.tenantName} – {p?.address||"–"}</option>;})}</select></Fld>
          <GG cols={2}><Fld label="Frequency"><select value={rf.frequency} onChange={rupd("frequency")} style={T.sel}>{FREQS.map(f=><option key={f.v} value={f.v}>{f.l}</option>)}</select></Fld><Fld label="First/Next Due"><input type="date" value={rf.nextDate} onChange={rupd("nextDate")} style={T.inp}/></Fld></GG>
          <Fld label="Type"><select value={rf.type} onChange={rupd("type")} style={T.sel}>{TYPES.map(x=><option key={x.v} value={x.v}>{x.l}</option>)}</select></Fld>
          <Fld label="Message" required><textarea value={rf.message} onChange={rupd("message")} placeholder="Message sent to tenant each time…" style={{...T.tex,minHeight:110}}/></Fld>
          <div style={{display:"flex",gap:12,justifyContent:"flex-end",paddingTop:8}}><button onClick={()=>setRecModal(false)} style={T.sec}>Cancel</button><button onClick={doSaveRec} style={T.pri}>{recEdit?"Save":"Schedule"}</button></div>
        </Modal>
      </div>)}

      {/* ── LOG TAB ── */}
      {tab==="log"&&(<Card>
        {reminders.length===0?<Empty icon="🔔" title="No reminders sent yet" sub='Click "+ Send Reminder" to notify a tenant' />:(
          <table>
            <thead><tr><th>Tenant</th><th>Type</th><th>Message</th><th>Sent Date</th><th>Status</th></tr></thead>
            <tbody>
              {[...reminders].sort((a,b)=>new Date(b.sentAt)-new Date(a.sentAt)).map(r=>(
                <tr key={r.id}>
                  <td><div style={{fontWeight:600}}>{r.tenantName||"–"}</div><div style={{color:"#6B7C93",fontSize:12}}>{r.tenantEmail||"–"}</div></td>
                  <td style={{color:"#6B7C93",fontSize:13}}>{TYPES.find(x=>x.v===r.type)?.l||r.type}</td>
                  <td style={{maxWidth:280,color:"#4A5568",fontSize:13}}>{r.message}</td>
                  <td>{fmt(r.sentAt)}</td>
                  <td><Bdg s="sent" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>)}

      <Modal open={modal} onClose={()=>setModal(false)} title="Send Tenant Reminder">
        <Fld label="Tenancy" required>
          <select value={f.tenancyId} onChange={upd("tenancyId")} style={T.sel}>
            <option value="">-- Select Tenancy --</option>
            {actTens.map(t=>{const p=properties.find(x=>x.id===t.propertyId);return <option key={t.id} value={t.id}>{t.tenantName} – {p?.address||"–"} ({t.tenantEmail||"no email"})</option>;})}
          </select>
        </Fld>
        <Fld label="Reminder Type"><select value={f.type} onChange={upd("type")} style={T.sel}>{TYPES.map(x=><option key={x.v} value={x.v}>{x.l}</option>)}</select></Fld>
        <Fld label="Message" required><textarea value={f.message} onChange={upd("message")} placeholder="Write your message to the tenant…" style={{...T.tex,minHeight:120}} /></Fld>
        <Fld label="Date"><input type="date" value={f.scheduledDate} onChange={upd("scheduledDate")} style={T.inp} /></Fld>
        <div style={{display:"flex",gap:12,justifyContent:"flex-end",flexWrap:"wrap"}}>
          <button onClick={()=>setModal(false)} style={T.sec}>Cancel</button>
          <button onClick={()=>{
            const ten=tenancies.find(t=>t.id===f.tenancyId);
            if(ten?.tenantEmail&&f.message){openEmail(ten.tenantEmail,"LandlordPro: "+f.message.slice(0,40),f.message);}
            else{alert("Add tenant email in Tenancies and write a message first.");}
          }} style={{...T.sec,color:"#2D5BE3",borderColor:"#2D5BE3"}}>✉️ Open in Email</button>
          <button onClick={sendReminder} style={T.pri}>📋 Log Reminder</button>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE: REPORTS
// ══════════════════════════════════════════════════════════════════
function ReportsPage({ ctx }) {
  const { myData } = ctx;
  const { properties, tenancies, payments, certs } = myData;

  const months = Array.from({length:6},(_,i)=>{
    const d=new Date(); d.setMonth(d.getMonth()-(5-i));
    const label=d.toLocaleDateString("en-GB",{month:"short",year:"2-digit"});
    const income=payments.filter(p=>{
      if (p.status!=="paid"||!p.paidDate) return false;
      const pd=new Date(p.paidDate);
      return pd.getMonth()===d.getMonth()&&pd.getFullYear()===d.getFullYear();
    }).reduce((s,p)=>s+Number(p.amount||0),0);
    const due=payments.filter(p=>{
      if (p.status==="paid") return false;
      const pd=new Date(p.dueDate);
      return pd.getMonth()===d.getMonth()&&pd.getFullYear()===d.getFullYear();
    }).reduce((s,p)=>s+Number(p.amount||0),0);
    return {label,income,due};
  });

  const occData=[
    {name:"Occupied",value:tenancies.filter(t=>t.status==="active").length,color:"#2AAE7F"},
    {name:"Vacant",value:Math.max(0,properties.length-tenancies.filter(t=>t.status==="active").length),color:"#E8A838"},
  ];

  const totalIncome    = payments.filter(p=>p.status==="paid").reduce((s,p)=>s+Number(p.amount||0),0);
  const totalOutstanding=payments.filter(p=>p.status!=="paid").reduce((s,p)=>s+Number(p.amount||0),0);
  const occupancyRate  = properties.length>0?Math.round((tenancies.filter(t=>t.status==="active").length/properties.length)*100):0;
  const validCerts     = certs.filter(c=>certSt(c.expiryDate)==="valid").length;
  const compliance     = certs.length>0?Math.round((validCerts/certs.length)*100):100;

  return (
    <div>
      <PH title="Reports & Analytics" sub="Financial performance and compliance overview" />

      <div className="stat-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,marginBottom:28}}>
        <SC label="Total Collected"    value={gbp(totalIncome)}         icon="💷" color="#2AAE7F" />
        <SC label="Outstanding"        value={gbp(totalOutstanding)}     icon="⏳" color={totalOutstanding>0?"#E8A838":"#2AAE7F"} />
        <SC label="Occupancy Rate"     value={`${occupancyRate}%`}       icon="🏢" color="#2D5BE3" sub={`${tenancies.filter(t=>t.status==="active").length} of ${properties.length}`} />
        <SC label="Cert Compliance"    value={`${compliance}%`}         icon="📋" color={compliance===100?"#2AAE7F":compliance>=80?"#E8A838":"#E53E3E"} sub={`${validCerts}/${certs.length} valid`} />
      </div>

      <GG cols={2} gap={24}>
        <Card>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"#1B2B4B",marginBottom:20}}>Monthly Income (Last 6 Months)</div>
          {months.some(m=>m.income>0||m.due>0)?(
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={months} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                <XAxis dataKey="label" tick={{fontSize:12,fill:"#6B7C93"}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize:11,fill:"#6B7C93"}} tickFormatter={v=>`£${v>=1000?(v/1000).toFixed(1)+"k":v}`} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v,n)=>[gbp(v),n==="income"?"Collected":"Outstanding"]} contentStyle={{borderRadius:10,border:"1px solid #E8F0FA",fontSize:13}} />
                <Bar dataKey="income"  fill="#2D5BE3" radius={[6,6,0,0]} name="income" />
                <Bar dataKey="due"     fill="#E8A838" radius={[6,6,0,0]} name="due" />
              </BarChart>
            </ResponsiveContainer>
          ):<Empty icon="📊" title="No payment data yet" sub="Record rent payments to see income trends" />}
          <div style={{display:"flex",gap:16,justifyContent:"center",marginTop:12}}>
            {[{c:"#2D5BE3",l:"Collected"},{c:"#E8A838",l:"Outstanding"}].map(x=>(
              <div key={x.l} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#6B7C93"}}>
                <div style={{width:12,height:12,borderRadius:3,background:x.c}} />{x.l}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"#1B2B4B",marginBottom:20}}>Property Occupancy</div>
          {properties.length>0?(
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={occData} cx="50%" cy="50%" outerRadius={80} innerRadius={45} dataKey="value" paddingAngle={3}>
                    {occData.map((e,i)=><Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={v=>[v+" properties"]} contentStyle={{borderRadius:10,border:"1px solid #E8F0FA",fontSize:13}} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{display:"flex",gap:24,justifyContent:"center",marginTop:8}}>
                {occData.map(d=>(
                  <div key={d.name} style={{textAlign:"center"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                      <div style={{width:12,height:12,borderRadius:"50%",background:d.color}} />
                      <span style={{fontSize:12,color:"#6B7C93"}}>{d.name}</span>
                    </div>
                    <div style={{fontWeight:800,fontSize:20,color:"#1B2B4B",fontFamily:"Playfair Display,serif"}}>{d.value}</div>
                  </div>
                ))}
              </div>
            </>
          ):<Empty icon="🏢" title="No properties" sub="Add properties to see occupancy" />}
        </Card>
      </GG>

      <GG cols={2} gap={24} style={{marginTop:24}}>
        <Card>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"#1B2B4B",marginBottom:16}}>Property Portfolio</div>
          {properties.length===0?<Empty icon="🏢" title="No properties" sub="" />:(
            <table>
              <thead><tr><th>Property</th><th>Type</th><th>Monthly Rent</th><th>Status</th></tr></thead>
              <tbody>
                {properties.map(p=>{
                  const ten=tenancies.find(t=>t.propertyId===p.id&&t.status==="active");
                  return(<tr key={p.id}>
                    <td><div style={{fontWeight:600,fontSize:13}}>{p.address}</div><div style={{color:"#6B7C93",fontSize:11}}>{p.postcode||""}</div></td>
                    <td style={{fontSize:13,color:"#6B7C93"}}>{p.type||"–"}</td>
                    <td style={{fontWeight:700,color:"#2D5BE3"}}>{gbp(p.monthlyRent||0)}</td>
                    <td><Bdg s={ten?"active":"ended"} /></td>
                  </tr>);
                })}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"#1B2B4B",marginBottom:16}}>Certificate Compliance</div>
          {certs.length===0?<Empty icon="📋" title="No certificates" sub="Add certificates to track compliance" />:(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {CERT_TYPES.map(ct=>{
                const mc=certs.filter(c=>c.type===ct.id);
                if (!mc.length) return null;
                const valid=mc.filter(c=>certSt(c.expiryDate)==="valid").length;
                const pct=Math.round((valid/mc.length)*100);
                const col=pct===100?"#2AAE7F":pct>=50?"#E8A838":"#E53E3E";
                return(<div key={ct.id}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:13,color:"#4A5568"}}>{ct.icon} {ct.label}</span>
                    <span style={{fontSize:12,fontWeight:700,color:col}}>{valid}/{mc.length}</span>
                  </div>
                  <div style={{height:6,background:"#EEF2F7",borderRadius:4}}>
                    <div style={{height:"100%",width:`${pct}%`,background:col,borderRadius:4,transition:"width .6s"}} />
                  </div>
                </div>);
              })}
            </div>
          )}
        </Card>
      </GG>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE: ADMIN PORTAL
// ══════════════════════════════════════════════════════════════════
function AdminPage({ ctx }) {
  const { db, save, showToast } = ctx;
  const [tab, setTab]           = useState("overview");
  const [delLandlord, setDelLandlord] = useState(null);

  const stats = {
    landlords: (db.landlords||[]).length,
    properties:(db.properties||[]).length,
    tenancies: (db.tenancies||[]).filter(t=>t.status==="active").length,
    payments:  (db.payments||[]).length,
    income:    (db.payments||[]).filter(p=>p.status==="paid").reduce((s,p)=>s+Number(p.amount||0),0),
    certs:     (db.certs||[]).length,
  };

  const removeLandlord = id => {
    ["landlords","properties","tenancies","payments","certs","notices","reminders","expenses","inventory","templates","contractors","voids","documents","rtr","inspections","recurring"].forEach(k=>{
      save(k,(db[k]||[]).filter(x=>(x.landlordId||x.id)!==id&&x.id!==id));
    });
    setDelLandlord(null);
    showToast("Landlord and all associated data removed.");
  };

  return (
    <div>
      <PH title="⚙️ Admin Portal" sub="System-wide overview and landlord management" />

      <div style={{background:"#FDE8E8",border:"1px solid #F6B2B2",borderRadius:12,padding:"12px 20px",marginBottom:24,fontSize:13,color:"#C53030",fontWeight:500}}>
        🔒 Admin access — you are viewing all landlord data system-wide. Use with care.
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,marginBottom:28}}>
        <SC label="Registered Landlords" value={stats.landlords} icon="👤" color="#2D5BE3" />
        <SC label="Total Properties"     value={stats.properties} icon="🏢" color="#2AAE7F" />
        <SC label="Active Tenancies"     value={stats.tenancies}  icon="👥" color="#E8A838" />
        <SC label="Payment Records"      value={stats.payments}   icon="💷" color="#8B5CF6" />
        <SC label="Total Income Tracked" value={gbp(stats.income)} icon="✅" color="#2AAE7F" />
        <SC label="Certificates"         value={stats.certs}      icon="📋" color="#2D5BE3" />
      </div>

      <Tabs tabs={[{id:"overview",label:"Overview"},{id:"landlords",label:"Landlords"},{id:"properties",label:"All Properties"},{id:"tenancies",label:"All Tenancies"}]} active={tab} onChange={setTab} />

      {tab==="overview"&&(
        <Card>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"#1B2B4B",marginBottom:16}}>Landlord Performance Summary</div>
          {(db.landlords||[]).length===0?<Empty icon="👤" title="No landlords registered" sub="Landlords who register will appear here" />:(
            <div style={{overflowX:"auto"}}>
              <table>
                <thead><tr><th>Landlord</th><th>Email</th><th>Properties</th><th>Active Tenancies</th><th>Payments</th><th>Registered</th></tr></thead>
                <tbody>
                  {(db.landlords||[]).map(l=>(
                    <tr key={l.id}>
                      <td><div style={{fontWeight:600,color:"#1B2B4B"}}>{l.name}</div><div style={{color:"#6B7C93",fontSize:12}}>{l.company||"Private landlord"}</div></td>
                      <td style={{color:"#6B7C93",fontSize:13}}>{l.email}</td>
                      <td style={{fontWeight:700}}>{(db.properties||[]).filter(p=>p.landlordId===l.id).length}</td>
                      <td>{(db.tenancies||[]).filter(t=>t.landlordId===l.id&&t.status==="active").length}</td>
                      <td>{(db.payments||[]).filter(p=>p.landlordId===l.id).length}</td>
                      <td style={{fontSize:13,color:"#6B7C93"}}>{fmt(l.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab==="landlords"&&(
        <Card>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"#1B2B4B",marginBottom:16}}>Registered Landlords ({(db.landlords||[]).length})</div>
          {(db.landlords||[]).length===0?<Empty icon="👤" title="No landlords" sub="" />:(
            <div style={{overflowX:"auto"}}>
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Company</th><th>Joined</th><th style={{textAlign:"right"}}>Actions</th></tr></thead>
                <tbody>
                  {(db.landlords||[]).map(l=>(
                    <tr key={l.id}>
                      <td style={{fontWeight:600}}>{l.name}</td>
                      <td style={{color:"#6B7C93",fontSize:13}}>{l.email}</td>
                      <td>{l.phone||"–"}</td>
                      <td>{l.company||"–"}</td>
                      <td style={{fontSize:13,color:"#6B7C93"}}>{fmt(l.createdAt)}</td>
                      <td style={{textAlign:"right"}}><button onClick={()=>setDelLandlord(l)} style={T.dan}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab==="properties"&&(
        <Card>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"#1B2B4B",marginBottom:16}}>All Properties ({(db.properties||[]).length})</div>
          {(db.properties||[]).length===0?<Empty icon="🏢" title="No properties" sub="" />:(
            <div style={{overflowX:"auto"}}>
              <table>
                <thead><tr><th>Property</th><th>Landlord</th><th>Type</th><th>Monthly Rent</th><th>Status</th></tr></thead>
                <tbody>
                  {(db.properties||[]).map(p=>{
                    const ll=(db.landlords||[]).find(l=>l.id===p.landlordId);
                    const ten=(db.tenancies||[]).find(t=>t.propertyId===p.id&&t.status==="active");
                    return(<tr key={p.id}>
                      <td><div style={{fontWeight:600,fontSize:13}}>{p.address}</div><div style={{color:"#6B7C93",fontSize:11}}>{p.postcode||""}</div></td>
                      <td style={{color:"#6B7C93",fontSize:13}}>{ll?.name||"–"}</td>
                      <td style={{fontSize:13}}>{p.type||"–"}</td>
                      <td style={{fontWeight:700,color:"#2D5BE3"}}>{gbp(p.monthlyRent||0)}</td>
                      <td><Bdg s={ten?"active":"ended"} /></td>
                    </tr>);
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab==="tenancies"&&(
        <Card>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"#1B2B4B",marginBottom:16}}>All Tenancies ({(db.tenancies||[]).length})</div>
          {(db.tenancies||[]).length===0?<Empty icon="👥" title="No tenancies" sub="" />:(
            <div style={{overflowX:"auto"}}>
              <table>
                <thead><tr><th>Tenant</th><th>Property</th><th>Landlord</th><th>Monthly Rent</th><th>Start</th><th>Status</th></tr></thead>
                <tbody>
                  {(db.tenancies||[]).map(t=>{
                    const prop=(db.properties||[]).find(p=>p.id===t.propertyId);
                    const ll=(db.landlords||[]).find(l=>l.id===t.landlordId);
                    return(<tr key={t.id}>
                      <td><div style={{fontWeight:600,fontSize:13}}>{t.tenantName}</div><div style={{color:"#6B7C93",fontSize:11}}>{t.tenantEmail||"–"}</div></td>
                      <td style={{fontSize:13,color:"#4A5568"}}>{prop?.address||"–"}</td>
                      <td style={{fontSize:13,color:"#6B7C93"}}>{ll?.name||"–"}</td>
                      <td style={{fontWeight:700,color:"#2D5BE3"}}>{gbp(t.rentAmount)}</td>
                      <td style={{fontSize:13}}>{fmt(t.startDate)}</td>
                      <td><Bdg s={t.status||"active"} /></td>
                    </tr>);
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <Modal open={!!delLandlord} onClose={()=>setDelLandlord(null)} title="Remove Landlord Account" width={440}>
        <p style={{color:"#4A5568",lineHeight:1.7,marginBottom:24}}>Are you sure you want to permanently remove <strong>{delLandlord?.name}</strong>? This will delete ALL their properties, tenancies, certificates, notices and payment records. <strong style={{color:"#C53030"}}>This cannot be undone.</strong></p>
        <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
          <button onClick={()=>setDelLandlord(null)} style={T.sec}>Cancel</button>
          <button onClick={()=>removeLandlord(delLandlord.id)} style={T.dan}>Remove Permanently</button>
        </div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE: PROFILE
// ══════════════════════════════════════════════════════════════════
function ProfilePage({ ctx }) {
  const { user, db, save, showToast } = ctx;
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState({ name:user.name, company:user.company||"", email:user.email, phone:user.phone||"" });
  const [pw, setPw] = useState({ current:"", newPw:"", confirm:"" });
  const upd  = k => e => setF(x=>({...x,[k]:e.target.value}));
  const updPw= k => e => setPw(x=>({...x,[k]:e.target.value}));

  const saveProfile = () => {
    if (!f.name||!f.email) { showToast("Name and email required.","error"); return; }
    if (user.role==="admin") { showToast("Admin profile is managed by the system.","error"); return; }
    save("landlords",(db.landlords||[]).map(l=>l.id===user.id?{...l,...f}:l));
    showToast("Profile updated! Changes apply on next login."); setEditing(false);
  };

  const changePw = async () => {
    if (user.role==="admin") { showToast("Cannot change admin password here.","error"); return; }
    const me=(db.landlords||[]).find(l=>l.id===user.id);
    if (!me) { showToast("Account not found.","error"); return; }
    const hashedCurrent = await hashPassword(pw.current);
    if (me.password !== hashedCurrent && me.password !== pw.current) {
      showToast("Current password is incorrect.","error"); return;
    }
    if (pw.newPw!==pw.confirm) { showToast("New passwords don't match.","error"); return; }
    if (pw.newPw.length<6) { showToast("Password must be at least 6 characters.","error"); return; }
    const hashedNew = await hashPassword(pw.newPw);
    save("landlords",(db.landlords||[]).map(l=>l.id===user.id?{...l,password:hashedNew}:l));
    setPw({current:"",newPw:"",confirm:""});
    showToast("Password changed successfully!");
  };

  const myProps=(db.properties||[]).filter(p=>p.landlordId===user.id).length;
  const myTens=(db.tenancies||[]).filter(t=>t.landlordId===user.id&&t.status==="active").length;
  const myIncome=(db.payments||[]).filter(p=>p.landlordId===user.id&&p.status==="paid").reduce((s,p)=>s+Number(p.amount||0),0);

  return (
    <div>
      <PH title="My Profile" sub="Manage your account details and security" />
      <GG cols={2} gap={24}>
        <Card>
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:28,paddingBottom:24,borderBottom:"1px solid #F0F4FA"}}>
            <div style={{width:68,height:68,background:"linear-gradient(135deg,#2D5BE3,#5A80F0)",borderRadius:20,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:800,fontSize:30,flexShrink:0,boxShadow:"0 6px 20px rgba(45,91,227,.3)"}}>{user.name.charAt(0).toUpperCase()}</div>
            <div>
              <div style={{fontFamily:"Playfair Display,serif",fontSize:22,fontWeight:700,color:"#1B2B4B"}}>{user.name}</div>
              <div style={{color:"#6B7C93",fontSize:13,textTransform:"capitalize",marginTop:2}}>{user.role} Account</div>
              {user.company&&<div style={{color:"#2D5BE3",fontSize:13,fontWeight:500,marginTop:2}}>{user.company}</div>}
            </div>
          </div>

          {editing?(
            <>
              <Fld label="Full Name"><input value={f.name} onChange={upd("name")} style={T.inp} /></Fld>
              <Fld label="Company"><input value={f.company} onChange={upd("company")} style={T.inp} /></Fld>
              <Fld label="Email"><input type="email" value={f.email} onChange={upd("email")} style={T.inp} /></Fld>
              <Fld label="Phone"><input value={f.phone} onChange={upd("phone")} style={T.inp} /></Fld>
              <div style={{display:"flex",gap:12,marginTop:8}}>
                <button onClick={saveProfile} style={T.pri}>Save Profile</button>
                <button onClick={()=>setEditing(false)} style={T.sec}>Cancel</button>
              </div>
            </>
          ):(
            <>
              {[["Email",user.email||"–"],["Phone",user.phone||"–"],["Company",user.company||"Private landlord"],["Role",user.role],["Member since",fmt(user.createdAt||today())]].map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid #F0F4FA"}}>
                  <span style={{color:"#6B7C93",fontSize:14}}>{k}</span>
                  <span style={{fontWeight:600,color:"#1B2B4B",fontSize:14,textTransform:"capitalize"}}>{v}</span>
                </div>
              ))}
              {user.role!=="admin"&&<button onClick={()=>setEditing(true)} style={{...T.pri,marginTop:20,width:"100%"}}>Edit Profile</button>}
            </>
          )}
        </Card>

        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          <Card>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"#1B2B4B",marginBottom:16}}>Portfolio Statistics</div>
            {[
              {label:"Properties",val:myProps,icon:"🏢",col:"#2D5BE3"},
              {label:"Active Tenancies",val:myTens,icon:"👥",col:"#2AAE7F"},
              {label:"Income Collected",val:gbp(myIncome),icon:"💷",col:"#E8A838"},
              {label:"Certificates",val:(db.certs||[]).filter(c=>c.landlordId===user.id).length,icon:"📋",col:"#8B5CF6"},
              {label:"Notices Generated",val:(db.notices||[]).filter(n=>n.landlordId===user.id).length,icon:"📄",col:"#E53E3E"},
            ].map(s=>(
              <div key={s.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:"1px solid #F0F4FA"}}>
                <span style={{color:"#6B7C93",fontSize:14}}>{s.icon} {s.label}</span>
                <span style={{fontWeight:800,color:s.col,fontSize:15}}>{s.val}</span>
              </div>
            ))}
          </Card>

          {user.role!=="admin"&&(
            <Card>
              <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"#1B2B4B",marginBottom:16}}>Change Password</div>
              <Fld label="Current Password"><input type="password" value={pw.current} onChange={updPw("current")} placeholder="Current password" style={T.inp} /></Fld>
              <Fld label="New Password"><input type="password" value={pw.newPw} onChange={updPw("newPw")} placeholder="New password (min. 6 chars)" style={T.inp} /></Fld>
              <Fld label="Confirm New Password"><input type="password" value={pw.confirm} onChange={updPw("confirm")} placeholder="Repeat new password" style={T.inp} /></Fld>
              <button onClick={changePw} style={{...T.pri,width:"100%",marginTop:4}}>Update Password</button>
            </Card>
          )}
        </div>
      </GG>

      {/* ── BACKUP & RESTORE ─────────────────── */}
      <Card style={{marginTop:24}}>
        <div style={{fontFamily:"Playfair Display,serif",fontSize:20,fontWeight:700,color:"#1B2B4B",marginBottom:6}}>Backup & Restore</div>
        <p style={{color:"#6B7C93",fontSize:14,marginBottom:20,lineHeight:1.6}}>Export all your data as a JSON file you can keep locally. Restore it any time to bring your data back — even on a different device.</p>
        <GG cols={2} gap={20}>
          {/* Export */}
          <div style={{background:"#F0FFF6",borderRadius:14,padding:20,border:"1px solid #9AE6B4"}}>
            <div style={{fontSize:32,marginBottom:10}}>⬇️</div>
            <div style={{fontWeight:700,fontSize:16,color:"#1B2B4B",marginBottom:6}}>Export Backup</div>
            <div style={{fontSize:13,color:"#4A5568",marginBottom:16,lineHeight:1.6}}>Downloads all your properties, tenancies, payments, certificates, documents and more as a single <code style={{background:"#D4FAE6",padding:"1px 6px",borderRadius:4,fontSize:12}}>.json</code> file.</div>
            <button onClick={async()=>{
              const keys=["landlords","properties","tenancies","payments","certs","notices","reminders","expenses","inventory","templates","contractors","voids","documents","rtr","inspections","recurring"];
              const data={};
              for(const k of keys) data[k]=(db[k]||[]).filter(x=>x.landlordId===user.id||x.id===user.id);
              const backup={version:"2.0",app:"LandlordPro",exportedAt:today(),exportedBy:user.name,landlordId:user.id,data};
              downloadJSON(`landlordpro-backup-${today()}.json`,backup);
              showToast("Backup downloaded!");
            }} style={{...T.pri,background:"#2AAE7F",width:"100%",padding:12}}>⬇ Download Backup</button>
          </div>
          {/* Restore */}
          <div style={{background:"#EBF4FF",borderRadius:14,padding:20,border:"1px solid #BEE3F8"}}>
            <div style={{fontSize:32,marginBottom:10}}>⬆️</div>
            <div style={{fontWeight:700,fontSize:16,color:"#1B2B4B",marginBottom:6}}>Restore Backup</div>
            <div style={{fontSize:13,color:"#4A5568",marginBottom:16,lineHeight:1.6}}>Upload a LandlordPro backup file to restore your data. <strong style={{color:"#C53030"}}>This will replace your current data.</strong></div>
            <label style={{display:"block",cursor:"pointer"}}>
              <input type="file" accept=".json" style={{display:"none"}} onChange={async e=>{
                const file=e.target.files[0]; if(!file)return;
                try{
                  const text=await file.text();
                  const backup=JSON.parse(text);
                  if(backup.app!=="LandlordPro"||!backup.data){showToast("Invalid backup file.","error");return;}
                  const counts=Object.entries(backup.data).map(([k,v])=>`${k}: ${(v||[]).length}`).join(", ");
                  if(!window.confirm(`Restore this backup?\n\nExported: ${backup.exportedAt}\nBy: ${backup.exportedBy||"–"}\n\n${counts}\n\nThis will REPLACE your current data.`))return;
                  for(const[k,v] of Object.entries(backup.data)){
                    await DB.set(k,v);
                    setDb(d=>({...d,[k]:v}));
                  }
                  showToast("✓ Data restored successfully!");
                  e.target.value="";
                }catch(err){showToast("Restore failed — invalid file.","error");}
              }}/>
              <div style={{...T.pri,background:"#2D5BE3",width:"100%",padding:12,textAlign:"center",borderRadius:10,cursor:"pointer"}}>⬆ Upload & Restore</div>
            </label>
          </div>
        </GG>
        <div style={{marginTop:16,padding:"12px 16px",background:"#FFFBEB",borderRadius:10,border:"1px solid #FCD34D",fontSize:13,color:"#92400E"}}>
          ⚠️ <strong>Note:</strong> Uploaded documents (PDFs, images) are stored separately and not included in the JSON backup. Re-upload any documents after a restore.
        </div>
      </Card>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════
// PAGE: FINANCES (Income, Expenses & P&L)
// ══════════════════════════════════════════════════════════════════
function FinancesPage({ctx}){
  const{myData,db,save,showToast,user}=ctx;
  const expenses=myData.expenses||[];const{payments,properties,tenancies}=myData;
  const[tab,setTab]=useState("overview");
  const[modal,setModal]=useState(false);
  const[editing,setEditing]=useState(null);
  const[taxYear,setTaxYear]=useState(()=>{const n=new Date();return n.getMonth()>=3?n.getFullYear():n.getFullYear()-1;});
  const blank={propertyId:"",category:"repairs",amount:"",date:today(),description:"",notes:""};
  const[f,setF]=useState(blank);
  const upd=k=>e=>setF(x=>({...x,[k]:e.target.value}));
  const openAdd=()=>{setEditing(null);setF({...blank,propertyId:properties[0]?.id||""});setModal(true);};
  const openEdit=e=>{setEditing(e);setF({...e});setModal(true);};
  const doSave=()=>{if(!f.amount||!f.date){showToast("Amount and date required.","error");return;}const exp=editing?{...editing,...f}:{...f,id:uid(),landlordId:user.id,createdAt:today()};const u2=editing?(db.expenses||[]).map(x=>x.id===editing.id?exp:x):[...(db.expenses||[]),exp];save("expenses",u2);setModal(false);showToast(editing?"Updated!":"Expense added!");};
  const doDelete=id=>{save("expenses",(db.expenses||[]).filter(e=>e.id!==id));showToast("Deleted.");};
  const tyS=new Date(taxYear,3,6),tyE=new Date(taxYear+1,3,5);
  const inTY=d=>d&&new Date(d)>=tyS&&new Date(d)<=tyE;
  const tyInc=payments.filter(p=>p.status==="paid"&&inTY(p.paidDate||p.dueDate)).reduce((s,p)=>s+Number(p.amount||0),0);
  const tyExp=(expenses||[]).filter(e=>inTY(e.date)).reduce((s,e)=>s+Number(e.amount||0),0);
  const COLORS=["#2D5BE3","#2AAE7F","#E8A838","#E53E3E","#7C3AED","#0891B2","#D97706","#059669","#9333EA","#6B7280","#DC2626"];
  const months=Array.from({length:12},(_,i)=>{const d=new Date(taxYear,3+i,1);const label=d.toLocaleDateString("en-GB",{month:"short"});const inc=payments.filter(p=>{if(p.status!=="paid")return false;const pd=new Date(p.paidDate||p.dueDate);return pd.getMonth()===d.getMonth()&&pd.getFullYear()===d.getFullYear()&&inTY(p.paidDate||p.dueDate);}).reduce((s,p)=>s+Number(p.amount||0),0);const exp=(expenses||[]).filter(e=>{const ed=new Date(e.date);return ed.getMonth()===d.getMonth()&&ed.getFullYear()===d.getFullYear()&&inTY(e.date);}).reduce((s,e)=>s+Number(e.amount||0),0);return{label,income:inc,expenses:exp};});
  const expByCat=EXPENSE_CATS.map((c,i)=>({name:c.label.split(" /")[0].split(" (")[0],value:(expenses||[]).filter(e=>e.category===c.id&&inTY(e.date)).reduce((s,e)=>s+Number(e.amount||0),0),color:COLORS[i%COLORS.length]})).filter(x=>x.value>0);
  return(
    <div>
      <PH title="Finances" sub="Income, expenses and P&amp;L"
        right={<div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:13,color:"#6B7C93"}}>Tax year:</span>
            <select value={taxYear} onChange={e=>setTaxYear(Number(e.target.value))} style={{...T.sel,width:"auto",padding:"8px 12px",fontSize:13}}>
              {[...Array(5)].map((_,i)=>{const y=new Date().getFullYear()-i;return <option key={y} value={y}>{y}/{y+1}</option>;})}
            </select></div>
          <button onClick={openAdd} style={T.pri}>+ Add Expense</button>
        </div>}/>
      <div className="stat-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,marginBottom:28}}>
        <SC label={`${taxYear}/${taxYear+1} Income`} value={gbp(tyInc)} icon="💷" color="#2AAE7F" sub="rent received"/>
        <SC label="Expenses" value={gbp(tyExp)} icon="📉" color="#E53E3E" sub="deductible costs"/>
        <SC label="Net Profit" value={gbp(tyInc-tyExp)} icon="📊" color={tyInc-tyExp>=0?"#2AAE7F":"#E53E3E"} sub="before tax"/>
        <SC label="Gross Yield" value={properties.reduce((s,p)=>s+Number(p.purchasePrice||0),0)>0?`${((tyInc/properties.reduce((s,p)=>s+Number(p.purchasePrice||0),0))*100).toFixed(1)}%`:"N/A"} icon="📈" color="#7C3AED" sub="annual"/>
      </div>
      <Tabs tabs={[{id:"overview",label:"P&L Overview"},{id:"expenses",label:`Expenses (${(expenses||[]).length})`},{id:"income",label:"Income"}]} active={tab} onChange={setTab}/>
      {tab==="overview"&&(<div>
        <GG cols={2} gap={24} style={{marginBottom:24}}>
          <Card>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"#1B2B4B",marginBottom:16}}>Monthly P{"&"}L</div>
            {months.some(m=>m.income>0||m.expenses>0)?(
              <><ResponsiveContainer width="100%" height={240}><BarChart data={months} barGap={3}><CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7"/><XAxis dataKey="label" tick={{fontSize:11,fill:"#6B7C93"}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:11,fill:"#6B7C93"}} tickFormatter={v=>`£${v>=1000?(v/1000).toFixed(0)+"k":v}`} axisLine={false} tickLine={false}/><Tooltip formatter={(v,n)=>[gbp(v),n==="income"?"Income":"Expenses"]} contentStyle={{borderRadius:10,border:"1px solid #E8F0FA",fontSize:12}}/><Bar dataKey="income" fill="#2AAE7F" radius={[4,4,0,0]} name="income"/><Bar dataKey="expenses" fill="#E53E3E" radius={[4,4,0,0]} name="expenses"/></BarChart></ResponsiveContainer>
              <div style={{display:"flex",gap:16,justifyContent:"center",marginTop:8}}>{[{c:"#2AAE7F",l:"Income"},{c:"#E53E3E",l:"Expenses"}].map(x=>(<div key={x.l} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#6B7C93"}}><div style={{width:12,height:12,borderRadius:3,background:x.c}}/>{x.l}</div>))}</div></>
            ):<Empty icon="📊" title="No data yet" sub="Add expenses and record payments to see chart"/>}
          </Card>
          <Card>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"#1B2B4B",marginBottom:16}}>Expenses by Category</div>
            {expByCat.length>0?(
              <><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={expByCat} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value" paddingAngle={2}>{expByCat.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Pie><Tooltip formatter={v=>[gbp(v)]} contentStyle={{borderRadius:10,fontSize:12}}/></PieChart></ResponsiveContainer>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:8,justifyContent:"center"}}>{expByCat.map((x,i)=>(<div key={x.name} style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:"#6B7C93"}}><div style={{width:8,height:8,borderRadius:"50%",background:COLORS[i%COLORS.length]}}/>{x.name}</div>))}</div></>
            ):<Empty icon="📉" title="No expenses" sub="Add expenses to see breakdown"/>}
          </Card>
        </GG>
        <Card>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"#1B2B4B",marginBottom:16}}>Property Summary {taxYear}/{taxYear+1}</div>
          {properties.length===0?<Empty icon="🏢" title="No properties" sub=""/>:(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14}}>
              {properties.map(p=>{const pI=payments.filter(x=>x.propertyId===p.id&&x.status==="paid"&&inTY(x.paidDate||x.dueDate)).reduce((s,x)=>s+Number(x.amount||0),0);const pE=(expenses||[]).filter(x=>x.propertyId===p.id&&inTY(x.date)).reduce((s,x)=>s+Number(x.amount||0),0);const net=pI-pE;return(<div key={p.id} style={{background:"#F8FAFD",borderRadius:12,padding:"12px 14px",border:"1px solid #EBF0FA"}}><div style={{fontWeight:600,color:"#1B2B4B",fontSize:13,marginBottom:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.address}</div>{[{l:"Income",v:gbp(pI),c:"#2AAE7F"},{l:"Expenses",v:gbp(pE),c:"#E53E3E"},{l:"Net",v:gbp(net),c:net>=0?"#2AAE7F":"#E53E3E"}].map(r=>(<div key={r.l} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"2px 0"}}><span style={{color:"#6B7C93"}}>{r.l}</span><span style={{fontWeight:700,color:r.c}}>{r.v}</span></div>))}</div>);})}
            </div>
          )}
        </Card>
      </div>)}
      {tab==="expenses"&&(<Card>{(expenses||[]).length===0?<Empty icon="📉" title="No expenses yet" sub='Click "+ Add Expense" to record a cost'/>:(<div style={{overflowX:"auto"}}><table><thead><tr><th>Category</th><th>Property</th><th>Description</th><th>Date</th><th>Amount</th><th style={{textAlign:"right"}}>Actions</th></tr></thead><tbody>{[...(expenses||[])].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(e=>{const prop=properties.find(p=>p.id===e.propertyId);const cat=EXPENSE_CATS.find(c=>c.id===e.category);return(<tr key={e.id}><td><span style={{fontWeight:600}}>{cat?.icon} {cat?.label||e.category}</span></td><td style={{color:"#6B7C93",fontSize:13}}>{prop?.address||"All Properties"}</td><td style={{color:"#4A5568"}}>{e.description||"–"}</td><td>{fmt(e.date)}</td><td style={{fontWeight:700,color:"#E53E3E"}}>{gbp(e.amount)}</td><td style={{textAlign:"right"}}><div style={{display:"flex",gap:6,justifyContent:"flex-end"}}><button onClick={()=>openEdit(e)} style={{...T.sec,padding:"5px 12px",fontSize:12}}>Edit</button><button onClick={()=>doDelete(e.id)} style={T.dan}>Del</button></div></td></tr>);})}</tbody></table></div>)}</Card>)}
      {tab==="income"&&(<Card>{payments.filter(p=>p.status==="paid").length===0?<Empty icon="💷" title="No income recorded" sub="Mark rent payments as paid in the Rent Ledger"/>:(<div style={{overflowX:"auto"}}><table><thead><tr><th>Tenant</th><th>Property</th><th>Amount</th><th>Due</th><th>Paid</th></tr></thead><tbody>{[...payments].filter(p=>p.status==="paid").sort((a,b)=>new Date(b.paidDate||b.dueDate)-new Date(a.paidDate||a.dueDate)).map(p=>{const ten=tenancies.find(t=>t.id===p.tenancyId);const prop=properties.find(x=>x.id===p.propertyId);return(<tr key={p.id}><td style={{fontWeight:600}}>{ten?.tenantName||"–"}{ten?.room&&<span style={{display:"block",color:"#7C3AED",fontSize:11}}>Room: {ten.room}</span>}</td><td style={{color:"#6B7C93",fontSize:13}}>{prop?.address||"–"}</td><td style={{fontWeight:700,color:"#2AAE7F"}}>{gbp(p.amount)}</td><td>{fmt(p.dueDate)}</td><td>{fmt(p.paidDate)}</td></tr>);})}</tbody></table></div>)}</Card>)}
      <Modal open={modal} onClose={()=>setModal(false)} title={editing?"Edit Expense":"Add Expense"}>
        <GG cols={2}><Fld label="Category" required><select value={f.category} onChange={upd("category")} style={T.sel}>{EXPENSE_CATS.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select></Fld><Fld label="Amount (£)" required><input type="number" value={f.amount||""} onChange={upd("amount")} placeholder="150.00" style={T.inp} min="0" step="0.01"/></Fld><Fld label="Date" required><input type="date" value={f.date} onChange={upd("date")} style={T.inp}/></Fld><Fld label="Property"><select value={f.propertyId||""} onChange={upd("propertyId")} style={T.sel}><option value="">All Properties</option>{properties.map(p=><option key={p.id} value={p.id}>{p.address}</option>)}</select></Fld></GG>
        <Fld label="Description"><input value={f.description||""} onChange={upd("description")} placeholder="e.g. Boiler repair by Jones Plumbing" style={T.inp}/></Fld>
        <Fld label="Notes"><textarea value={f.notes||""} onChange={upd("notes")} style={T.tex}/></Fld>
        <div style={{display:"flex",gap:12,justifyContent:"flex-end",paddingTop:8}}><button onClick={()=>setModal(false)} style={T.sec}>Cancel</button><button onClick={doSave} style={T.pri}>{editing?"Save":"Add Expense"}</button></div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE: INVENTORY
// ══════════════════════════════════════════════════════════════════
function InventoryPage({ctx}){
  const{myData,db,save,showToast,user}=ctx;
  const inventory=myData.inventory||[];const{properties,tenancies}=myData;
  const[modal,setModal]=useState(false);
  const[viewing,setViewing]=useState(null);
  const[selProp,setSelProp]=useState(()=>properties[0]?.id||"");
  const[iType,setIType]=useState("checkin");
  const[iDate,setIDate]=useState(today());
  const[iTen,setITen]=useState("");
  const[iNotes,setINotes]=useState("");
  const[rooms,setRooms]=useState(DEFAULT_ROOMS.map(r=>({name:r,condition:"Good",notes:""})));
  const[newRoom,setNewRoom]=useState("");
  const propTens=tenancies.filter(t=>t.propertyId===selProp&&t.status==="active");
  const propInv=(inventory||[]).filter(i=>i.propertyId===selProp);
  const addRoom=()=>{if(!newRoom.trim())return;setRooms(r=>[...r,{name:newRoom.trim(),condition:"Good",notes:""}]);setNewRoom("");};
  const updRoom=(idx,k,v)=>setRooms(r=>r.map((rm,i)=>i===idx?{...rm,[k]:v}:rm));
  const removeRoom=idx=>setRooms(r=>r.filter((_,i)=>i!==idx));
  const openNew=()=>{setIType("checkin");setIDate(today());setITen(propTens[0]?.id||"");setINotes("");setRooms(DEFAULT_ROOMS.map(r=>({name:r,condition:"Good",notes:""})));setModal(true);};
  const doSave=()=>{const inv={id:uid(),landlordId:user.id,propertyId:selProp,tenancyId:iTen,type:iType,date:iDate,rooms,notes:iNotes,createdAt:today()};save("inventory",[...(db.inventory||[]),inv]);setModal(false);showToast("Inventory report saved!");};
  const condCol={Excellent:"#2AAE7F",Good:"#2D5BE3",Fair:"#E8A838",Poor:"#E53E3E",Damaged:"#C53030"};
  const condBg={Excellent:"#D4FAE6",Good:"#EBF4FF",Fair:"#FEEBC8",Poor:"#FDE8E8",Damaged:"#FDE8E8"};
  return(
    <div>
      <PH title="Inventory" sub="Property check-in / check-out condition reports" right={<button onClick={openNew} style={T.pri} disabled={properties.length===0}>+ New Report</button>}/>
      <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
        {properties.map(p=>(<button key={p.id} onClick={()=>setSelProp(p.id)} style={{padding:"8px 16px",borderRadius:20,border:`1.5px solid ${selProp===p.id?"#7C3AED":"#D5E0EE"}`,background:selProp===p.id?"#7C3AED":"white",color:selProp===p.id?"white":"#4A5568",cursor:"pointer",fontSize:12,fontWeight:selProp===p.id?700:500,whiteSpace:"nowrap"}}>{p.address.split(",")[0]}{p.type==="HMO"?" (HMO)":""}</button>))}
      </div>
      <Card>
        <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"#1B2B4B",marginBottom:16}}>Reports — {properties.find(p=>p.id===selProp)?.address||"Select a property"}</div>
        {propInv.length===0?<Empty icon="📦" title="No reports yet" sub='Click "+ New Report" to create a check-in or check-out inventory'/>:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[...propInv].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(inv=>{const ten=tenancies.find(t=>t.id===inv.tenancyId);return(<div key={inv.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px",background:"#F8FAFD",borderRadius:12,border:"1px solid #EBF0FA"}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:44,height:44,background:inv.type==="checkin"?"#D4FAE6":"#EBF4FF",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{inv.type==="checkin"?"📥":"📤"}</div>
                <div><div style={{fontWeight:700,color:"#1B2B4B",fontSize:15}}>{inv.type==="checkin"?"Check-In":"Check-Out"} Report</div><div style={{color:"#6B7C93",fontSize:13,marginTop:2}}>{fmt(inv.date)}{ten?` · ${ten.tenantName}`:""} · {inv.rooms?.length||0} rooms</div></div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}><Bdg s={inv.type}/><button onClick={()=>setViewing(inv)} style={{...T.sec,padding:"7px 14px",fontSize:12}}>View</button></div>
            </div>);})}
          </div>
        )}
      </Card>
      <Modal open={modal} onClose={()=>setModal(false)} title="New Inventory Report" width={660}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          <Fld label="Report Type" required><select value={iType} onChange={e=>setIType(e.target.value)} style={T.sel}><option value="checkin">Check-In (start of tenancy)</option><option value="checkout">Check-Out (end of tenancy)</option></select></Fld>
          <Fld label="Date" required><input type="date" value={iDate} onChange={e=>setIDate(e.target.value)} style={T.inp}/></Fld>
          <div style={{gridColumn:"1/-1"}}><Fld label="Link to Tenancy (optional)"><select value={iTen} onChange={e=>setITen(e.target.value)} style={T.sel}><option value="">-- None --</option>{propTens.map(t=><option key={t.id} value={t.id}>{t.tenantName}{t.room?` (${t.room})`:""}</option>)}</select></Fld></div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontWeight:700,fontSize:15,color:"#1B2B4B"}}>Rooms ({rooms.length})</div><div style={{display:"flex",gap:8}}><input value={newRoom} onChange={e=>setNewRoom(e.target.value)} placeholder="Add room…" style={{...T.inp,width:150,padding:"7px 12px",fontSize:13}} onKeyDown={e=>e.key==="Enter"&&addRoom()}/><button onClick={addRoom} style={{...T.pri,padding:"7px 14px",fontSize:12}}>Add</button></div></div>
          <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:320,overflowY:"auto",paddingRight:2}}>
            {rooms.map((rm,i)=>(<div key={i} style={{background:"#F8FAFD",borderRadius:12,padding:"12px 14px",border:"1px solid #EBF0FA"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div style={{fontWeight:600,color:"#1B2B4B",fontSize:14}}>{rm.name}</div><button onClick={()=>removeRoom(i)} style={{background:"none",border:"none",cursor:"pointer",color:"#9BAEC8",fontSize:18,lineHeight:1}}>×</button></div>
              <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:10,alignItems:"center"}}>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{ROOM_CONDITIONS.map(c=>(<button key={c} onClick={()=>updRoom(i,"condition",c)} style={{padding:"4px 10px",borderRadius:8,border:`1.5px solid ${rm.condition===c?condCol[c]:"#D5E0EE"}`,background:rm.condition===c?condBg[c]:"white",color:rm.condition===c?condCol[c]:"#4A5568",cursor:"pointer",fontSize:11,fontWeight:rm.condition===c?700:500}}>{c}</button>))}</div>
                <input value={rm.notes} onChange={e=>updRoom(i,"notes",e.target.value)} placeholder="Condition notes…" style={{...T.inp,padding:"8px 12px",fontSize:13}}/>
              </div>
            </div>))}
          </div>
        </div>
        <Fld label="Overall Notes"><textarea value={iNotes} onChange={e=>setINotes(e.target.value)} placeholder="General condition notes…" style={T.tex}/></Fld>
        <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}><button onClick={()=>setModal(false)} style={T.sec}>Cancel</button><button onClick={doSave} style={T.pri}>Save Report</button></div>
      </Modal>
      <Modal open={!!viewing} onClose={()=>setViewing(null)} title="Inventory Report" width={660}>
        {viewing&&(<><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16,padding:16,background:"#F8FAFD",borderRadius:12}}>
          <div><div style={{fontSize:12,color:"#6B7C93",fontWeight:600}}>Type</div><div style={{fontWeight:700,fontSize:15,marginTop:4}}>{viewing.type==="checkin"?"📥 Check-In":"📤 Check-Out"}</div></div>
          <div><div style={{fontSize:12,color:"#6B7C93",fontWeight:600}}>Date</div><div style={{fontWeight:600,fontSize:14,marginTop:4}}>{fmt(viewing.date)}</div></div>
          <div><div style={{fontSize:12,color:"#6B7C93",fontWeight:600}}>Rooms</div><div style={{fontWeight:700,fontSize:15,marginTop:4}}>{viewing.rooms?.length||0}</div></div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:360,overflowY:"auto"}}>{(viewing.rooms||[]).map((rm,i)=>(<div key={i} style={{padding:"12px 14px",background:"#F8FAFD",borderRadius:10,border:"1px solid #EBF0FA"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontWeight:600,color:"#1B2B4B"}}>{rm.name}</div><span style={{background:condBg[rm.condition]||"#EDF2F7",color:condCol[rm.condition]||"#4A5568",padding:"3px 12px",borderRadius:20,fontSize:12,fontWeight:700}}>{rm.condition}</span></div>{rm.notes&&<div style={{color:"#6B7C93",fontSize:13,marginTop:5}}>{rm.notes}</div>}</div>))}</div>
        {viewing.notes&&<div style={{marginTop:12,padding:"12px 14px",background:"#F8FAFD",borderRadius:10,border:"1px solid #EBF0FA"}}><div style={{fontSize:12,color:"#6B7C93",fontWeight:600,marginBottom:4}}>Overall Notes</div><div style={{color:"#4A5568",fontSize:13,lineHeight:1.6}}>{viewing.notes}</div></div>}
        <div style={{display:"flex",justifyContent:"flex-end",paddingTop:16}}><button onClick={()=>setViewing(null)} style={T.sec}>Close</button></div></>)}
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE: CALENDAR
// ══════════════════════════════════════════════════════════════════
function CalendarPage({ctx}){
  const{myData}=ctx;
  const{certs,payments,tenancies,properties}=myData;
  const[cur,setCur]=useState(()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),1);});
  const[selDay,setSelDay]=useState(null);
  const yr=cur.getFullYear(),mo=cur.getMonth();
  const firstDow=new Date(yr,mo,1).getDay();
  const daysInMo=new Date(yr,mo+1,0).getDate();
  const todayStr=today();
  const DAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
  const evMap={};
  const addEv=(ds,ev)=>{if(!ds)return;if(!evMap[ds])evMap[ds]=[];evMap[ds].push(ev);};
  payments.filter(p=>p.status!=="paid").forEach(p=>{const ten=tenancies.find(t=>t.id===p.tenancyId);addEv(p.dueDate,{type:"rent",color:"#2D5BE3",label:`Rent Due: ${ten?.tenantName||"–"} (${gbp(p.amount)})`});});
  payments.filter(p=>p.status==="paid"&&p.paidDate).forEach(p=>{const ten=tenancies.find(t=>t.id===p.tenancyId);addEv(p.paidDate,{color:"#2AAE7F",label:`Rent Paid: ${ten?.tenantName||"–"} (${gbp(p.amount)})`});});
  certs.forEach(c=>{if(c.expiryDate){const st=certSt(c.expiryDate);const ct=CERT_TYPES.find(x=>x.id===c.type);const prop=properties.find(p=>p.id===c.propertyId);addEv(c.expiryDate,{color:st==="expired"?"#E53E3E":st==="expiring"?"#E8A838":"#2AAE7F",label:`${ct?.label||"Cert"} expires: ${prop?.address||"–"}`});}});
  tenancies.forEach(t=>{if(t.startDate)addEv(t.startDate,{color:"#7C3AED",label:`Tenancy Start: ${t.tenantName}`});if(t.endDate)addEv(t.endDate,{color:"#E8A838",label:`Tenancy End: ${t.tenantName}`});});
  const cells=[];
  for(let i=0;i<firstDow;i++)cells.push(null);
  for(let d=1;d<=daysInMo;d++){const ds=`${yr}-${pad2(mo+1)}-${pad2(d)}`;cells.push({day:d,ds,evs:evMap[ds]||[]});}
  const selEvs=selDay?evMap[selDay]||[]:[];
  const LEGEND=[{color:"#2D5BE3",label:"Rent Due"},{color:"#2AAE7F",label:"Rent Paid / Cert Valid"},{color:"#E53E3E",label:"Cert Expired"},{color:"#E8A838",label:"Expiring / End Date"},{color:"#7C3AED",label:"Tenancy Start"}];
  return(
    <div>
      <PH title="Calendar" sub="Visual overview of rent, certificates and tenancy events"/>
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <button onClick={()=>setCur(new Date(yr,mo-1,1))} style={{...T.sec,padding:"8px 18px",fontSize:14}}>‹ Prev</button>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:22,fontWeight:700,color:"#1B2B4B"}}>{MONTHS[mo]} {yr}</div>
          <button onClick={()=>setCur(new Date(yr,mo+1,1))} style={{...T.sec,padding:"8px 18px",fontSize:14}}>Next ›</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:6}}>
          {DAYS.map(d=>(<div key={d} style={{textAlign:"center",fontSize:11,fontWeight:700,color:"#6B7C93",padding:"6px 0",textTransform:"uppercase",letterSpacing:".5px"}}>{d}</div>))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
          {cells.map((c,i)=>{
            if(!c)return <div key={i} style={{minHeight:76,background:"#F8FAFD",borderRadius:8,border:"1px solid #F0F4FA"}}/>;
            const isToday=c.ds===todayStr,isSel=c.ds===selDay;
            return(<div key={c.ds} className="cal-day" onClick={()=>setSelDay(c.ds===selDay?null:c.ds)} style={{minHeight:76,background:isSel?"#EBF4FF":isToday?"#FFF8ED":"white",borderRadius:8,border:`1.5px solid ${isSel?"#2D5BE3":isToday?"#E8A838":"#F0F4FA"}`,padding:"8px 6px",transition:"all .15s"}}>
              <div style={{fontWeight:isToday?800:500,fontSize:14,color:isToday?"#E8A838":isSel?"#2D5BE3":"#1B2B4B",marginBottom:4,textAlign:"right"}}>{c.day}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:3}}>{c.evs.slice(0,5).map((ev,ei)=>(<div key={ei} style={{width:8,height:8,borderRadius:"50%",background:ev.color,flexShrink:0}}/>))}{c.evs.length>5&&<div style={{fontSize:9,color:"#6B7C93",fontWeight:700}}>+{c.evs.length-5}</div>}</div>
            </div>);
          })}
        </div>
        {selDay&&(<div style={{marginTop:20,padding:"16px 20px",background:"#F8FAFD",borderRadius:12,border:"1px solid #EBF0FA"}}>
          <div style={{fontWeight:700,fontSize:15,color:"#1B2B4B",marginBottom:12}}>Events on {fmt(selDay)}</div>
          {selEvs.length===0?<div style={{color:"#6B7C93",fontSize:14}}>No events on this day.</div>:<div style={{display:"flex",flexDirection:"column",gap:8}}>{selEvs.map((ev,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"white",borderRadius:10,border:`1px solid ${ev.color}30`}}><div style={{width:12,height:12,borderRadius:"50%",background:ev.color,flexShrink:0}}/><span style={{fontSize:14,color:"#2D3748"}}>{ev.label}</span></div>))}</div>}
        </div>)}
        <div style={{display:"flex",flexWrap:"wrap",gap:16,marginTop:20,paddingTop:16,borderTop:"1px solid #F0F4FA"}}>{LEGEND.map(l=>(<div key={l.label} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#6B7C93"}}><div style={{width:10,height:10,borderRadius:"50%",background:l.color}}/>{l.label}</div>))}</div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE: MESSAGE TEMPLATES
// ══════════════════════════════════════════════════════════════════
function TemplatesPage({ctx}){
  const{myData,db,save,showToast,user}=ctx;
  const customTpls=(myData.templates||[]);
  const allTpls=[...BUILT_IN_TEMPLATES,...customTpls];
  const[tab,setTab]=useState("all");
  const[modal,setModal]=useState(false);
  const[editing,setEditing]=useState(null);
  const[viewT,setViewT]=useState(null);
  const blank={name:"",category:"general",subject:"",body:""};
  const[f,setF]=useState(blank);
  const upd=k=>e=>setF(x=>({...x,[k]:e.target.value}));
  const openAdd=()=>{setEditing(null);setF(blank);setModal(true);};
  const openEdit=t=>{setEditing(t);setF({name:t.name,category:t.category,subject:t.subject||"",body:t.body});setModal(true);};
  const doSave=()=>{if(!f.name||!f.body){showToast("Name and body required.","error");return;}const tpl=editing?{...editing,...f}:{...f,id:uid(),landlordId:user.id,createdAt:today()};const u2=editing?(db.templates||[]).map(x=>x.id===editing.id?tpl:x):[...(db.templates||[]),tpl];save("templates",u2);setModal(false);showToast(editing?"Updated!":"Template created!");};
  const doDelete=id=>{save("templates",(db.templates||[]).filter(t=>t.id!==id));showToast("Deleted.");};
  const copyBody=body=>{navigator.clipboard?.writeText(body).then(()=>showToast("Copied!")).catch(()=>showToast("Copy not available.","error"));};
  const displayed=tab==="all"?allTpls:allTpls.filter(t=>t.category===tab);
  const VARS=["[TENANT_NAME]","[PROPERTY_ADDRESS]","[RENT_AMOUNT]","[DUE_DATE]","[LANDLORD_NAME]","[LANDLORD_PHONE]","[END_DATE]","[DEPOSIT_AMOUNT]","[INSPECTION_DATE]","[DEPOSIT_SCHEME]","[RENT_DUE_DAY]"];
  return(
    <div>
      <PH title="Message Templates" sub="Pre-written and custom templates for tenant communications" right={<button onClick={openAdd} style={T.pri}>+ Create Template</button>}/>
      <Tabs tabs={[{id:"all",label:"All"},{id:"rent",label:"Rent"},{id:"inspection",label:"Inspection"},{id:"notice",label:"Notices"},{id:"welcome",label:"Welcome"},{id:"maintenance",label:"Maintenance"},{id:"general",label:"General"}]} active={tab} onChange={setTab}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:18,marginBottom:24}}>
        {displayed.map(tpl=>(<div key={tpl.id} style={{background:"white",borderRadius:16,padding:20,boxShadow:"0 2px 12px rgba(27,43,75,.06)",border:"1px solid #EBF0FA",display:"flex",flexDirection:"column",gap:10}}>
          <div><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><div style={{fontWeight:700,fontSize:15,color:"#1B2B4B"}}>{tpl.name}</div>{tpl.builtin&&<span style={{background:"#EBF4FF",color:"#2B6CB0",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10}}>BUILT-IN</span>}</div><span style={{background:"#F0F4F8",color:"#6B7C93",fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:8,textTransform:"capitalize"}}>{TEMPLATE_CATS.find(c=>c.id===tpl.category)?.label||tpl.category}</span></div>
          <div style={{fontSize:13,color:"#4A5568",lineHeight:1.6,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical"}}>{tpl.body}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",borderTop:"1px solid #F0F4FA",paddingTop:10}}>
            <button onClick={()=>setViewT(tpl)} style={{...T.sec,padding:"6px 14px",fontSize:12}}>Preview</button>
            <button onClick={()=>copyBody(tpl.body)} style={{...T.grn,padding:"6px 14px"}}>Copy</button>
            {!tpl.builtin&&<><button onClick={()=>openEdit(tpl)} style={{...T.sec,padding:"6px 14px",fontSize:12}}>Edit</button><button onClick={()=>doDelete(tpl.id)} style={T.dan}>Del</button></>}
          </div>
        </div>))}
      </div>
      {displayed.length===0&&<Card><Empty icon="📝" title="No templates" sub="Create a custom template or choose another category"/></Card>}
      <Card>
        <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"#1B2B4B",marginBottom:8}}>Template Variables</div>
        <div style={{color:"#6B7C93",fontSize:13,marginBottom:12}}>Click to copy. Replace with actual values when using.</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{VARS.map(v=>(<code key={v} onClick={()=>copyBody(v)} style={{background:"#F0F4F8",color:"#2D5BE3",padding:"4px 10px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer"}}>{v}</code>))}</div>
      </Card>
      <Modal open={modal} onClose={()=>setModal(false)} title={editing?"Edit Template":"Create Template"} width={620}>
        <Fld label="Name" required><input value={f.name} onChange={upd("name")} placeholder="e.g. Monthly Rent Reminder" style={T.inp}/></Fld>
        <GG cols={2}><Fld label="Category"><select value={f.category} onChange={upd("category")} style={T.sel}>{TEMPLATE_CATS.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></Fld><Fld label="Subject Line"><input value={f.subject||""} onChange={upd("subject")} placeholder="Email subject…" style={T.inp}/></Fld></GG>
        <Fld label="Body" required><textarea value={f.body} onChange={upd("body")} placeholder="Use [TENANT_NAME], [PROPERTY_ADDRESS] etc…" style={{...T.tex,minHeight:180}}/></Fld>
        <div style={{display:"flex",gap:12,justifyContent:"flex-end",paddingTop:8}}><button onClick={()=>setModal(false)} style={T.sec}>Cancel</button><button onClick={doSave} style={T.pri}>{editing?"Save":"Create"}</button></div>
      </Modal>
      <Modal open={!!viewT} onClose={()=>setViewT(null)} title={viewT?.name||"Template"} width={600}>
        {viewT&&(<><div style={{background:"#F8FAFD",borderRadius:10,padding:"10px 14px",marginBottom:12,border:"1px solid #E8F0FA"}}><div style={{fontSize:11,color:"#6B7C93",fontWeight:700,marginBottom:2,textTransform:"uppercase"}}>Subject</div><div style={{fontSize:14,fontWeight:600,color:"#1B2B4B"}}>{viewT.subject||"(no subject)"}</div></div><div style={{background:"#F8FAFD",borderRadius:10,padding:"16px 18px",border:"1px solid #E8F0FA",fontFamily:"Georgia,serif",fontSize:14,lineHeight:1.9,whiteSpace:"pre-wrap",color:"#1B2B4B",maxHeight:360,overflowY:"auto"}}>{viewT.body}</div><div style={{display:"flex",gap:12,justifyContent:"flex-end",paddingTop:16}}><button onClick={()=>copyBody(viewT.body)} style={T.grn}>Copy</button><button onClick={()=>setViewT(null)} style={T.sec}>Close</button></div></>)}
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE: DATA EXPORTS
function ExportsPage({ctx}){
  const{myData,showToast}=ctx;
  const{properties,tenancies,payments,certs,expenses,notices,reminders}=myData;
  const exExpenses=expenses||[];const exNotices=notices||[];const exReminders=reminders||[];
  const exp=(name,hdrs,rows)=>{try{downloadCSV(name,hdrs,rows);showToast(`${name} downloaded!`);}catch{showToast("Export failed.","error");}};
  const now=new Date(),ty=now.getMonth()>=3?now.getFullYear():now.getFullYear()-1;
  const tyS=new Date(ty,3,6),tyE=new Date(ty+1,3,5);
  const inTY=d=>d&&new Date(d)>=tyS&&new Date(d)<=tyE;
  const EXPORTS=[
    {title:"Rent Ledger",icon:"💷",desc:"All rent payment records with status, amounts and dates.",count:`${payments.length} records`,color:"#2D5BE3",fn:()=>exp("rent_ledger.csv",["Tenant","Property","Room","Amount","Due Date","Paid Date","Status"],payments.map(p=>{const t=tenancies.find(x=>x.id===p.tenancyId);const pr=properties.find(x=>x.id===p.propertyId);return[t?.tenantName||"",pr?.address||"",t?.room||"",p.amount,p.dueDate,p.paidDate||"",p.status];}))},
    {title:"Expenses",icon:"📉",desc:"All expense records for P&L and tax reporting.",count:`${(expenses||[]).length} records`,color:"#E53E3E",fn:()=>exp("expenses.csv",["Category","Property","Description","Amount","Date"],(expenses||[]).map(e=>{const pr=properties.find(x=>x.id===e.propertyId);const cat=EXPENSE_CATS.find(c=>c.id===e.category);return[cat?.label||e.category,pr?.address||"All Properties",e.description||"",e.amount,e.date];}))},
    {title:"Properties",icon:"🏢",desc:"Full property portfolio with all details.",count:`${properties.length} properties`,color:"#7C3AED",fn:()=>exp("properties.csv",["Address","City","Postcode","Type","Bedrooms","Monthly Rent","Purchase Price"],properties.map(p=>[p.address,p.city||"",p.postcode||"",p.type||"",p.bedrooms||"",p.monthlyRent||"",p.purchasePrice||""]))},
    {title:"Tenancies",icon:"👥",desc:"All tenancies including tenant contact details.",count:`${tenancies.length} tenancies`,color:"#2AAE7F",fn:()=>exp("tenancies.csv",["Tenant","Email","Phone","Property","Room","Start","End","Rent","Deposit","Scheme","Status"],tenancies.map(t=>{const pr=properties.find(x=>x.id===t.propertyId);return[t.tenantName,t.tenantEmail||"",t.tenantPhone||"",pr?.address||"",t.room||"",t.startDate,t.endDate||"Periodic",t.rentAmount,t.depositAmount||"",t.depositScheme||"",t.status];}))},
    {title:"Certificates",icon:"📋",desc:"All certificates with expiry dates and compliance status.",count:`${certs.length} certs`,color:"#E8A838",fn:()=>exp("certificates.csv",["Type","Property","Provider","Reference","Issue Date","Expiry Date","Status"],certs.map(c=>{const pr=properties.find(x=>x.id===c.propertyId);const ct=CERT_TYPES.find(x=>x.id===c.type);return[ct?.label||c.type,pr?.address||"",c.provider||"",c.reference||"",c.issueDate,c.expiryDate,certSt(c.expiryDate)];}))},
    {title:"Legal Notices",icon:"📄",desc:"History of all generated Section 8 and 13 notices.",count:`${notices.length} notices`,color:"#C53030",fn:()=>exp("notices.csv",["Type","Tenant","Property","Generated"],notices.map(n=>{const t=tenancies.find(x=>x.id===n.tenancyId);const pr=properties.find(x=>x.id===n.propertyId);return[n.type,t?.tenantName||"",pr?.address||"",n.generatedDate];}))},
    {title:"Income Summary",icon:"📊",desc:`Tax year ${ty}/${ty+1} income by property.`,count:`${payments.filter(p=>p.status==="paid"&&inTY(p.paidDate||p.dueDate)).length} payments`,color:"#059669",fn:()=>exp("income_summary.csv",["Property","Postcode","Total Income","Tax Year"],properties.map(p=>{const inc=payments.filter(x=>x.propertyId===p.id&&x.status==="paid"&&inTY(x.paidDate||x.dueDate)).reduce((s,x)=>s+Number(x.amount||0),0);return[p.address,p.postcode||"",inc,`${ty}/${ty+1}`];}))},
    {title:"Reminders Log",icon:"🔔",desc:"All tenant reminders and communications sent.",count:`${(reminders||[]).length} sent`,color:"#0891B2",fn:()=>exp("reminders.csv",["Tenant","Email","Type","Message","Sent Date"],(reminders||[]).map(r=>[r.tenantName||"",r.tenantEmail||"",r.type,r.message,r.sentAt]))},
    {title:"Void Periods",icon:"🏚️",desc:"All void periods with duration and estimated lost rent.",count:`${(myData.voids||[]).length} periods`,color:"#C05621",fn:()=>exp("void_periods.csv",["Property","Start Date","End Date","Days","Reason"],(myData.voids||[]).map(v=>{const prop=properties.find(p=>p.id===v.propertyId);const days=v.endDate?Math.ceil((new Date(v.endDate)-new Date(v.startDate))/86400000):"Ongoing";return[prop?.address||"",v.startDate,v.endDate||"Ongoing",days,v.reason||""];}))},
    {title:"Contractor Directory",icon:"🔧",desc:"All saved contractor contacts and trades.",count:`${(myData.contractors||[]).length} contacts`,color:"#7C3AED",fn:()=>exp("contractors.csv",["Name","Trade","Phone","Email","Company","Hourly Rate","Notes"],(myData.contractors||[]).map(c=>[c.name,c.trade,c.phone||"",c.email||"",c.company||"",c.hourlyRate||"",c.notes||""]))},
  ];
  return(
    <div>
      <PH title="Data Exports" sub="Download your data as CSV — opens in Excel, Google Sheets or any spreadsheet app"/>
      <div style={{background:"#EBF4FF",border:"1px solid #BEE3F8",borderRadius:12,padding:"12px 20px",marginBottom:24,fontSize:13,color:"#2B6CB0"}}>ℹ️ Files are UTF-8 encoded CSV. All monetary values in GBP.</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:18}}>
        {EXPORTS.map(ex=>(<div key={ex.title} style={{background:"white",borderRadius:16,padding:20,boxShadow:"0 2px 12px rgba(27,43,75,.06)",border:"1px solid #EBF0FA"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:14}}>
            <div style={{width:46,height:46,background:ex.color+"18",borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,border:`1.5px solid ${ex.color}25`}}>{ex.icon}</div>
            <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15,color:"#1B2B4B",marginBottom:3}}>{ex.title}</div><div style={{color:"#6B7C93",fontSize:13,lineHeight:1.5}}>{ex.desc}</div></div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid #F0F4FA",paddingTop:12}}>
            <span style={{fontSize:13,color:"#6B7C93"}}>{ex.count}</span>
            <button onClick={ex.fn} style={{...T.pri,padding:"8px 16px",fontSize:13,background:ex.color}}>⬇ Download CSV</button>
          </div>
        </div>))}
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════
// PAGE: CONTRACTOR DIRECTORY
// ══════════════════════════════════════════════════════════════════
function ContractorsPage({ctx}){
  const{myData,db,save,showToast,user}=ctx;
  const contractors=myData.contractors||[];
  const[modal,setModal]=useState(false);
  const[editing,setEditing]=useState(null);
  const[filter,setFilter]=useState("All");
  const[delId,setDelId]=useState(null);
  const blank={name:"",trade:"Plumber",phone:"",email:"",company:"",hourlyRate:"",notes:""};
  const[f,setF]=useState(blank);
  const upd=k=>e=>setF(x=>({...x,[k]:e.target.value}));
  const openAdd=()=>{setEditing(null);setF(blank);setModal(true);};
  const openEdit=c=>{setEditing(c);setF({...c});setModal(true);};
  const doSave=()=>{
    if(!f.name||!f.trade){showToast("Name and trade required.","error");return;}
    const c=editing?{...editing,...f,updatedAt:today()}:{...f,id:uid(),landlordId:user.id,createdAt:today()};
    const u2=editing?(db.contractors||[]).map(x=>x.id===editing.id?c:x):[...(db.contractors||[]),c];
    save("contractors",u2);setModal(false);showToast(editing?"Updated!":"Contractor added!");
  };
  const doDelete=id=>{save("contractors",(db.contractors||[]).filter(c=>c.id!==id));setDelId(null);showToast("Deleted.");};
  const trades=["All",...CONTRACTOR_TRADES];
  const shown=filter==="All"?contractors:contractors.filter(c=>c.trade===filter);
  const tradeIcon={Plumber:"🔧",Electrician:"⚡","Gas Engineer":"🔥","Carpenter & Joiner":"🪚","Painter & Decorator":"🎨",Roofer:"🏚️","General Builder":"🏗️",Locksmith:"🔑",Cleaner:"🧹",Glazier:"🪟",Plasterer:"🏺",Landscaper:"🌿",Other:"👷"};
  return(
    <div>
      <PH title="Contractor Directory" sub={`${contractors.length} contractor${contractors.length!==1?"s":""} saved`}
        right={<button onClick={openAdd} style={T.pri}>+ Add Contractor</button>}/>
      <div style={{display:"flex",gap:8,marginBottom:22,flexWrap:"wrap"}}>
        {trades.map(t=>(<button key={t} onClick={()=>setFilter(t)} style={{padding:"7px 16px",borderRadius:20,border:`1.5px solid ${filter===t?"#2D5BE3":"#D5E0EE"}`,background:filter===t?"#2D5BE3":"white",color:filter===t?"white":"#4A5568",cursor:"pointer",fontSize:12,fontWeight:filter===t?700:500,transition:"all .15s"}}>{tradeIcon[t]||""} {t}</button>))}
      </div>
      {shown.length===0?(<Card><Empty icon="🔧" title="No contractors yet" sub='Click "+ Add Contractor" to build your directory'/></Card>):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:18}}>
          {shown.map(c=>(<div key={c.id} style={{background:"white",borderRadius:16,padding:22,boxShadow:"0 2px 16px rgba(27,43,75,.07)",border:"1px solid #EBF0FA",transition:"box-shadow .2s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:48,height:48,background:"linear-gradient(135deg,#EEF2F7,#E2E8F0)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{tradeIcon[c.trade]||"👷"}</div>
                <div><div style={{fontWeight:700,fontSize:16,color:"#1B2B4B"}}>{c.name}</div><div style={{fontSize:12,color:"#7C3AED",fontWeight:600,background:"#F3EFFE",padding:"2px 8px",borderRadius:8,display:"inline-block",marginTop:3}}>{c.trade}</div></div>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>openEdit(c)} style={{...T.sec,padding:"5px 12px",fontSize:12}}>Edit</button>
                <button onClick={()=>setDelId(c.id)} style={T.dan}>Del</button>
              </div>
            </div>
            {c.company&&<div style={{fontSize:13,color:"#4A5568",marginBottom:8,fontWeight:500}}>🏢 {c.company}</div>}
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {c.phone&&<a href={`tel:${c.phone}`} style={{fontSize:14,color:"#2D5BE3",fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",gap:8}}>📞 {c.phone}</a>}
              {c.email&&<a href={`mailto:${c.email}`} style={{fontSize:13,color:"#2D5BE3",textDecoration:"none",display:"flex",alignItems:"center",gap:8}}>✉️ {c.email}</a>}
              {c.hourlyRate&&<div style={{fontSize:13,color:"#2AAE7F",fontWeight:700}}>💷 £{c.hourlyRate}/hr</div>}
              {c.notes&&<div style={{fontSize:12,color:"#6B7C93",marginTop:4,lineHeight:1.5,borderTop:"1px solid #F0F4FA",paddingTop:8}}>{c.notes}</div>}
            </div>
          </div>))}
        </div>
      )}
      <Modal open={modal} onClose={()=>setModal(false)} title={editing?"Edit Contractor":"Add Contractor"} width={560}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <Fld label="Full Name" required><input value={f.name} onChange={upd("name")} placeholder="John Smith" style={T.inp}/></Fld>
          <Fld label="Trade" required><select value={f.trade} onChange={upd("trade")} style={T.sel}>{CONTRACTOR_TRADES.map(t=><option key={t}>{t}</option>)}</select></Fld>
          <Fld label="Phone"><input value={f.phone||""} onChange={upd("phone")} placeholder="07700 900000" style={T.inp}/></Fld>
          <Fld label="Email"><input type="email" value={f.email||""} onChange={upd("email")} placeholder="john@tradeco.co.uk" style={T.inp}/></Fld>
          <Fld label="Company Name"><input value={f.company||""} onChange={upd("company")} placeholder="Smith Plumbing Ltd" style={T.inp}/></Fld>
          <Fld label="Hourly Rate (£)"><input type="number" value={f.hourlyRate||""} onChange={upd("hourlyRate")} placeholder="45" style={T.inp} min="0"/></Fld>
          <div style={{gridColumn:"1/-1"}}><Fld label="Notes / Qualifications"><textarea value={f.notes||""} onChange={upd("notes")} placeholder="Gas Safe registered, emergency callouts, etc…" style={T.tex}/></Fld></div>
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"flex-end",paddingTop:8}}><button onClick={()=>setModal(false)} style={T.sec}>Cancel</button><button onClick={doSave} style={T.pri}>{editing?"Save":"Add Contractor"}</button></div>
      </Modal>
      <Modal open={!!delId} onClose={()=>setDelId(null)} title="Remove Contractor" width={400}>
        <p style={{color:"#4A5568",lineHeight:1.7,marginBottom:24}}>Remove this contractor from your directory?</p>
        <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}><button onClick={()=>setDelId(null)} style={T.sec}>Cancel</button><button onClick={()=>doDelete(delId)} style={T.dan}>Remove</button></div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE: VOID PERIOD TRACKER
// ══════════════════════════════════════════════════════════════════
function VoidsPage({ctx}){
  const{myData,db,save,showToast,user}=ctx;
  const voids=myData.voids||[];const{properties,tenancies}=myData;
  const[modal,setModal]=useState(false);
  const[editing,setEditing]=useState(null);
  const[selProp,setSelProp]=useState("all");
  const blank={propertyId:"",startDate:today(),endDate:"",reason:"Between tenancies",notes:""};
  const[f,setF]=useState(blank);
  const upd=k=>e=>setF(x=>({...x,[k]:e.target.value}));
  const openAdd=()=>{setEditing(null);setF({...blank,propertyId:properties[0]?.id||""});setModal(true);};
  const openEdit=v=>{setEditing(v);setF({...v});setModal(true);};
  const doSave=()=>{
    if(!f.propertyId||!f.startDate){showToast("Property and start date required.","error");return;}
    const v=editing?{...editing,...f}:{...f,id:uid(),landlordId:user.id,createdAt:today()};
    const u2=editing?(db.voids||[]).map(x=>x.id===editing.id?v:x):[...(db.voids||[]),v];
    save("voids",u2);setModal(false);showToast(editing?"Updated!":"Void period logged!");
  };
  const doDelete=id=>{save("voids",(db.voids||[]).filter(v=>v.id!==id));showToast("Deleted.");};
  const voidDays=v=>{
    const s=new Date(v.startDate);
    const e=v.endDate?new Date(v.endDate):new Date();
    return Math.max(0,Math.ceil((e-s)/86400000));
  };
  const lostRent=v=>{
    const prop=properties.find(p=>p.id===v.propertyId);
    const daily=Number(prop?.monthlyRent||0)/30;
    return daily*voidDays(v);
  };
  // Auto-detect voids: gaps > 7 days between tenancies per property
  const autoVoids=[];
  properties.forEach(p=>{
    const pts=[...tenancies.filter(t=>t.propertyId===p.id)].sort((a,b)=>new Date(a.startDate)-new Date(b.startDate));
    for(let i=0;i<pts.length-1;i++){
      const end=pts[i].endDate;
      const start=pts[i+1].startDate;
      if(end&&start){
        const gap=Math.ceil((new Date(start)-new Date(end))/86400000);
        if(gap>7)autoVoids.push({id:"auto-"+pts[i].id,auto:true,propertyId:p.id,startDate:end,endDate:start,reason:"Between tenancies",days:gap});
      }
    }
  });
  const all=[...voids,...autoVoids.filter(av=>!voids.some(v=>v.propertyId===av.propertyId&&v.startDate===av.startDate))];
  const shown=selProp==="all"?all:all.filter(v=>v.propertyId===selProp);
  const totalDays=shown.reduce((s,v)=>s+voidDays(v),0);
  const totalLost=shown.reduce((s,v)=>s+lostRent(v),0);
  const activeVoids=shown.filter(v=>!v.endDate);
  return(
    <div>
      <PH title="Void Period Tracker" sub="Track empty periods between tenancies and lost rent"
        right={<button onClick={openAdd} style={T.pri} disabled={properties.length===0}>+ Log Void Period</button>}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20,marginBottom:24}}>
        <SC label="Total Void Days" value={totalDays} icon="📅" color="#E8A838" sub={`${all.length} void periods`}/>
        <SC label="Estimated Lost Rent" value={gbp(totalLost)} icon="💷" color="#E53E3E" sub="based on monthly rent"/>
        <SC label="Currently Void" value={activeVoids.length} icon="🏚️" color={activeVoids.length>0?"#E53E3E":"#2AAE7F"} sub="active empty periods"/>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
        <button onClick={()=>setSelProp("all")} style={{padding:"8px 16px",borderRadius:20,border:`1.5px solid ${selProp==="all"?"#2D5BE3":"#D5E0EE"}`,background:selProp==="all"?"#2D5BE3":"white",color:selProp==="all"?"white":"#4A5568",cursor:"pointer",fontSize:13,fontWeight:selProp==="all"?700:500}}>All Properties</button>
        {properties.map(p=>(<button key={p.id} onClick={()=>setSelProp(p.id)} style={{padding:"8px 16px",borderRadius:20,border:`1.5px solid ${selProp===p.id?"#2D5BE3":"#D5E0EE"}`,background:selProp===p.id?"#2D5BE3":"white",color:selProp===p.id?"white":"#4A5568",cursor:"pointer",fontSize:12,fontWeight:selProp===p.id?700:500,whiteSpace:"nowrap"}}>{p.address.split(",")[0]}</button>))}
      </div>
      <Card>
        {shown.length===0?<Empty icon="🏠" title="No void periods" sub="Log void periods manually or they will be auto-detected from tenancy gaps"/>:(
          <div style={{overflowX:"auto"}}>
            <table>
              <thead><tr><th>Property</th><th>Start</th><th>End</th><th>Duration</th><th>Est. Lost</th><th>Reason</th><th>Source</th><th style={{textAlign:"right"}}>Actions</th></tr></thead>
              <tbody>{shown.map(v=>{
                const prop=properties.find(p=>p.id===v.propertyId);
                const days=voidDays(v);
                const lost=lostRent(v);
                const ongoing=!v.endDate;
                return(<tr key={v.id}>
                  <td style={{fontWeight:600,color:"#1B2B4B"}}>{prop?.address||"–"}</td>
                  <td>{fmt(v.startDate)}</td>
                  <td>{v.endDate?fmt(v.endDate):<span style={{background:"#FDE8E8",color:"#C53030",padding:"2px 8px",borderRadius:8,fontSize:12,fontWeight:700}}>ONGOING</span>}</td>
                  <td style={{fontWeight:700,color:days>30?"#C53030":days>14?"#C05621":"#2AAE7F"}}>{days}d</td>
                  <td style={{fontWeight:700,color:"#E53E3E"}}>{gbp(lost)}</td>
                  <td style={{fontSize:13,color:"#6B7C93"}}>{v.reason||"–"}</td>
                  <td>{v.auto?<span style={{background:"#EBF4FF",color:"#2B6CB0",padding:"2px 8px",borderRadius:8,fontSize:11,fontWeight:700}}>AUTO</span>:<span style={{background:"#F0F4F8",color:"#6B7C93",padding:"2px 8px",borderRadius:8,fontSize:11,fontWeight:700}}>MANUAL</span>}</td>
                  <td style={{textAlign:"right"}}>{!v.auto&&<div style={{display:"flex",gap:6,justifyContent:"flex-end"}}><button onClick={()=>openEdit(v)} style={{...T.sec,padding:"5px 12px",fontSize:12}}>Edit</button><button onClick={()=>doDelete(v.id)} style={T.dan}>Del</button></div>}</td>
                </tr>);
              })}</tbody>
            </table>
          </div>
        )}
      </Card>
      <Modal open={modal} onClose={()=>setModal(false)} title={editing?"Edit Void Period":"Log Void Period"}>
        <Fld label="Property" required><select value={f.propertyId} onChange={upd("propertyId")} style={T.sel}><option value="">-- Select --</option>{properties.map(p=><option key={p.id} value={p.id}>{p.address}</option>)}</select></Fld>
        <GG cols={2}><Fld label="Start Date" required><input type="date" value={f.startDate} onChange={upd("startDate")} style={T.inp}/></Fld><Fld label="End Date (blank = ongoing)"><input type="date" value={f.endDate||""} onChange={upd("endDate")} style={T.inp}/></Fld></GG>
        <Fld label="Reason"><select value={f.reason} onChange={upd("reason")} style={T.sel}>{VOID_REASONS.map(r=><option key={r}>{r}</option>)}</select></Fld>
        <Fld label="Notes"><textarea value={f.notes||""} onChange={upd("notes")} style={T.tex}/></Fld>
        <div style={{display:"flex",gap:12,justifyContent:"flex-end",paddingTop:8}}><button onClick={()=>setModal(false)} style={T.sec}>Cancel</button><button onClick={doSave} style={T.pri}>{editing?"Save":"Log Void"}</button></div>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE: SA105 TAX SUMMARY
// ══════════════════════════════════════════════════════════════════
function SA105Page({ctx}){
  const{myData}=ctx;
  const expenses=myData.expenses||[];const{payments,properties}=myData;
  const[taxYear,setTaxYear]=useState(()=>{const n=new Date();return n.getMonth()>=3?n.getFullYear():n.getFullYear()-1;});
  const tyS=new Date(taxYear,3,6),tyE=new Date(taxYear+1,3,5);
  const inTY=d=>d&&new Date(d)>=tyS&&new Date(d)<=tyE;
  const totalInc=payments.filter(p=>p.status==="paid"&&inTY(p.paidDate||p.dueDate)).reduce((s,p)=>s+Number(p.amount||0),0);
  const expArr=expenses||[];
  const catTotal=catId=>expArr.filter(e=>e.category===catId&&inTY(e.date)).reduce((s,e)=>s+Number(e.amount||0),0);
  const rows=SA105_ROWS.map(r=>({...r,value:r.income?totalInc:(r.cats||[]).reduce((s,c)=>s+catTotal(c),0)}));
  const totalExp=rows.filter(r=>!r.income).reduce((s,r)=>s+r.value,0);
  const netProfit=totalInc-totalExp;
  const printSA105=()=>{
    const lines=rows.map(r=>`Box ${r.box.padEnd(4)} ${r.label.padEnd(50)} £${r.value.toFixed(2)}`).join("\n");
    const w=window.open("","_blank","width=800,height=700");
    w.document.write(`<!DOCTYPE html><html><head><title>SA105 Summary ${taxYear}/${taxYear+1}</title><style>body{font-family:'Courier New',monospace;font-size:13px;padding:40px;max-width:700px;margin:auto;line-height:2}h2{font-family:Georgia,serif}hr{border:1px solid #ccc;margin:16px 0}.net{font-size:16px;font-weight:bold}</style></head><body><h2>SA105 UK Property Income — Tax Year ${taxYear}/${taxYear+1}</h2><hr><pre>${lines}</pre><hr><div class="net">Net Profit / (Loss): £${netProfit.toFixed(2)}</div><br><small>Generated by LandlordPro. This is a summary only — always verify with HMRC guidance or a qualified accountant before submission.</small></body></html>`);
    w.document.close();w.print();
  };
  return(
    <div>
      <PH title="SA105 Tax Summary" sub="UK Property Income supplementary page summary"
        right={<div style={{display:"flex",gap:10,alignItems:"center"}}>
          <select value={taxYear} onChange={e=>setTaxYear(Number(e.target.value))} style={{...T.sel,width:"auto",padding:"8px 14px",fontSize:13}}>
            {[...Array(5)].map((_,i)=>{const y=new Date().getFullYear()-i;return <option key={y} value={y}>{y}/{y+1}</option>;})}
          </select>
          <button onClick={printSA105} style={T.gol}>🖨️ Print / Save PDF</button>
        </div>}/>
      <div style={{background:"#EBF4FF",border:"1px solid #BEE3F8",borderRadius:12,padding:"12px 20px",marginBottom:24,fontSize:13,color:"#2B6CB0",lineHeight:1.7}}>
        ℹ️ This summary maps your LandlordPro data to the main SA105 boxes. It is a <strong>guide only</strong> — always verify figures with HMRC guidance or your accountant before submitting your Self Assessment return.
      </div>
      <GG cols={2} gap={24}>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <Card>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"#1B2B4B",marginBottom:16}}>Income</div>
            {rows.filter(r=>r.income).map(r=>(<div key={r.box} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 16px",background:"#F0FFF6",borderRadius:12,border:"1px solid #9AE6B4"}}>
              <div><div style={{fontSize:11,color:"#2AAE7F",fontWeight:700,textTransform:"uppercase",letterSpacing:".5px"}}>Box {r.box}</div><div style={{fontWeight:600,color:"#1B2B4B",fontSize:14,marginTop:2}}>{r.label}</div></div>
              <div style={{fontWeight:800,fontSize:20,color:"#2AAE7F",fontFamily:"Playfair Display,serif"}}>{gbp(r.value)}</div>
            </div>))}
          </Card>
          <Card>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"#1B2B4B",marginBottom:16}}>Allowable Expenses</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {rows.filter(r=>!r.income).map(r=>(<div key={r.box} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",background:r.value>0?"#FFF8F0":"#F8FAFD",borderRadius:10,border:`1px solid ${r.value>0?"#FBD38D":"#EBF0FA"}`}}>
                <div><div style={{fontSize:11,color:"#C05621",fontWeight:700,textTransform:"uppercase",letterSpacing:".5px"}}>Box {r.box}</div><div style={{fontWeight:500,color:"#1B2B4B",fontSize:13,marginTop:1}}>{r.label}</div></div>
                <div style={{fontWeight:700,fontSize:16,color:r.value>0?"#E53E3E":"#6B7C93"}}>{gbp(r.value)}</div>
              </div>))}
            </div>
          </Card>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <Card style={{background:"linear-gradient(160deg,#080F1E,#142B5A)",borderRadius:20}}>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:20,fontWeight:700,color:"white",marginBottom:20}}>Summary</div>
            {[{l:"Gross Rental Income",v:gbp(totalInc),c:"#2AAE7F"},{l:"Total Allowable Expenses",v:gbp(totalExp),c:"#E8A838"},{l:"Net Profit / (Loss)",v:gbp(netProfit),c:netProfit>=0?"#2AAE7F":"#E53E3E",big:true}].map(r=>(<div key={r.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:"1px solid rgba(255,255,255,.08)"}}><span style={{color:"rgba(255,255,255,.7)",fontSize:r.big?15:13}}>{r.l}</span><span style={{fontWeight:r.big?900:700,fontSize:r.big?24:16,color:r.c,fontFamily:r.big?"Playfair Display,serif":"inherit"}}>{r.v}</span></div>))}
            <div style={{marginTop:16,padding:"14px 16px",background:"rgba(232,168,56,.12)",borderRadius:12,border:"1px solid rgba(232,168,56,.25)"}}>
              <div style={{color:"#E8A838",fontWeight:700,fontSize:11,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>Basic Rate Tax Estimate</div>
              <div style={{color:"rgba(255,255,255,.7)",fontSize:13,lineHeight:1.7}}>At 20%: <strong style={{color:"white"}}>{gbp(Math.max(0,netProfit)*0.2)}</strong><br/>At 40%: <strong style={{color:"white"}}>{gbp(Math.max(0,netProfit)*0.4)}</strong><br/><span style={{fontSize:11,opacity:.6}}>Note: mortgage interest is a 20% tax credit (not deducted above)</span></div>
            </div>
          </Card>
          <Card>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"#1B2B4B",marginBottom:16}}>Per Property</div>
            {properties.length===0?<Empty icon="🏢" title="No properties" sub=""/>:(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {properties.map(p=>{const pI=payments.filter(x=>x.propertyId===p.id&&x.status==="paid"&&inTY(x.paidDate||x.dueDate)).reduce((s,x)=>s+Number(x.amount||0),0);const pE=expArr.filter(x=>x.propertyId===p.id&&inTY(x.date)).reduce((s,x)=>s+Number(x.amount||0),0);const net=pI-pE;return(<div key={p.id} style={{padding:"12px 14px",background:"#F8FAFD",borderRadius:12,border:"1px solid #EBF0FA"}}><div style={{fontWeight:600,color:"#1B2B4B",fontSize:14,marginBottom:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.address}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>{[{l:"Income",v:gbp(pI),c:"#2AAE7F"},{l:"Expenses",v:gbp(pE),c:"#E53E3E"},{l:"Net",v:gbp(net),c:net>=0?"#2AAE7F":"#E53E3E"}].map(r=>(<div key={r.l} style={{textAlign:"center"}}><div style={{fontSize:11,color:"#6B7C93",marginBottom:3}}>{r.l}</div><div style={{fontWeight:700,fontSize:13,color:r.c}}>{r.v}</div></div>))}</div></div>);} )}
              </div>
            )}
          </Card>
          <Card>
            <div style={{fontFamily:"Playfair Display,serif",fontSize:18,fontWeight:700,color:"#1B2B4B",marginBottom:12}}>Key Deadlines</div>
            {[{d:"31 Jan "+( taxYear+2),l:"Online SA return filing deadline",urg:true},{d:"31 Jan "+(taxYear+2),l:"Tax payment deadline (if owed)",urg:true},{d:"31 Jul "+(taxYear+2),l:"Second payment on account (if applicable)",urg:false},{d:"5 Apr "+(taxYear+1),l:"End of tax year "+taxYear+"/"+( taxYear+1),urg:false}].map(d=>(<div key={d.d} style={{display:"flex",gap:12,padding:"10px 0",borderBottom:"1px solid #F0F4FA"}}><div style={{width:10,height:10,borderRadius:"50%",background:d.urg?"#E53E3E":"#E8A838",marginTop:4,flexShrink:0}}/><div><div style={{fontSize:13,fontWeight:600,color:"#1B2B4B"}}>{d.l}</div><div style={{fontSize:12,color:"#6B7C93",marginTop:2}}>{d.d}</div></div></div>))}
          </Card>
        </div>
      </GG>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE: DOCUMENTS (File Upload & Storage)
// ══════════════════════════════════════════════════════════════════
function DocumentsPage({ctx}){
  const{myData,db,save,showToast,user}=ctx;
  const docs=myData.documents||[];
  const{properties,tenancies}=myData;
  const[uploading,setUploading]=useState(false);
  const[modal,setModal]=useState(false);
  const[viewDoc,setViewDoc]=useState(null);
  const[selProp,setSelProp]=useState("all");
  const[f,setF]=useState({propertyId:"",tenancyId:"",name:"",notes:""});
  const[fileData,setFileData]=useState(null);
  const upd=k=>e=>setF(x=>({...x,[k]:e.target.value}));
  const propTens=f.propertyId?tenancies.filter(t=>t.propertyId===f.propertyId):[];
  const shown=selProp==="all"?docs:docs.filter(d=>d.propertyId===selProp);
  const openUpload=()=>{setF({propertyId:properties[0]?.id||"",tenancyId:"",name:"",notes:""});setFileData(null);setModal(true);};
  const onFileChange=e=>{
    const file=e.target.files[0];
    if(!file)return;
    if(file.size>4*1024*1024){showToast("File too large. Max 4MB.","error");return;}
    const reader=new FileReader();
    reader.onload=ev=>{setFileData({dataUrl:ev.target.result,name:file.name,type:file.type,size:file.size});setF(x=>({...x,name:x.name||file.name}));};
    reader.readAsDataURL(file);
  };
  const doUpload=async()=>{
    if(!fileData){showToast("Please select a file.","error");return;}
    if(!f.propertyId){showToast("Please select a property.","error");return;}
    setUploading(true);
    try{
      const id=uid();
      const meta={id,landlordId:user.id,propertyId:f.propertyId,tenancyId:f.tenancyId||"",name:f.name||fileData.name,fileType:fileData.type,size:fileData.size,notes:f.notes,uploadedAt:today()};
      await DB.set("file_"+id,fileData.dataUrl);
      const newDocs=[...(db.documents||[]),meta];
      save("documents",newDocs);
      setModal(false);setFileData(null);
      showToast("Document uploaded!");
    }catch(e){showToast("Upload failed. File may be too large.","error");}
    setUploading(false);
  };
  const downloadDoc=async(doc)=>{
    const data=await DB.get("file_"+doc.id);
    if(!data){showToast("File not found.","error");return;}
    const a=document.createElement("a");a.href=data;a.download=doc.name;document.body.appendChild(a);a.click();document.body.removeChild(a);
  };
  const deleteDoc=async(id)=>{
    try{localStorage.removeItem("lp_file_"+id);}catch{}
    save("documents",(db.documents||[]).filter(d=>d.id!==id));
    showToast("Deleted.");
  };
  const viewFile=async(doc)=>{
    const data=await DB.get("file_"+doc.id);
    if(!data){showToast("File not found.","error");return;}
    setViewDoc({...doc,dataUrl:data});
  };
  const fmtSize=n=>{if(n>1024*1024)return(n/1024/1024).toFixed(1)+" MB";if(n>1024)return(n/1024).toFixed(0)+" KB";return n+" B";};
  const fileIcon=t=>{if(!t)return"📎";if(t.includes("pdf"))return"📄";if(t.includes("image"))return"🖼️";if(t.includes("word")||t.includes("document"))return"📝";if(t.includes("sheet")||t.includes("excel"))return"📊";return"📎";};
  const DOC_TYPES=[{label:"All",id:"all"},{label:"Tenancy Agreements",id:"tenancy"},{label:"Gas Certificates",id:"gas"},{label:"Insurance",id:"insurance"},{label:"Other",id:"other"}];
  return(
    <div>
      <PH title="Documents" sub={`${docs.length} document${docs.length!==1?"s":""} stored`}
        right={<button onClick={openUpload} style={T.pri}>⬆ Upload Document</button>}/>
      <div style={{background:"#EBF4FF",border:"1px solid #BEE3F8",borderRadius:12,padding:"12px 20px",marginBottom:22,fontSize:13,color:"#2B6CB0"}}>
        📁 Files are stored securely in your browser storage. Max 4MB per file. For best results, upload PDFs or images.
      </div>
      <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
        <button onClick={()=>setSelProp("all")} style={{padding:"7px 16px",borderRadius:20,border:`1.5px solid ${selProp==="all"?"#2D5BE3":"#D5E0EE"}`,background:selProp==="all"?"#2D5BE3":"white",color:selProp==="all"?"white":"#4A5568",cursor:"pointer",fontSize:13,fontWeight:selProp==="all"?700:500}}>All Properties</button>
        {properties.map(p=>(<button key={p.id} onClick={()=>setSelProp(p.id)} style={{padding:"7px 16px",borderRadius:20,border:`1.5px solid ${selProp===p.id?"#2D5BE3":"#D5E0EE"}`,background:selProp===p.id?"#2D5BE3":"white",color:selProp===p.id?"white":"#4A5568",cursor:"pointer",fontSize:12,fontWeight:selProp===p.id?700:500,whiteSpace:"nowrap"}}>{p.address.split(",")[0]}</button>))}
      </div>
      <Card>
        {shown.length===0?<Empty icon="📁" title="No documents yet" sub='Click "Upload Document" to store tenancy agreements, certificates and more'/>:(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
            {shown.map(doc=>{const prop=properties.find(p=>p.id===doc.propertyId);const ten=tenancies.find(t=>t.id===doc.tenancyId);return(<div key={doc.id} style={{background:"#F8FAFD",borderRadius:14,padding:"16px 18px",border:"1px solid #EBF0FA",display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:46,height:46,background:"white",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,border:"1px solid #E8F0FA",flexShrink:0}}>{fileIcon(doc.fileType)}</div>
                <div style={{flex:1,overflow:"hidden"}}><div style={{fontWeight:700,fontSize:14,color:"#1B2B4B",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.name}</div><div style={{fontSize:12,color:"#6B7C93",marginTop:2}}>{fmtSize(doc.size)} · {fmt(doc.uploadedAt)}</div></div>
              </div>
              <div style={{fontSize:12,color:"#4A5568"}}>{prop?.address||"–"}{ten?<span style={{color:"#7C3AED"}}> · {ten.tenantName}</span>:""}</div>
              {doc.notes&&<div style={{fontSize:12,color:"#6B7C93",lineHeight:1.5}}>{doc.notes}</div>}
              <div style={{display:"flex",gap:8,paddingTop:6,borderTop:"1px solid #EBF0FA"}}>
                {(doc.fileType||"").includes("image")&&<button onClick={()=>viewFile(doc)} style={{...T.sec,padding:"5px 12px",fontSize:12}}>👁 View</button>}
                {(doc.fileType||"").includes("pdf")&&<button onClick={()=>viewFile(doc)} style={{...T.sec,padding:"5px 12px",fontSize:12}}>👁 View</button>}
                <button onClick={()=>downloadDoc(doc)} style={{...T.grn,padding:"5px 12px"}}>⬇ Download</button>
                <button onClick={()=>deleteDoc(doc.id)} style={T.dan}>Del</button>
              </div>
            </div>);})}
          </div>
        )}
      </Card>
      {/* Upload Modal */}
      <Modal open={modal} onClose={()=>setModal(false)} title="Upload Document" width={560}>
        <div style={{border:"2px dashed #D5E0EE",borderRadius:14,padding:"28px 20px",textAlign:"center",marginBottom:18,background:"#FAFCFE",cursor:"pointer"}} onClick={()=>document.getElementById("fileInput").click()}>
          <input id="fileInput" type="file" style={{display:"none"}} onChange={onFileChange} accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx"/>
          {fileData?(<div><div style={{fontSize:32,marginBottom:8}}>{fileIcon(fileData.type)}</div><div style={{fontWeight:700,color:"#1B2B4B",fontSize:14}}>{fileData.name}</div><div style={{color:"#6B7C93",fontSize:13,marginTop:4}}>{fmtSize(fileData.size)}</div><div style={{color:"#2D5BE3",fontSize:12,marginTop:8,fontWeight:600}}>Click to change file</div></div>):(<><div style={{fontSize:36,marginBottom:8}}>📁</div><div style={{fontWeight:600,color:"#1B2B4B",fontSize:14}}>Click to select file</div><div style={{color:"#6B7C93",fontSize:13,marginTop:4}}>PDF, images, Word, Excel · Max 4MB</div></>)}
        </div>
        <GG cols={2}>
          <Fld label="Property" required><select value={f.propertyId} onChange={e=>{setF(x=>({...x,propertyId:e.target.value,tenancyId:""}));}} style={T.sel}><option value="">-- Select --</option>{properties.map(p=><option key={p.id} value={p.id}>{p.address}</option>)}</select></Fld>
          <Fld label="Link to Tenancy (optional)"><select value={f.tenancyId} onChange={upd("tenancyId")} style={T.sel}><option value="">-- None --</option>{propTens.map(t=><option key={t.id} value={t.id}>{t.tenantName}</option>)}</select></Fld>
        </GG>
        <Fld label="Document Name"><input value={f.name||""} onChange={upd("name")} placeholder="e.g. Tenancy Agreement Jan 2025" style={T.inp}/></Fld>
        <Fld label="Notes"><textarea value={f.notes||""} onChange={upd("notes")} placeholder="Brief description…" style={{...T.tex,minHeight:60}}/></Fld>
        <div style={{display:"flex",gap:12,justifyContent:"flex-end",paddingTop:8}}><button onClick={()=>setModal(false)} style={T.sec}>Cancel</button><button onClick={doUpload} disabled={uploading} style={{...T.pri,opacity:uploading?.7:1}}>{uploading?"Uploading…":"Upload Document"}</button></div>
      </Modal>
      {/* View Modal */}
      <Modal open={!!viewDoc} onClose={()=>setViewDoc(null)} title={viewDoc?.name||"Document"} width={760}>
        {viewDoc&&(<><div style={{borderRadius:12,overflow:"hidden",maxHeight:500,border:"1px solid #E8F0FA"}}>
          {(viewDoc.fileType||"").includes("image")?<img src={viewDoc.dataUrl} alt={viewDoc.name} style={{width:"100%",height:"auto",display:"block"}}/>:<iframe src={viewDoc.dataUrl} style={{width:"100%",height:480,border:"none"}} title={viewDoc.name}/>}
        </div><div style={{display:"flex",gap:12,justifyContent:"flex-end",paddingTop:16}}><button onClick={()=>downloadDoc(viewDoc)} style={T.grn}>⬇ Download</button><button onClick={()=>setViewDoc(null)} style={T.sec}>Close</button></div></>)}
      </Modal>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════
// PAGE: RIGHT TO RENT LOG
// ══════════════════════════════════════════════════════════════════
function RightToRentPage({ctx}){
  const{myData,db,save,showToast,user,isMobile}=ctx;
  const rtr=myData.rtr||[];
  const{tenancies,properties}=myData;
  const[modal,setModal]=useState(false);
  const[editing,setEditing]=useState(null);
  const[viewId,setViewId]=useState(null);
  const blank={tenancyId:"",propertyId:"",tenantName:"",docType:"UK or Irish Passport",docRef:"",checkDate:today(),expiryDate:"",notes:""};
  const[f,setF]=useState(blank);
  const upd=k=>e=>setF(x=>({...x,[k]:e.target.value}));
  const onTenChange=e=>{
    const t=tenancies.find(x=>x.id===e.target.value);
    setF(x=>({...x,tenancyId:e.target.value,propertyId:t?.propertyId||"",tenantName:t?.tenantName||""}));
  };
  const doSave=()=>{
    if(!f.tenantName||!f.docType||!f.checkDate){showToast("Tenant, document type and check date required.","error");return;}
    const r=editing?{...editing,...f}:{...f,id:uid(),landlordId:user.id,timeLimit:RTR_TIME_LIMITED.has(f.docType),createdAt:today()};
    const u2=editing?(db.rtr||[]).map(x=>x.id===editing.id?r:x):[...(db.rtr||[]),r];
    save("rtr",u2);setModal(false);showToast(editing?"Updated!":"Check recorded!");
  };
  const doDelete=id=>{save("rtr",(db.rtr||[]).filter(r=>r.id!==id));showToast("Deleted.");};
  const rtrStatus=r=>{
    if(!r.timeLimit)return"unlimited";
    if(!r.expiryDate)return"unknown";
    const d=daysTo(r.expiryDate);
    if(d<0)return"expired";
    if(d<=30)return"expiring";
    return"valid";
  };
  const statusStyle={
    unlimited:{bg:"#D4FAE6",c:"#1A7A4A",t:"Unlimited"},
    valid:{bg:"#D4FAE6",c:"#1A7A4A",t:"Valid"},
    expiring:{bg:"#FEEBC8",c:"#C05621",t:"Expiring Soon"},
    expired:{bg:"#FDE8E8",c:"#C53030",t:"Expired"},
    unknown:{bg:"#EDF2F7",c:"#4A5568",t:"Unknown"},
  };
  const expiring30=rtr.filter(r=>rtrStatus(r)==="expiring");
  const expired=rtr.filter(r=>rtrStatus(r)==="expired");
  const limited=rtr.filter(r=>r.timeLimit);
  const viewR=rtr.find(r=>r.id===viewId);
  return(
    <div>
      <div className="ph-wrap" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontFamily:"Playfair Display,serif",fontSize:isMobile?22:28,fontWeight:700,color:"#1B2B4B",lineHeight:1.2}}>Right to Rent Log</h1>
          <p style={{color:"#6B7C93",fontSize:14,marginTop:4}}>UK landlord legal requirement — check before every tenancy</p>
        </div>
        <button onClick={()=>{setEditing(null);setF({...blank,tenancyId:tenancies[0]?.id||"",propertyId:tenancies[0]?.propertyId||"",tenantName:tenancies[0]?.tenantName||""});setModal(true);}} style={T.pri}>+ Record Check</button>
      </div>

      {(expiring30.length>0||expired.length>0)&&(
        <Card style={{marginBottom:20,border:"1px solid #FEE2B6"}}>
          <div style={{fontWeight:700,color:"#C53030",fontSize:15,marginBottom:12}}>⚠️ Action Required ({expiring30.length+expired.length})</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {expired.map(r=>{const prop=properties.find(p=>p.id===r.propertyId);return(<div key={r.id} style={{background:"#FDE8E8",borderRadius:10,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}><span style={{fontSize:14,color:"#2D3748"}}><strong style={{color:"#C53030"}}>EXPIRED:</strong> {r.tenantName} at {prop?.address||"–"} — check expired {fmt(r.expiryDate)}</span><button onClick={()=>{setEditing(r);setF({...r});setModal(true);}} style={T.dan}>Re-check</button></div>);})}
            {expiring30.map(r=>{const d=daysTo(r.expiryDate);const prop=properties.find(p=>p.id===r.propertyId);return(<div key={r.id} style={{background:"#FEEBC8",borderRadius:10,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}><span style={{fontSize:14}}><strong style={{color:"#C05621"}}>Re-check needed in {d} days:</strong> {r.tenantName} at {prop?.address||"–"}</span><button onClick={()=>{setEditing(r);setF({...r});setModal(true);}} style={T.gol}>Update</button></div>);})}
          </div>
        </Card>
      )}

      <div className="stat-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,marginBottom:24}}>
        <SC label="Total Checks" value={rtr.length} icon="✅" color="#2D5BE3"/>
        <SC label="Time-Limited" value={limited.length} icon="⏳" color="#E8A838" sub="need re-checking"/>
        <SC label="Expiring ≤30 days" value={expiring30.length} icon="⚠️" color={expiring30.length>0?"#E8A838":"#2AAE7F"}/>
        <SC label="Expired" value={expired.length} icon="🚨" color={expired.length>0?"#E53E3E":"#2AAE7F"}/>
      </div>

      <Card>
        {rtr.length===0?(<Empty icon="🪪" title="No Right to Rent checks recorded" sub='Click "+ Record Check" — required before every tenancy in the UK'/>):(
          <div className="mob-scroll" style={{overflowX:"auto"}}>
            <table>
              <thead><tr><th>Tenant</th><th>Property</th>{!isMobile&&<th>Document Type</th>}{!isMobile&&<th>Check Date</th>}<th>Expiry</th><th>Status</th><th style={{textAlign:"right"}}>Actions</th></tr></thead>
              <tbody>
                {[...rtr].sort((a,b)=>new Date(b.checkDate)-new Date(a.checkDate)).map(r=>{
                  const prop=properties.find(p=>p.id===r.propertyId);
                  const st=rtrStatus(r);const ss=statusStyle[st]||statusStyle.unknown;
                  return(<tr key={r.id}>
                    <td><div style={{fontWeight:600,color:"#1B2B4B"}}>{r.tenantName}</div><div style={{fontSize:12,color:"#6B7C93"}}>{r.docType}</div></td>
                    <td style={{fontSize:13,color:"#4A5568"}}>{prop?.address||"–"}</td>
                    {!isMobile&&<td style={{fontSize:13}}>{r.docType}</td>}
                    {!isMobile&&<td>{fmt(r.checkDate)}</td>}
                    <td>{r.expiryDate?fmt(r.expiryDate):<span style={{color:"#2AAE7F",fontSize:12,fontWeight:600}}>Unlimited</span>}</td>
                    <td><span style={{background:ss.bg,color:ss.c,padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>{ss.t}</span></td>
                    <td style={{textAlign:"right"}}><div style={{display:"flex",gap:6,justifyContent:"flex-end"}}><button onClick={()=>setViewId(r.id)} style={{...T.sec,padding:"5px 12px",fontSize:12}}>View</button><button onClick={()=>{setEditing(r);setF({...r});setModal(true);}} style={{...T.sec,padding:"5px 12px",fontSize:12}}>Edit</button><button onClick={()=>doDelete(r.id)} style={T.dan}>Del</button></div></td>
                  </tr>);
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card style={{marginTop:20,background:"linear-gradient(160deg,#080F1E,#142B5A)"}}>
        <div style={{fontFamily:"Playfair Display,serif",fontSize:16,fontWeight:700,color:"#E8A838",marginBottom:12}}>📋 UK Right to Rent — Key Facts</div>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:14}}>
          {[
            {t:"Before tenancy",d:"You must check documents BEFORE the tenancy start date. Failing to do so means the statutory excuse does not apply."},
            {t:"Civil penalty",d:"Up to £3,000 per tenant for a first breach. Up to £20,000 per tenant for repeat breaches."},
            {t:"Time-limited",d:"For tenants with time-limited permission, you must carry out a follow-up check when their permission expires."},
            {t:"Share Codes",d:"For EU/EEA nationals, check their status online using gov.uk/view-right-to-rent. Print or save the response."},
          ].map(x=>(<div key={x.t} style={{padding:"12px 14px",background:"rgba(255,255,255,.06)",borderRadius:10,border:"1px solid rgba(255,255,255,.08)"}}><div style={{color:"#E8A838",fontWeight:700,fontSize:12,marginBottom:4}}>{x.t}</div><div style={{color:"rgba(255,255,255,.72)",fontSize:13,lineHeight:1.6}}>{x.d}</div></div>))}
        </div>
      </Card>

      {/* Record / Edit Modal */}
      <Modal open={modal} onClose={()=>setModal(false)} title={editing?"Edit RTR Check":"Record Right to Rent Check"} width={600}>
        <Fld label="Tenant" required>
          <select value={f.tenancyId} onChange={onTenChange} style={T.sel}>
            <option value="">-- Select tenancy or type manually --</option>
            {tenancies.map(t=>{const p=properties.find(x=>x.id===t.propertyId);return <option key={t.id} value={t.id}>{t.tenantName} – {p?.address||"–"}</option>;})}
          </select>
        </Fld>
        {!f.tenancyId&&<Fld label="Tenant Name (if no tenancy)"><input value={f.tenantName||""} onChange={upd("tenantName")} placeholder="Full legal name" style={T.inp}/></Fld>}
        <Fld label="Document Type Checked" required>
          <select value={f.docType} onChange={e=>{setF(x=>({...x,docType:e.target.value,timeLimit:RTR_TIME_LIMITED.has(e.target.value)}));}} style={T.sel}>
            {RTR_DOCS.map(d=><option key={d}>{d}</option>)}
          </select>
        </Fld>
        {RTR_TIME_LIMITED.has(f.docType)&&<div style={{background:"#FEEBC8",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#C05621",border:"1px solid #F6BE5A"}}>⏳ <strong>Time-limited right to rent.</strong> You must re-check this tenant's permission before it expires.</div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <Fld label="Check Date" required><input type="date" value={f.checkDate} onChange={upd("checkDate")} style={T.inp}/></Fld>
          <Fld label="Permission Expiry (if time-limited)"><input type="date" value={f.expiryDate||""} onChange={upd("expiryDate")} style={T.inp}/></Fld>
          <Fld label="Document Ref / Number"><input value={f.docRef||""} onChange={upd("docRef")} placeholder="Passport no., share code, etc." style={T.inp}/></Fld>
        </div>
        <Fld label="Notes"><textarea value={f.notes||""} onChange={upd("notes")} placeholder="Additional notes, where document copy is filed, etc." style={T.tex}/></Fld>
        <div style={{display:"flex",gap:12,justifyContent:"flex-end",paddingTop:8}}><button onClick={()=>setModal(false)} style={T.sec}>Cancel</button><button onClick={doSave} style={T.pri}>{editing?"Save":"Record Check"}</button></div>
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewR} onClose={()=>setViewId(null)} title="Right to Rent Record" width={520}>
        {viewR&&(<>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            {[{l:"Tenant",v:viewR.tenantName},{l:"Document",v:viewR.docType},{l:"Reference",v:viewR.docRef||"–"},{l:"Check Date",v:fmt(viewR.checkDate)},{l:"Expiry",v:viewR.expiryDate?fmt(viewR.expiryDate):"Unlimited"},{l:"Status",v:statusStyle[rtrStatus(viewR)]?.t||"–"}].map(x=>(<div key={x.l} style={{background:"#F8FAFD",borderRadius:10,padding:"12px 14px"}}><div style={{fontSize:11,color:"#6B7C93",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{x.l}</div><div style={{fontWeight:600,color:"#1B2B4B",fontSize:14}}>{x.v}</div></div>))}
          </div>
          {viewR.notes&&<div style={{background:"#F8FAFD",borderRadius:10,padding:"12px 14px",marginBottom:16,color:"#4A5568",fontSize:13,lineHeight:1.6}}>{viewR.notes}</div>}
          <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}><button onClick={()=>setViewId(null)} style={T.sec}>Close</button></div>
        </>)}
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE: PROPERTY INSPECTIONS
// ══════════════════════════════════════════════════════════════════
function InspectionsPage({ctx}){
  const{myData,db,save,showToast,user,isMobile}=ctx;
  const inspections=myData.inspections||[];
  const{properties,tenancies}=myData;
  const[modal,setModal]=useState(false);
  const[viewing,setViewing]=useState(null);
  const[selProp,setSelProp]=useState(properties[0]?.id||"all");
  const[rating,setRating]=useState("Good");
  const[iDate,setIDate]=useState(today());
  const[iNext,setINext]=useState("");
  const[iTen,setITen]=useState("");
  const[iInspector,setIInspector]=useState("Landlord");
  const[iPresent,setIPresent]=useState(true);
  const[iNotes,setINotes]=useState("");
  const[rooms,setRooms]=useState(INSP_ROOMS.map(r=>({name:r,condition:"Good",issues:""})));
  const[actions,setActions]=useState([]);
  const[newRoom,setNewRoom]=useState("");
  const[newAction,setNewAction]=useState("");
  const propTens=tenancies.filter(t=>t.propertyId===selProp&&t.status==="active");
  const shown=selProp==="all"?inspections:inspections.filter(i=>i.propertyId===selProp);
  const addRoom=()=>{if(!newRoom.trim())return;setRooms(r=>[...r,{name:newRoom.trim(),condition:"Good",issues:""}]);setNewRoom("");};
  const updRoom=(idx,k,v)=>setRooms(r=>r.map((rm,i)=>i===idx?{...rm,[k]:v}:rm));
  const addAction=()=>{if(!newAction.trim())return;setActions(a=>[...a,{desc:newAction.trim(),urgent:false,done:false}]);setNewAction("");};
  const updAction=(idx,k,v)=>setActions(a=>a.map((x,i)=>i===idx?{...x,[k]:v}:x));
  const openNew=()=>{
    const propId=selProp==="all"?(properties[0]?.id||""):selProp;
    setRating("Good");setIDate(today());setINext("");setIInspector("Landlord");setIPresent(true);setINotes("");
    setRooms(INSP_ROOMS.map(r=>({name:r,condition:"Good",issues:""})));setActions([]);
    const pts=tenancies.filter(t=>t.propertyId===propId&&t.status==="active");
    setITen(pts[0]?.id||"");setModal(true);
  };
  const doSave=()=>{
    const propId=selProp==="all"?(properties[0]?.id||""):selProp;
    const insp={id:uid(),landlordId:user.id,propertyId:propId,tenancyId:iTen,date:iDate,nextDate:iNext,inspector:iInspector,tenantPresent:iPresent,overallRating:rating,rooms,actions,notes:iNotes,createdAt:today()};
    save("inspections",[...(db.inspections||[]),insp]);setModal(false);showToast("Inspection saved!");
  };
  const ratingColor={Excellent:"#2AAE7F","Good":"#2D5BE3",Satisfactory:"#E8A838","Needs Attention":"#E53E3E","Urgent Action Required":"#C53030"};
  const ratingBg={Excellent:"#D4FAE6","Good":"#EBF4FF",Satisfactory:"#FEEBC8","Needs Attention":"#FDE8E8","Urgent Action Required":"#FDE8E8"};
  const condColor={Excellent:"#2AAE7F",Good:"#2D5BE3",Fair:"#E8A838",Poor:"#E53E3E",Damaged:"#C53030"};
  const condBg={Excellent:"#D4FAE6",Good:"#EBF4FF",Fair:"#FEEBC8",Poor:"#FDE8E8",Damaged:"#FDE8E8"};
  const upcoming=inspections.filter(i=>i.nextDate&&daysTo(i.nextDate)!==null&&daysTo(i.nextDate)<=14&&daysTo(i.nextDate)>=0);
  return(
    <div>
      <div className="ph-wrap" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontFamily:"Playfair Display,serif",fontSize:isMobile?22:28,fontWeight:700,color:"#1B2B4B",lineHeight:1.2}}>Property Inspections</h1>
          <p style={{color:"#6B7C93",fontSize:14,marginTop:4}}>Mid-tenancy inspection reports and condition records</p>
        </div>
        <button onClick={openNew} style={T.pri} disabled={properties.length===0}>+ New Inspection</button>
      </div>

      {upcoming.length>0&&(<Card style={{marginBottom:20,border:"1px solid #BEE3F8"}}><div style={{fontWeight:700,color:"#2B6CB0",fontSize:14,marginBottom:10}}>📅 Upcoming Inspections ({upcoming.length})</div><div style={{display:"flex",flexDirection:"column",gap:8}}>{upcoming.map(i=>{const prop=properties.find(p=>p.id===i.propertyId);const d=daysTo(i.nextDate);return(<div key={i.id} style={{background:"#EBF4FF",borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}><span style={{fontSize:14,color:"#2D3748"}}><strong>{prop?.address||"–"}</strong> — due {fmt(i.nextDate)} ({d===0?"today":`in ${d} day${d===1?"":"s"}`})</span><button onClick={openNew} style={{...T.pri,padding:"6px 14px",fontSize:12}}>Inspect</button></div>);})}</div></Card>)}

      <div className="stat-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20,marginBottom:24}}>
        <SC label="Total Inspections" value={inspections.length} icon="🔍" color="#2D5BE3"/>
        <SC label="This Year" value={inspections.filter(i=>new Date(i.date).getFullYear()===new Date().getFullYear()).length} icon="📅" color="#2AAE7F"/>
        <SC label="Due Soon" value={upcoming.length} icon="⏰" color={upcoming.length>0?"#E8A838":"#2AAE7F"}/>
        <SC label="Action Items Open" value={inspections.reduce((s,i)=>(i.actions||[]).filter(a=>!a.done).length+s,0)} icon="📋" color="#E53E3E"/>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        <button onClick={()=>setSelProp("all")} style={{padding:"7px 16px",borderRadius:20,border:`1.5px solid ${selProp==="all"?"#2D5BE3":"#D5E0EE"}`,background:selProp==="all"?"#2D5BE3":"white",color:selProp==="all"?"white":"#4A5568",cursor:"pointer",fontSize:12,fontWeight:selProp==="all"?700:500}}>All Properties</button>
        {properties.map(p=>(<button key={p.id} onClick={()=>setSelProp(p.id)} style={{padding:"7px 16px",borderRadius:20,border:`1.5px solid ${selProp===p.id?"#2D5BE3":"#D5E0EE"}`,background:selProp===p.id?"#2D5BE3":"white",color:selProp===p.id?"white":"#4A5568",cursor:"pointer",fontSize:12,fontWeight:selProp===p.id?700:500,whiteSpace:"nowrap"}}>{p.address.split(",")[0]}</button>))}
      </div>

      <Card>
        {shown.length===0?<Empty icon="🔍" title="No inspections yet" sub='Click "+ New Inspection" to record a mid-tenancy property inspection'/>:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[...shown].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(insp=>{
              const prop=properties.find(p=>p.id===insp.propertyId);
              const ten=tenancies.find(t=>t.id===insp.tenancyId);
              const openActions=(insp.actions||[]).filter(a=>!a.done).length;
              const rc=ratingColor[insp.overallRating]||"#6B7C93";
              const rb=ratingBg[insp.overallRating]||"#EDF2F7";
              return(<div key={insp.id} style={{background:"#F8FAFD",borderRadius:14,padding:"16px 20px",border:"1px solid #EBF0FA",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:48,height:48,background:rb,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:`1.5px solid ${rc}30`,flexShrink:0}}>🔍</div>
                  <div>
                    <div style={{fontWeight:700,color:"#1B2B4B",fontSize:15}}>{prop?.address||"–"}</div>
                    <div style={{color:"#6B7C93",fontSize:13,marginTop:2}}>{fmt(insp.date)} · {insp.inspector}{ten?` · ${ten.tenantName}`:""}</div>
                    {openActions>0&&<div style={{background:"#FDE8E8",color:"#C53030",fontSize:12,fontWeight:700,display:"inline-block",marginTop:4,padding:"2px 8px",borderRadius:8}}>⚠ {openActions} open action{openActions>1?"s":""}</div>}
                  </div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{background:rb,color:rc,padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>{insp.overallRating}</span>
                  <button onClick={()=>setViewing(insp)} style={{...T.sec,padding:"7px 14px",fontSize:12}}>View Report</button>
                </div>
              </div>);
            })}
          </div>
        )}
      </Card>

      {/* New Inspection Modal */}
      <Modal open={modal} onClose={()=>setModal(false)} title="New Inspection Report" width={680}>
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:16,marginBottom:16}}>
          <Fld label="Inspection Date" required><input type="date" value={iDate} onChange={e=>setIDate(e.target.value)} style={T.inp}/></Fld>
          <Fld label="Next Inspection Date"><input type="date" value={iNext} onChange={e=>setINext(e.target.value)} style={T.inp}/></Fld>
          <Fld label="Inspector"><select value={iInspector} onChange={e=>setIInspector(e.target.value)} style={T.sel}>{["Landlord","Letting Agent","Professional Inspector","Other"].map(x=><option key={x}>{x}</option>)}</select></Fld>
          <Fld label="Overall Rating" required><select value={rating} onChange={e=>setRating(e.target.value)} style={{...T.sel,borderColor:ratingColor[rating]||"#D5E0EE",fontWeight:700}}>{INSP_RATINGS.map(r=><option key={r}>{r}</option>)}</select></Fld>
          <Fld label="Link to Tenancy"><select value={iTen} onChange={e=>setITen(e.target.value)} style={T.sel}><option value="">-- None --</option>{propTens.map(t=><option key={t.id} value={t.id}>{t.tenantName}{t.room?` (${t.room})`:""}</option>)}</select></Fld>
          <Fld label="Tenant Present?"><select value={String(iPresent)} onChange={e=>setIPresent(e.target.value==="true")} style={T.sel}><option value="true">Yes</option><option value="false">No</option></select></Fld>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontWeight:700,fontSize:15,color:"#1B2B4B"}}>Room Conditions</div><div style={{display:"flex",gap:8}}><input value={newRoom} onChange={e=>setNewRoom(e.target.value)} placeholder="Add room…" style={{...T.inp,width:130,padding:"7px 12px",fontSize:13}} onKeyDown={e=>e.key==="Enter"&&addRoom()}/><button onClick={addRoom} style={{...T.pri,padding:"7px 12px",fontSize:12}}>Add</button></div></div>
          <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:300,overflowY:"auto"}}>
            {rooms.map((rm,i)=>(<div key={i} style={{background:"#F8FAFD",borderRadius:10,padding:"10px 12px",border:"1px solid #EBF0FA"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{fontWeight:600,fontSize:13,color:"#1B2B4B"}}>{rm.name}</span><button onClick={()=>setRooms(r=>r.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",color:"#9BAEC8",fontSize:16}}>×</button></div>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"auto 1fr",gap:8,alignItems:"center"}}>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{["Excellent","Good","Fair","Poor","Damaged"].map(c=>(<button key={c} onClick={()=>updRoom(i,"condition",c)} style={{padding:"4px 9px",borderRadius:7,border:`1.5px solid ${rm.condition===c?(condColor[c]||"#2D5BE3"):"#D5E0EE"}`,background:rm.condition===c?(condBg[c]||"#EBF4FF"):"white",color:rm.condition===c?(condColor[c]||"#2D5BE3"):"#4A5568",cursor:"pointer",fontSize:11,fontWeight:rm.condition===c?700:500}}>{c}</button>))}</div>
                <input value={rm.issues} onChange={e=>updRoom(i,"issues",e.target.value)} placeholder="Issues / notes…" style={{...T.inp,padding:"7px 10px",fontSize:13}}/>
              </div>
            </div>))}
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontWeight:700,fontSize:15,color:"#1B2B4B"}}>Action Items</div><div style={{display:"flex",gap:8}}><input value={newAction} onChange={e=>setNewAction(e.target.value)} placeholder="Add action item…" style={{...T.inp,width:200,padding:"7px 12px",fontSize:13}} onKeyDown={e=>e.key==="Enter"&&addAction()}/><button onClick={addAction} style={{...T.pri,padding:"7px 12px",fontSize:12}}>Add</button></div></div>
          {actions.length===0?<div style={{color:"#6B7C93",fontSize:13}}>No action items — add any issues that need following up.</div>:(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {actions.map((a,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"#F8FAFD",borderRadius:10,border:"1px solid #EBF0FA"}}>
                <input type="checkbox" checked={a.done} onChange={e=>updAction(i,"done",e.target.checked)}/>
                <span style={{flex:1,fontSize:13,color:a.done?"#6B7C93":"#1B2B4B",textDecoration:a.done?"line-through":"none"}}>{a.desc}</span>
                <label style={{display:"flex",alignItems:"center",gap:4,fontSize:12,color:"#E53E3E",cursor:"pointer"}}><input type="checkbox" checked={a.urgent} onChange={e=>updAction(i,"urgent",e.target.checked)} style={{accentColor:"#E53E3E"}}/>Urgent</label>
                <button onClick={()=>setActions(a=>a.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",color:"#9BAEC8",fontSize:16}}>×</button>
              </div>))}
            </div>
          )}
        </div>
        <Fld label="Overall Notes"><textarea value={iNotes} onChange={e=>setINotes(e.target.value)} placeholder="General observations, condition of property overall…" style={T.tex}/></Fld>
        <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}><button onClick={()=>setModal(false)} style={T.sec}>Cancel</button><button onClick={doSave} style={T.pri}>Save Report</button></div>
      </Modal>

      {/* View Report Modal */}
      <Modal open={!!viewing} onClose={()=>setViewing(null)} title="Inspection Report" width={700}>
        {viewing&&(<>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)",gap:12,marginBottom:20}}>
            {[{l:"Date",v:fmt(viewing.date)},{l:"Inspector",v:viewing.inspector},{l:"Overall",v:viewing.overallRating},{l:"Tenant Present",v:viewing.tenantPresent?"Yes":"No"}].map(x=>(<div key={x.l} style={{background:"#F8FAFD",borderRadius:10,padding:"10px 12px"}}><div style={{fontSize:11,color:"#6B7C93",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>{x.l}</div><div style={{fontWeight:700,color:"#1B2B4B",fontSize:13}}>{x.v}</div></div>))}
          </div>
          <div style={{fontWeight:700,fontSize:15,color:"#1B2B4B",marginBottom:10}}>Room Conditions</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:300,overflowY:"auto",marginBottom:16}}>
            {(viewing.rooms||[]).map((rm,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"#F8FAFD",borderRadius:10,border:"1px solid #EBF0FA"}}><div><div style={{fontWeight:600,fontSize:14,color:"#1B2B4B"}}>{rm.name}</div>{rm.issues&&<div style={{color:"#6B7C93",fontSize:12,marginTop:2}}>{rm.issues}</div>}</div><span style={{background:condBg[rm.condition]||"#EDF2F7",color:condColor[rm.condition]||"#4A5568",padding:"3px 12px",borderRadius:20,fontSize:12,fontWeight:700,flexShrink:0}}>{rm.condition}</span></div>))}
          </div>
          {(viewing.actions||[]).length>0&&(<><div style={{fontWeight:700,fontSize:15,color:"#1B2B4B",marginBottom:10}}>Action Items</div><div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>{viewing.actions.map((a,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:a.urgent?"#FDE8E8":"#F8FAFD",borderRadius:10,border:`1px solid ${a.urgent?"#F6B2B2":"#EBF0FA"}`}}>{a.urgent&&<span style={{color:"#E53E3E",fontWeight:700,fontSize:12}}>URGENT</span>}<span style={{flex:1,color:a.done?"#6B7C93":"#1B2B4B",fontSize:13,textDecoration:a.done?"line-through":"none"}}>{a.desc}</span>{a.done&&<span style={{color:"#2AAE7F",fontWeight:700,fontSize:12}}>✓ Done</span>}</div>))}</div></>)}
          {viewing.notes&&<div style={{background:"#F8FAFD",borderRadius:10,padding:"12px 14px",fontSize:13,color:"#4A5568",lineHeight:1.6,marginBottom:16}}>{viewing.notes}</div>}
          {viewing.nextDate&&<div style={{background:"#EBF4FF",borderRadius:10,padding:"12px 14px",fontSize:13,color:"#2B6CB0",fontWeight:600}}>📅 Next inspection due: {fmt(viewing.nextDate)}</div>}
          <div style={{display:"flex",justifyContent:"flex-end",paddingTop:16}}><button onClick={()=>setViewing(null)} style={T.sec}>Close</button></div>
        </>)}
      </Modal>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════
// PRINT REPORT GENERATOR
// ══════════════════════════════════════════════════════════════════
function printPropertyReport(prop, myData) {
  const {tenancies,payments,certs,expenses,inventory,inspections,voids}=myData;
  const ts=tenancies.filter(t=>t.propertyId===prop.id);
  const ps=[...payments.filter(p=>p.propertyId===prop.id)].sort((a,b)=>new Date(b.dueDate)-new Date(a.dueDate)).slice(0,24);
  const cs=certs.filter(c=>c.propertyId===prop.id);
  const es=[...expenses.filter(e=>e.propertyId===prop.id)].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,20);
  const inv=inventory.filter(i=>i.propertyId===prop.id);
  const insps=inspections.filter(i=>i.propertyId===prop.id);
  const vs=voids.filter(v=>v.propertyId===prop.id);
  const totalInc=ps.filter(p=>p.status==="paid").reduce((s,p)=>s+Number(p.amount||0),0);
  const totalExp=es.reduce((s,e)=>s+Number(e.amount||0),0);
  const actTens=ts.filter(t=>t.status==="active");

  const row=(label,val)=>`<tr><td style="color:#666;width:40%">${label}</td><td><strong>${val}</strong></td></tr>`;
  const section=(title,content)=>`<div class="section"><h3>${title}</h3>${content}</div>`;
  const badge=(text,color)=>`<span style="background:${color}20;color:${color};padding:2px 10px;border-radius:12px;font-size:11px;font-weight:700">${text}</span>`;

  const certRows=cs.length?cs.map(c=>{const ct=CERT_TYPES.find(x=>x.id===c.type);const st=certSt(c.expiryDate);const col=st==="expired"?"#E53E3E":st==="expiring"?"#E8A838":"#2AAE7F";return`<tr><td>${ct?.label||c.type}</td><td>${fmt(c.issueDate)}</td><td style="color:${col};font-weight:700">${fmt(c.expiryDate)}</td><td>${badge(st,col)}</td></tr>`;}).join(""):"<tr><td colspan='4' style='color:#999'>No certificates recorded</td></tr>";

  const tenRows=ts.length?ts.map(t=>`<tr><td><strong>${t.tenantName}</strong></td><td>${t.tenantEmail||"–"}</td><td>${fmt(t.startDate)}</td><td>${t.endDate?fmt(t.endDate):"Periodic"}</td><td>£${Number(t.rentAmount).toFixed(0)}/mo</td><td>${badge(t.status==="active"?"Active":"Ended",t.status==="active"?"#2AAE7F":"#6B7C93")}</td></tr>`).join(""):"<tr><td colspan='6' style='color:#999'>No tenancies</td></tr>";

  const payRows=ps.slice(0,12).map(p=>{const t=ts.find(x=>x.id===p.tenancyId);const col=p.status==="paid"?"#2AAE7F":p.status==="overdue"?"#E53E3E":"#E8A838";return`<tr><td>${t?.tenantName||"–"}</td><td>${fmt(p.dueDate)}</td><td>£${Number(p.amount||0).toFixed(2)}</td><td>${p.paidDate?fmt(p.paidDate):"–"}</td><td style="color:${col};font-weight:700">${p.status}</td></tr>`;}).join("");

  const expRows=es.slice(0,10).map(e=>{const cat=EXPENSE_CATS.find(c=>c.id===e.category);return`<tr><td>${fmt(e.date)}</td><td>${cat?.label||e.category}</td><td>${e.description||"–"}</td><td>£${Number(e.amount||0).toFixed(2)}</td></tr>`;}).join("");

  const html=`<!DOCTYPE html><html><head><title>Property Report — ${prop.address}</title><style>
    *{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#1a1a1a;padding:30px;max-width:900px;margin:auto}
    .header{background:linear-gradient(135deg,#0E1624,#142B5A);color:white;padding:28px 32px;border-radius:12px;margin-bottom:24px}
    .header h1{font-size:24px;font-weight:700;margin-bottom:4px}.header p{opacity:.7;font-size:13px}
    .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
    .stat{background:#f8f9fc;border-radius:10px;padding:14px 16px;border-left:3px solid #2D5BE3}
    .stat .val{font-size:20px;font-weight:800;color:#1B2B4B;margin-bottom:2px}.stat .lbl{font-size:11px;color:#6B7C93;text-transform:uppercase;letter-spacing:.5px}
    .section{margin-bottom:24px;page-break-inside:avoid}h3{font-size:14px;font-weight:700;color:#1B2B4B;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #2D5BE3;display:inline-block}
    table{width:100%;border-collapse:collapse;margin-bottom:4px}th{background:#f0f4f8;color:#6B7C93;font-size:11px;font-weight:700;text-transform:uppercase;padding:8px 12px;text-align:left;border-bottom:1px solid #e0e8f0}
    td{padding:8px 12px;border-bottom:1px solid #f0f4f0;font-size:12px;vertical-align:middle}tr:nth-child(even) td{background:#fafbfc}
    .summary{display:grid;grid-template-columns:1fr 1fr;gap:20px}
    .footer{margin-top:32px;padding-top:16px;border-top:1px solid #eee;color:#999;font-size:11px;display:flex;justify-content:space-between}
    @media print{body{padding:10px}.header{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body>
  <div class="header">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div><h1>🏠 ${prop.address}</h1><p>${[prop.city,prop.postcode].filter(Boolean).join(", ")||""} · ${prop.type||""} · ${prop.bedrooms||"–"} bed</p></div>
      <div style="text-align:right;opacity:.8;font-size:12px">Generated: ${fmt(today())}<br/>LandlordPro Property Report</div>
    </div>
  </div>
  <div class="stats">
    <div class="stat"><div class="val">£${Number(prop.monthlyRent||0).toFixed(0)}</div><div class="lbl">Monthly Rent</div></div>
    <div class="stat"><div class="val">${actTens.length}</div><div class="lbl">Active Tenants</div></div>
    <div class="stat"><div class="val">£${totalInc.toFixed(0)}</div><div class="lbl">Income (shown)</div></div>
    <div class="stat"><div class="val">£${totalExp.toFixed(0)}</div><div class="lbl">Expenses (shown)</div></div>
  </div>
  <div class="summary">
    ${section("Property Details",`<table>${row("Address",prop.address)}${row("City / Postcode",[prop.city,prop.postcode].filter(Boolean).join(", ")||"–")}${row("Type",prop.type||"–")}${row("Bedrooms",prop.bedrooms||"–")}${row("Bathrooms",prop.bathrooms||"–")}${row("Monthly Rent","£"+Number(prop.monthlyRent||0).toFixed(2))}${row("Purchase Price",prop.purchasePrice?"£"+Number(prop.purchasePrice).toLocaleString("en-GB"):"–")}${row("Gross Yield",prop.purchasePrice&&prop.monthlyRent?((Number(prop.monthlyRent)*12/Number(prop.purchasePrice))*100).toFixed(2)+"%":"–")}</table>`)}
    ${section("Compliance Summary",`<table><thead><tr><th>Certificate</th><th>Issued</th><th>Expires</th><th>Status</th></tr></thead><tbody>${certRows}</tbody></table>`)}
  </div>
  ${section("Tenancy History",`<table><thead><tr><th>Tenant</th><th>Email</th><th>Start</th><th>End</th><th>Rent</th><th>Status</th></tr></thead><tbody>${tenRows}</tbody></table>`)}
  <div class="summary">
    ${section("Recent Rent Payments (last 12)",`<table><thead><tr><th>Tenant</th><th>Due</th><th>Amount</th><th>Paid</th><th>Status</th></tr></thead><tbody>${payRows}</tbody></table>`)}
    ${section("Recent Expenses (last 10)",`<table><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr></thead><tbody>${expRows||"<tr><td colspan='4' style='color:#999'>No expenses</td></tr>"}</tbody></table>`)}
  </div>
  ${insps.length>0?section("Inspection History",`<table><thead><tr><th>Date</th><th>Inspector</th><th>Overall Rating</th><th>Open Actions</th></tr></thead><tbody>${insps.slice(0,6).map(i=>`<tr><td>${fmt(i.date)}</td><td>${i.inspector}</td><td><strong>${i.overallRating}</strong></td><td>${(i.actions||[]).filter(a=>!a.done).length}</td></tr>`).join("")}</tbody></table>`):""}
  ${vs.length>0?section("Void Periods",`<table><thead><tr><th>Start</th><th>End</th><th>Days</th><th>Reason</th></tr></thead><tbody>${vs.map(v=>{const days=v.endDate?Math.ceil((new Date(v.endDate)-new Date(v.startDate))/86400000):"Ongoing";return`<tr><td>${fmt(v.startDate)}</td><td>${v.endDate?fmt(v.endDate):"Ongoing"}</td><td>${days}</td><td>${v.reason||"–"}</td></tr>`;}).join("")}</tbody></table>`):""}
  <div class="footer"><span>LandlordPro · ${prop.address}</span><span>Generated ${new Date().toLocaleString("en-GB")}</span></div>
  </body></html>`;

  const w=window.open("","_blank","width=1000,height=750");
  w.document.write(html); w.document.close();
  setTimeout(()=>w.print(),600);
}

// ══════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════
const NAV = [
  {id:"dashboard",  label:"Dashboard",          icon:"⊞"},
  {id:"properties", label:"Properties",          icon:"🏢"},
  {id:"tenancies",  label:"Tenancies",           icon:"👥"},
  {id:"rent",       label:"Rent Ledger",         icon:"💷"},
  {id:"certs",      label:"Certificates",        icon:"📋"},
  {id:"finances",   label:"Finances",            icon:"📈"},
  {id:"sa105",      label:"SA105 Tax",           icon:"🧾"},
  {id:"voids",      label:"Void Periods",        icon:"🏚️"},
  {id:"inventory",  label:"Inventory",           icon:"📦"},
  {id:"documents",  label:"Documents",           icon:"📁"},
  {id:"contractors",label:"Contractors",         icon:"🔧"},
  {id:"calendar",   label:"Calendar",            icon:"🗓️"},
  {id:"templates",  label:"Templates",           icon:"📝"},
  {id:"exports",    label:"Data Exports",        icon:"⬇️"},
  {id:"rtr",        label:"Right to Rent",        icon:"🪪"},
  {id:"inspections",label:"Inspections",          icon:"🔍"},
  {id:"notices",    label:"Legal Notices",       icon:"📄"},
  {id:"reminders",  label:"Reminders",           icon:"🔔"},
  {id:"reports",    label:"Reports",             icon:"📊"},
];

export default function App() {
  const [loaded,  setLoaded]  = useState(false);
  const [user,    setUser]    = useState(null);
  const [page,    setPage]    = useState("dashboard");
  const [db,      setDb]      = useState({landlords:[],properties:[],tenancies:[],payments:[],certs:[],notices:[],reminders:[],expenses:[],inventory:[],templates:[],contractors:[],voids:[],documents:[],rtr:[],inspections:[],recurring:[]});
  const winW = useWinSize();
  const isMobile = winW < 768;
  const [darkMode,setDarkMode]= useState(()=>{try{return localStorage.getItem("lp_dark")==="1";}catch{return false;}});
  const toggleDark = () => { const n=!darkMode; setDarkMode(n); try{localStorage.setItem("lp_dark",n?"1":"0");}catch{} };
  const [sideOpen,setSideOpen]= useState(true);
  const [toast,   setToast]   = useState(null);

  useEffect(()=>{
    (async()=>{
      const keys=["landlords","properties","tenancies","payments","certs","notices","reminders","expenses","inventory","templates","contractors","voids","documents","rtr","inspections"];
      const r={};
      for (const k of keys) r[k]=(await DB.get(k))||[];
      setDb(r); setLoaded(true);
      // Auto-generate rent entries for active tenancies
      const saveF = async (key,arr) => { 
        setDb(d=>({...d,[key]:arr})); 
        await DB.set(key,arr); 
      };
      autoGenerateRent(r, saveF);
    })();
  },[]);

  const save = async (key, arr) => {
    setDb(d=>({...d,[key]:arr}));
    await DB.set(key, arr);
  };

  const showToast = (msg, type="success") => {
    setToast({msg,type}); setTimeout(()=>setToast(null),3500);
  };

  if (!loaded) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(155deg,#080F1E,#142B5A)"}}>
      <style>{GCSS}</style>
      <div style={{textAlign:"center",color:"white"}}>
        <div className="loading" style={{fontSize:56,marginBottom:18}}>🏠</div>
        <div style={{fontFamily:"Playfair Display,serif",fontSize:32,fontWeight:700,marginBottom:8}}>LandlordPro</div>
        <div style={{color:"rgba(255,255,255,.5)",fontSize:14,letterSpacing:"1px"}}>Loading your portal…</div>
      </div>
    </div>
  );

  if (!user) return <AuthPage db={db} save={save} setUser={setUser} showToast={showToast} />;

  const myData = user.role==="admin" ? db : {
    ...db,
    properties: (db.properties||[]).filter(p=>p.landlordId===user.id),
    tenancies:  (db.tenancies||[]).filter(t=>t.landlordId===user.id),
    payments:   (db.payments||[]).filter(p=>p.landlordId===user.id),
    certs:      (db.certs||[]).filter(c=>c.landlordId===user.id),
    notices:    (db.notices||[]).filter(n=>n.landlordId===user.id),
    reminders:  (db.reminders||[]).filter(r=>r.landlordId===user.id),
    expenses:   (db.expenses||[]).filter(e=>e.landlordId===user.id),
    inventory:  (db.inventory||[]).filter(i=>i.landlordId===user.id),
    templates:  (db.templates||[]).filter(t=>t.landlordId===user.id),
    contractors:(db.contractors||[]).filter(c=>c.landlordId===user.id),
    voids:      (db.voids||[]).filter(v=>v.landlordId===user.id),
    documents:  (db.documents||[]).filter(d=>d.landlordId===user.id),
    rtr:        (db.rtr||[]).filter(r=>r.landlordId===user.id),
    inspections:(db.inspections||[]).filter(i=>i.landlordId===user.id),
    recurring:  (db.recurring||[]).filter(r=>r.landlordId===user.id),
  };

  const ctx = { user, myData, db, save, showToast, setPage, isMobile, darkMode };

  const expCertCount   = myData.certs.filter(c=>{const d=daysTo(c.expiryDate);return d!==null&&d>=0&&d<=30;}).length;
  const expiredCertCount=myData.certs.filter(c=>{const d=daysTo(c.expiryDate);return d!==null&&d<0;}).length;
  const overdueCount   = myData.payments.filter(p=>p.status==="overdue"||(p.status==="due"&&new Date(p.dueDate)<new Date())).length;

  return (
    <div className={darkMode?"dark-mode":""} style={{display:"flex",minHeight:"100vh",fontFamily:"'DM Sans',system-ui,sans-serif",background:"var(--bg)",colorScheme:darkMode?"dark":"light"}}>
      <style>{GCSS}</style>

      {/* ── SIDEBAR ─────────────────────────────────── */}
      {isMobile&&sideOpen&&(<div onClick={()=>setSideOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:99,backdropFilter:"blur(2px)"}}/>)}
      <div style={{position:"fixed",left:isMobile?(sideOpen?0:-260):0,top:0,bottom:0,width:isMobile?260:(sideOpen?242:70),background:"#0E1624",transition:"all .3s",zIndex:100,display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:"3px 0 20px rgba(0,0,0,.25)"}}>
        {/* Logo */}
        <div style={{padding:sideOpen?"22px 20px 18px":"18px 14px",borderBottom:"1px solid rgba(255,255,255,.06)",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,background:"linear-gradient(135deg,#E8A838,#F4C56A)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,boxShadow:"0 4px 12px rgba(232,168,56,.4)"}}>🏠</div>
          {sideOpen&&<div>
            <div style={{fontFamily:"Playfair Display,serif",color:"white",fontWeight:700,fontSize:17,lineHeight:1}}>LandlordPro</div>
            <div style={{color:"#E8A838",fontSize:9,fontWeight:700,letterSpacing:"2.5px",marginTop:3,textTransform:"uppercase"}}>UK Property</div>
          </div>}
        </div>

        {/* Nav items */}
        <nav style={{flex:1,padding:"10px 8px",overflowY:"auto"}}>
          {NAV.map(n=>{
            const active=page===n.id;
            return(<div key={n.id} onClick={()=>setPage(n.id)}
              style={{display:"flex",alignItems:"center",gap:12,padding:sideOpen?"10px 14px":"10px 16px",borderRadius:10,marginBottom:2,cursor:"pointer",transition:"all .2s",
                background:active?"rgba(232,168,56,.12)":"transparent",
                borderLeft:active?"3px solid #E8A838":"3px solid transparent"}}>
              <span style={{fontSize:18,flexShrink:0,opacity:active?1:.75}}>{n.icon}</span>
              {sideOpen&&<span style={{fontSize:14,color:active?"#E8A838":"rgba(255,255,255,.7)",fontWeight:active?700:500,whiteSpace:"nowrap"}}>{n.label}</span>}
            </div>);
          })}
          {user.role==="admin"&&(
            <div onClick={()=>setPage("admin")}
              style={{display:"flex",alignItems:"center",gap:12,padding:sideOpen?"10px 14px":"10px 16px",borderRadius:10,marginTop:8,cursor:"pointer",
                background:page==="admin"?"rgba(229,62,62,.15)":"rgba(229,62,62,.07)",
                borderLeft:page==="admin"?"3px solid #E53E3E":"3px solid rgba(229,62,62,.3)"}}>
              <span style={{fontSize:18,flexShrink:0}}>⚙️</span>
              {sideOpen&&<span style={{fontSize:14,color:page==="admin"?"#FC8181":"rgba(252,129,129,.7)",fontWeight:700,whiteSpace:"nowrap"}}>Admin Portal</span>}
            </div>
          )}
        </nav>

        {/* User area */}
        <div style={{padding:"10px 8px",borderTop:"1px solid rgba(255,255,255,.06)"}}>
          <div onClick={()=>setPage("profile")}
            style={{display:"flex",alignItems:"center",gap:12,padding:sideOpen?"9px 14px":"9px 16px",borderRadius:10,cursor:"pointer",marginBottom:4,background:page==="profile"?"rgba(255,255,255,.08)":"transparent"}}>
            <div style={{width:34,height:34,background:"linear-gradient(135deg,#2D5BE3,#5A80F0)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:13,flexShrink:0}}>{user.name.charAt(0).toUpperCase()}</div>
            {sideOpen&&<div style={{overflow:"hidden",flex:1}}>
              <div style={{color:"white",fontSize:13,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.name}</div>
              <div style={{color:"rgba(255,255,255,.4)",fontSize:11,textTransform:"capitalize"}}>{user.role}</div>
            </div>}
          </div>
          <div onClick={()=>setUser(null)}
            style={{display:"flex",alignItems:"center",gap:12,padding:sideOpen?"8px 14px":"8px 16px",borderRadius:10,cursor:"pointer"}}>
            <span style={{fontSize:18,flexShrink:0,opacity:.5}}>🚪</span>
            <span style={{color:"rgba(255,255,255,.35)",fontSize:13,display:(sideOpen||isMobile)?"inline":"none"}}>Sign Out</span>
          </div>
        </div>
      </div>

      {/* ── MAIN AREA ──────────────────────────────── */}
      <div style={{flex:1,marginLeft:isMobile?0:(sideOpen?242:70),transition:"margin .3s",display:"flex",flexDirection:"column",minHeight:"100vh"}}>
        {/* Top bar */}
        <div style={{background:"var(--topbar)",borderBottom:"1px solid var(--topbar-border)",height:62,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",boxShadow:"0 1px 8px rgba(27,43,75,.05)",flexShrink:0,position:"sticky",top:0,zIndex:50}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <button onClick={()=>setSideOpen(s=>!s)} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"var(--text2)",padding:4,borderRadius:8}}>☰</button>
            <span className="topbar-date" style={{fontSize:13,color:"var(--text2)"}}>{fmtLg(today())}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            {(expCertCount+expiredCertCount)>0&&<div style={{background:"#FEEBC8",color:"#C05621",padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer"}} onClick={()=>setPage("certs")}>⚠️ {expCertCount+expiredCertCount} cert alert{expCertCount+expiredCertCount>1?"s":""}</div>}
            {overdueCount>0&&<div style={{background:"#FDE8E8",color:"#C53030",padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:700,cursor:"pointer"}} onClick={()=>setPage("rent")}>🔴 {overdueCount} overdue</div>}
            <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setPage("profile")}>
              <div style={{width:34,height:34,background:"linear-gradient(135deg,#2D5BE3,#5A80F0)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:700,fontSize:13}}>{user.name.charAt(0).toUpperCase()}</div>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{user.name}</div>
                <div style={{fontSize:11,color:"var(--text2)",textTransform:"capitalize"}}>{user.role}</div>
              </div>
            </div>
            <button onClick={toggleDark} title={darkMode?"Light mode":"Dark mode"} style={{background:"none",border:`1.5px solid var(--border)`,borderRadius:10,cursor:"pointer",fontSize:16,padding:"5px 10px",color:"var(--text2)"}}>{darkMode?"☀️":"🌙"}</button>
          </div>
        </div>

        {/* Toast notification */}
        {toast&&(
          <div className="fs" style={{position:"fixed",top:74,right:22,zIndex:9999,padding:"13px 20px",borderRadius:12,
            background:toast.type==="success"?"#2AAE7F":toast.type==="error"?"#E53E3E":"#E8A838",
            color:"white",fontWeight:600,fontSize:14,boxShadow:"0 6px 24px rgba(0,0,0,.25)",maxWidth:360,lineHeight:1.4}}>
            {toast.msg}
          </div>
        )}

        {/* Page content */}
        <div style={{flex:1,padding:28,overflow:"auto",background:"var(--bg)"}}>
          {page==="dashboard"   && <DashboardPage   ctx={ctx} />}
          {page==="properties"  && <PropertiesPage  ctx={ctx} />}
          {page==="tenancies"   && <TenanciesPage   ctx={ctx} />}
          {page==="rent"        && <RentPage         ctx={ctx} />}
          {page==="certs"       && <CertsPage        ctx={ctx} />}
          {page==="finances"    && <FinancesPage     ctx={ctx} />}
          {page==="sa105"       && <SA105Page        ctx={ctx} />}
          {page==="voids"       && <VoidsPage        ctx={ctx} />}
          {page==="inventory"   && <InventoryPage    ctx={ctx} />}
          {page==="documents"   && <DocumentsPage    ctx={ctx} />}
          {page==="contractors" && <ContractorsPage  ctx={ctx} />}
          {page==="calendar"    && <CalendarPage     ctx={ctx} />}
          {page==="templates"   && <TemplatesPage    ctx={ctx} />}
          {page==="exports"     && <ExportsPage      ctx={ctx} />}
          {page==="rtr"         && <RightToRentPage  ctx={ctx} />}
          {page==="inspections" && <InspectionsPage  ctx={ctx} />}
          {page==="notices"     && <NoticesPage      ctx={ctx} />}
          {page==="reminders"   && <RemindersPage    ctx={ctx} />}
          {page==="reports"     && <ReportsPage      ctx={ctx} />}
          {page==="admin"      && user.role==="admin" && <AdminPage ctx={ctx} />}
          {page==="profile"    && <ProfilePage     ctx={ctx} />}
        </div>
      </div>
    </div>
  );
}
