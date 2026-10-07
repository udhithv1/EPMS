// --- Auth state ---
let authHeader = null;

// --- Login screen ---
function showLogin(errorMsg) {
  document.querySelector('aside').style.display = 'none';
  document.querySelector('header').style.display = 'none';
  document.body.style.background = '#f0f2f5';
  document.querySelector('#app').innerHTML = `
    <div id="login-box">
      <div class="brand" style="justify-content:center;margin-bottom:1.5rem">
        <span class="logo">₿</span>
        <div><b>Payroll Studio</b><small>Sign in to continue</small></div>
      </div>
      ${errorMsg ? `<div class="login-error">${errorMsg}</div>` : ''}
      <form id="login-form">
        <label>Username<input name="username" value="admin" autocomplete="username" required></label>
        <label>Password<input name="password" type="password" autocomplete="current-password" required></label>
        <button class="btn" style="width:100%;margin-top:.5rem">Sign in</button>
      </form>
    </div>`;
  document.querySelector('#login-form').onsubmit = async e => {
    e.preventDefault();
    const {username, password} = Object.fromEntries(new FormData(e.target));
    const header = 'Basic ' + btoa(username + ':' + password);
    const r = await fetch('/api/auth/status', {headers: {Authorization: header}});
    if (r.ok) {
      const data = await r.json();
      if (data.authenticated) {
        authHeader = header;
        showApp();
      } else {
        showLogin('Invalid username or password.');
      }
    } else {
      showLogin('Invalid username or password.');
    }
  };
}

function showApp() {
  document.querySelector('aside').style.display = '';
  document.querySelector('header').style.display = '';
  document.body.style.background = '';
  load().then(() => nav('dashboard'));
}

// --- API helper ---
const app = document.querySelector('#app'), title = document.querySelector('#title');
let state = {employees: [], payroll: []};

const api = async (url, opt = {}) => {
  let r = await fetch('/api' + url, {
    headers: {'Content-Type': 'application/json', Authorization: authHeader, ...(opt.headers || {})},
    ...opt
  });
  if (r.status === 401) { authHeader = null; showLogin('Session expired. Please sign in again.'); throw Error('Unauthenticated'); }
  if (!r.ok) { let e = await r.json().catch(() => ({error: r.statusText})); throw Error(e.error || 'Request failed'); }
  return r.status === 204 ? null : r.json();
};

const money = x => '₹' + Number(x || 0).toLocaleString('en-IN', {maximumFractionDigits: 0});
const initials = n => n.split(' ').map(x => x[0]).join('').slice(0, 2);

async function load() { state.employees = await api('/employees'); state.payroll = await api('/payroll'); }

function nav(v) {
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  title.textContent = {dashboard: 'Overview', employees: 'Employees', payroll: 'Payroll runs', audit: 'Audit trail'}[v];
  ({dashboard, employees, payroll, audit}[v])();
}

async function dashboard() {
  let d = await api('/dashboard');
  app.innerHTML = `<div class="cards"><div class="card"><div class="label">Total employees</div><div class="value">${d.employees}</div><div class="trend">+12.5% this quarter</div></div><div class="card"><div class="label">Departments</div><div class="value">${d.departments}</div><div class="trend">Across all teams</div></div><div class="card"><div class="label">Payroll records</div><div class="value">${d.payrollRecords}</div><div class="trend">Generated securely</div></div><div class="card"><div class="label">Monthly payroll</div><div class="value">${money(d.monthlyPayroll)}</div><div class="trend">Current period</div></div></div><div class="grid2"><div class="panel"><div class="panel-head"><h2>Team directory</h2><button class="btn" onclick="nav('employees')">View all</button></div><table><thead><tr><th>Employee</th><th>Department</th><th>Salary</th><th>Status</th></tr></thead><tbody>${state.employees.slice(0, 5).map(e => `<tr><td><div class="person"><span class="avatar">${initials(e.fullName)}</span>${e.fullName}</div></td><td>${e.department}</td><td>${money(e.basicSalary)}</td><td><span class="pill">Active</span></td></tr>`).join('')}</tbody></table></div><div class="panel"><div class="panel-head"><h2>Payroll guidance</h2></div><p class="muted">Rates are centralized in <b>PayrollCalculator</b>.</p><p class="muted">HRA 20% · DA 10% · TA 5% · PF 12%</p><p class="muted">Tax is 5% below ₹50,000 gross and 10% above.</p><button class="btn" onclick="nav('payroll')">Run payroll</button></div></div>`;
}

function employees() {
  app.innerHTML = `
    <div class="panel">
      <div class="toolbar">
        <input class="search" id="q" placeholder="Search by name or employee ID">
        <button class="btn" onclick="showForm()">+ Add employee</button>
      </div>
      <table>
        <thead><tr><th>Employee</th><th>ID</th><th>Department</th><th>Designation</th><th>Basic salary</th><th>Actions</th></tr></thead>
        <tbody id="empRows">${rows(state.employees)}</tbody>
      </table>
    </div>`;
  const qInput = document.querySelector('#q');
  let debounce;
  qInput.oninput = e => {
    clearTimeout(debounce);
    debounce = setTimeout(async () => {
      const q = e.target.value.trim();
      const filtered = q
        ? state.employees.filter(x => (x.fullName + x.employeeCode).toLowerCase().includes(q.toLowerCase()))
        : state.employees;
      document.querySelector('#empRows').innerHTML = rows(filtered);
    }, 200);
  };
}

function rows(a) {
  return a.map(e => `
    <tr>
      <td><div class="person"><span class="avatar">${initials(e.fullName)}</span>${e.fullName}</div></td>
      <td>${e.employeeCode}</td>
      <td>${e.department}</td>
      <td>${e.designation}</td>
      <td>${money(e.basicSalary)}</td>
      <td class="action-btns">
        <button class="btn secondary small" onclick="viewEmp(${e.id})">View</button>
        <button class="btn small" onclick="showEditForm(${e.id})">Edit</button>
        <button class="danger small" onclick="delEmp(${e.id})">Delete</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="6"><div class="empty">No employees found</div></td></tr>';
}

const empFields = [
  ['employeeCode','Employee ID','EMP-1006','text'],
  ['fullName','Full name','Full name','text'],
  ['email','Email','name@example.com','email'],
  ['phone','Phone','+91 9000000000','text'],
  ['department','Department','Department','text'],
  ['designation','Designation','Designation','text'],
  ['basicSalary','Basic salary','65000','number'],
  ['joiningDate','Joining date','','date']
];

function empFormHtml(title, values = {}) {
  const fields = empFields.map(([n,l,p,t]) =>
    `<label>${l}<input name="${n}" type="${t}" placeholder="${p}" value="${values[n] || ''}" required></label>`
  ).join('');
  return `<div class="panel"><div class="panel-head"><h2>${title}</h2><button class="btn secondary" onclick="nav('employees')">Cancel</button></div><form id="form" class="formgrid">${fields}<div class="actions"><button class="btn">Save employee</button></div></form></div>`;
}

function showForm() {
  app.innerHTML = empFormHtml('Add employee');
  document.querySelector('#form').onsubmit = async e => {
    e.preventDefault();
    let o = Object.fromEntries(new FormData(e.target));
    o.basicSalary = Number(o.basicSalary);
    try { await api('/employees', {method: 'POST', body: JSON.stringify(o)}); await load(); nav('employees'); }
    catch(x) { alert(x.message); }
  };
}

async function showEditForm(id) {
  const emp = state.employees.find(e => e.id === id) || await api('/employees/' + id);
  // format date for input[type=date]
  const values = {...emp, joiningDate: emp.joiningDate ? emp.joiningDate.substring(0, 10) : ''};
  app.innerHTML = empFormHtml('Edit employee', values);
  document.querySelector('#form').onsubmit = async e => {
    e.preventDefault();
    let o = Object.fromEntries(new FormData(e.target));
    o.basicSalary = Number(o.basicSalary);
    try { await api('/employees/' + id, {method: 'PUT', body: JSON.stringify(o)}); await load(); nav('employees'); }
    catch(x) { alert(x.message); }
  };
}

async function viewEmp(id) {
  const e = state.employees.find(x => x.id === id) || await api('/employees/' + id);
  const empPayroll = state.payroll.filter(p => p.employee && p.employee.id === id);
  app.innerHTML = `
    <div class="panel">
      <div class="panel-head">
        <h2><span class="avatar">${initials(e.fullName)}</span> ${e.fullName}</h2>
        <div style="display:flex;gap:8px">
          <button class="btn secondary" onclick="showEditForm(${e.id})">Edit</button>
          <button class="btn secondary" onclick="nav('employees')">Back</button>
        </div>
      </div>
      <div class="detail-grid">
        <div class="detail-item"><span class="label">Employee ID</span><b>${e.employeeCode}</b></div>
        <div class="detail-item"><span class="label">Full Name</span><b>${e.fullName}</b></div>
        <div class="detail-item"><span class="label">Email</span><b>${e.email}</b></div>
        <div class="detail-item"><span class="label">Phone</span><b>${e.phone}</b></div>
        <div class="detail-item"><span class="label">Department</span><b>${e.department}</b></div>
        <div class="detail-item"><span class="label">Designation</span><b>${e.designation}</b></div>
        <div class="detail-item"><span class="label">Basic Salary</span><b>${money(e.basicSalary)}</b></div>
        <div class="detail-item"><span class="label">Joining Date</span><b>${e.joiningDate}</b></div>
        <div class="detail-item"><span class="label">Status</span><span class="pill">${e.active ? 'Active' : 'Inactive'}</span></div>
      </div>
      <div class="panel-head" style="margin-top:24px"><h2>Payroll history</h2></div>
      <table>
        <thead><tr><th>Period</th><th>Gross Salary</th><th>PF</th><th>Tax</th><th>Net Salary</th><th>Payslip</th></tr></thead>
        <tbody>${empPayroll.length ? empPayroll.map(p => `
          <tr>
            <td>${p.month}/${p.year}</td>
            <td>${money(p.grossSalary)}</td>
            <td>${money(p.pf)}</td>
            <td>${money(p.tax)}</td>
            <td><b>${money(p.netSalary)}</b></td>
            <td><button class="btn secondary small" onclick="downloadPdf(${p.id})">Download PDF</button></td>
          </tr>`).join('') : '<tr><td colspan="6"><div class="empty">No payroll records yet</div></td></tr>'}
        </tbody>
      </table>
    </div>`;
}

async function delEmp(id) {
  if (confirm('Delete this employee? This cannot be undone.')) {
    await api('/employees/' + id, {method: 'DELETE'});
    await load();
    employees();
  }
}

// Download PDF with auth header (plain <a href> won't send Authorization)
async function downloadPdf(payrollId) {
  try {
    const r = await fetch('/api/payslips/' + payrollId + '/pdf', {headers: {Authorization: authHeader}});
    if (!r.ok) throw Error('Failed to download');
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'payslip-' + payrollId + '.pdf';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  } catch(x) { alert(x.message); }
}

function payroll() {
  app.innerHTML = `
    <div class="panel">
      <div class="toolbar">
        <div class="muted">Generate a unique payroll record for each employee and period.</div>
        <button class="btn" onclick="showPayrollForm()">+ Generate payroll</button>
      </div>
      <table>
        <thead><tr><th>Employee</th><th>Period</th><th>Gross salary</th><th>PF</th><th>Tax</th><th>Net salary</th><th>Payslip</th></tr></thead>
        <tbody>${state.payroll.map(p => `
          <tr>
            <td><div class="person"><span class="avatar">${initials(p.employee.fullName)}</span>${p.employee.fullName}</div></td>
            <td>${p.month}/${p.year}</td>
            <td>${money(p.grossSalary)}</td>
            <td>${money(p.pf)}</td>
            <td>${money(p.tax)}</td>
            <td><b>${money(p.netSalary)}</b></td>
            <td><button class="btn secondary small" onclick="downloadPdf(${p.id})">Download PDF</button></td>
          </tr>`).join('') || '<tr><td colspan="7"><div class="empty">No payroll generated yet</div></td></tr>'}
        </tbody>
      </table>
    </div>`;
}

function showPayrollForm() {
  app.innerHTML = `<div class="panel"><h2>Generate payroll</h2><form id="payform" class="formgrid"><label>Employee<select name="employeeId">${state.employees.map(e => `<option value="${e.id}">${e.employeeCode} — ${e.fullName}</option>`).join('')}</select></label><label>Month<input name="month" type="number" min="1" max="12" value="${new Date().getMonth()+1}"></label><label>Year<input name="year" type="number" value="${new Date().getFullYear()}"></label><div class="actions"><button class="btn">Calculate & save</button><button type="button" class="btn secondary" onclick="nav('payroll')">Cancel</button></div></form></div>`;
  document.querySelector('#payform').onsubmit = async e => { e.preventDefault(); let o = Object.fromEntries(new FormData(e.target)); try { await api(`/payroll?employeeId=${o.employeeId}&month=${o.month}&year=${o.year}`, {method: 'POST'}); await load(); payroll(); } catch(x) { alert(x.message); } };
}

async function audit() {
  let a = await api('/audit-logs');
  app.innerHTML = `<div class="panel"><div class="panel-head"><h2>Audit trail</h2><span class="muted">${a.length} events</span></div><table><thead><tr><th>When</th><th>Action</th><th>Entity</th><th>Description</th><th>User</th></tr></thead><tbody>${a.map(x => `<tr><td>${new Date(x.timestamp).toLocaleString()}</td><td><span class="pill">${x.action}</span></td><td>${x.entityName} #${x.entityId}</td><td>${x.description}</td><td>${x.username}</td></tr>`).join('') || '<tr><td colspan="5"><div class="empty">No events yet</div></td></tr>'}</tbody></table></div>`;
}

document.querySelectorAll('nav button').forEach(b => b.onclick = () => nav(b.dataset.view));
document.querySelector('#logout').onclick = () => {
  fetch('/api/auth/logout', {method: 'POST', headers: {Authorization: authHeader}})
    .finally(() => { authHeader = null; showLogin(); });
};

// --- Boot ---
showLogin();