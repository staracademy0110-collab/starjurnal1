// payments.js — Star Academy payment journal

// Simple data model stored in localStorage
// student = { id, name, teacher, currentMonthIndex, history: [{monthIndex, status: 'paid'|'due'|'overdue', date}] }
// months are 0..11

(function(){
  const LS_KEYS = {
    PASS: 'sa_pass',
    THEME: 'sa_theme',
    STUDENTS: 'sa_students'
  };

  const DEFAULT_PASS = 'star7777';
  const MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentyabr','Oktyabr','Noyabr','Dekabr'];

  // State
  let students = [];
  let selectedStudentId = null;
  let selectedStaticRow = null;
  let filterText = '';

  // Elements
  const $loginView = qs('#login-view');
  const $mainView = qs('#main-view');
  const $password = qs('#password');
  const $togglePass = qs('#togglePass');
  const $loginBtn = qs('#loginBtn');
  const $logoutBtn = qs('#logoutBtn');
  const $themePicker = qs('#themePicker');
  const $searchInput = qs('#searchInput');
  const $studentsTable = qs('#studentsTable tbody');
  const $emptyState = qs('#emptyState');

  const $studentModal = qs('#studentModal');
  const $settingsModal = qs('#settingsModal');

  const $mName = qs('#mName');
  const $mTeacher = qs('#mTeacher');
  const $mMonth = qs('#mMonth');
  const $mStatus = qs('#mStatus');
  const $mHistory = qs('#mHistory');
  const $confirmBtn = qs('#confirmBtn');

  const $settingsBtn = qs('#settingsBtn');
  const $newPassword = qs('#newPassword');
  const $saveSettingsBtn = qs('#saveSettingsBtn');
  const $seedBtn = qs('#seedBtn');

  // Utils
  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
  function lsGet(key, fallback){ try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }catch{ return fallback; } }
  function lsSet(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
  function fmtDate(d){ const dd = new Date(d); return dd.toLocaleString('uz-UZ'); }

  // Auth
  function getPass(){ return lsGet(LS_KEYS.PASS, DEFAULT_PASS); }
  function setPass(p){ lsSet(LS_KEYS.PASS, p); }

  function isAuthed(){ return sessionStorage.getItem('sa_authed') === '1'; }
  function setAuthed(v){ if(v) sessionStorage.setItem('sa_authed','1'); else sessionStorage.removeItem('sa_authed'); }

  // Theme
  function loadTheme(){
    const color = lsGet(LS_KEYS.THEME, '#7c5cff');
    document.documentElement.style.setProperty('--primary', color);
    if($themePicker) $themePicker.value = color;
  }

  // Tabs switching for sections (IELTS, CEFR, B1-B2, A1-A2)
  function setupTabs(){
    const tabs = qsa('.sec-tab');
    const sections = qsa('.section');
    tabs.forEach(tab => {
      tab.addEventListener('click', ()=>{
        // active tab UI
        tabs.forEach(t=>{ t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected','true');

        // show target section
        const target = tab.getAttribute('data-target');
        sections.forEach(sec=> sec.classList.add('hidden'));
        const el = target ? qs(target) : null;
        if(el){ el.classList.remove('hidden'); }

        // if IELTS tab, rerender dynamic table
        if (target === '#section-ielts') {
          render();
        }
      });
    });
  }

  function saveTheme(color){ lsSet(LS_KEYS.THEME, color); loadTheme(); }

  // Students
  function loadStudents(){
    students = lsGet(LS_KEYS.STUDENTS, []);
  }
  function saveStudents(){ lsSet(LS_KEYS.STUDENTS, students); }

  function seedStudents(){
    students = [
      { id: id(), name: 'Muxtarov Shaxriyor', teacher: 'Mavlon', currentMonthIndex: currentMonthIndex(), history: [] },
      { id: id(), name: 'Maxaddinov Shuxrat', teacher: 'Mavlon', currentMonthIndex: currentMonthIndex(), history: [] },
      { id: id(), name: 'Ergashev Sarvar', teacher: 'Mavlon', currentMonthIndex: currentMonthIndex(), history: [] },
    ].map(s => ({...s, currentMonthIndex: ((s.currentMonthIndex%12)+12)%12 }));
    saveStudents();
    render();
  }

  function currentMonthIndex(){ return new Date().getMonth(); }

  function id(){ return Math.random().toString(36).slice(2,9); }

  function statusOfStudent(st){
    // If currentMonthIndex < real current month => overdue
    const now = currentMonthIndex();
    if(st.currentMonthIndex < now){ return 'overdue'; }
    if(st.history.some(h => h.monthIndex === st.currentMonthIndex && h.status==='paid')) return 'paid';
    return 'due';
  }

  function monthName(i){ return MONTHS[((i%12)+12)%12]; }

  // Rendering
  function render(){
    loadStudents();
    const rows = students
      .filter(s => s.name.toLowerCase().includes(filterText.toLowerCase()))
      .sort((a,b)=> a.name.localeCompare(b.name));

    // Keep static rows in HTML and remove only dynamic ones from MAIN table
    const mainStaticRows = qsa('tr[data-static]', $studentsTable);
    qsa('tr:not([data-static])', $studentsTable).forEach(tr => tr.remove());

    // Ensure ALL static rows (in any section) get proper highlighting
    qsa('tbody tr[data-static]').forEach(tr => {
      const st = tr.getAttribute('data-status') || 'due';
      tr.classList.toggle('overdue', st === 'overdue');
      tr.classList.toggle('paid', st === 'paid');
      tr.classList.toggle('due', st === 'due');
    });

    // Toggle empty state considering both static and dynamic rows (for main section only)
    if(rows.length === 0 && mainStaticRows.length === 0){
      $emptyState.classList.remove('hidden');
      return;
    } else { $emptyState.classList.add('hidden'); }

    const baseIndex = mainStaticRows.length; // offset numbering after static rows in main table
    rows.forEach((s, idx)=>{
      const tr = document.createElement('tr');

      const st = statusOfStudent(s);

      tr.innerHTML = `
        <td>${baseIndex + idx + 1}</td>
        <td>${escapeHtml(s.name)}</td>
        <td>${monthName(s.currentMonthIndex)}</td>
        <td><span class="status ${st}">${labelForStatus(st)}</span></td>
        <td><button class="cell-teacher" data-id="${s.id}">${escapeHtml(s.teacher)}</button></td>
      `;

      // row-level class for highlighting
      tr.classList.add(st);

      $studentsTable.appendChild(tr);
    });

    // attach teacher click (supports static and dynamic rows) across all sections
    qsa('.cell-teacher').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const tr = btn.closest('tr');
        if (tr && tr.hasAttribute('data-static')) {
          openStaticModal(tr);
        } else {
          const id = btn.getAttribute('data-id');
          openStudentModal(id);
        }
      });
    });

    // Also allow clicking the entire row to open modal in ALL tables
    qsa('tbody tr').forEach(tr => {
      tr.addEventListener('click', (e)=>{
        // avoid double when clicking the button (button handler will run)
        if (e.target.closest('.cell-teacher')) return;
        if (tr.hasAttribute('data-static')) {
          openStaticModal(tr);
        } else {
          const btn = tr.querySelector('.cell-teacher');
          if (btn) openStudentModal(btn.getAttribute('data-id'));
        }
      });
    });
  }

  function labelForStatus(s){
    return s==='paid'?"To'langan": s==='overdue'? 'Kechiktirilgan':'Joriy oy';
  }

  function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[s])); }

  // Modal helpers
  function openModal($m){ $m.classList.remove('hidden'); }
  function closeModal($m){ $m.classList.add('hidden'); }

  // Student modal
  function openStudentModal(id){
    selectedStudentId = id;
    const s = students.find(x=>x.id===id);
    if(!s) return;

    const st = statusOfStudent(s);
    $mName.textContent = s.name;
    $mTeacher.textContent = s.teacher;
    $mMonth.textContent = monthName(s.currentMonthIndex);
    $mStatus.textContent = labelForStatus(st);

    // history
    $mHistory.innerHTML = '';
    if(s.history.length===0){
      const li = document.createElement('li');
      li.textContent = "Tarix yo'q";
      $mHistory.appendChild(li);
    } else {
      s.history.slice().reverse().forEach(h=>{
        const li = document.createElement('li');
        li.textContent = `${monthName(h.monthIndex)} — ${h.status==='paid'?"To'langan":"To'lanmagan"} (${fmtDate(h.date)})`;
        $mHistory.appendChild(li);
      });
    }

    // Enable/disable confirm
    $confirmBtn.disabled = (st==='paid');

    openModal($studentModal);
  }

  // Open modal for static HTML row (no student id in storage)
  function openStaticModal(tr){
    selectedStudentId = null; // no storage link
    selectedStaticRow = tr;
    const name = tr.getAttribute('data-name') || '';
    const teacher = tr.getAttribute('data-teacher') || '';
    const month = tr.getAttribute('data-month') || '';
    const status = tr.getAttribute('data-status') || 'due';

    $mName.textContent = name;
    $mTeacher.textContent = teacher;
    $mMonth.textContent = month;
    $mStatus.textContent = labelForStatus(status);

    $mHistory.innerHTML = '';
    const li = document.createElement('li');
    li.textContent = "Tarix yo'q";
    $mHistory.appendChild(li);

    // allow confirming for static row
    $confirmBtn.disabled = false;

    openModal($studentModal);
  }

  function confirmPayment(){
    // Static row handling
    if(!selectedStudentId && selectedStaticRow){
      const tr = selectedStaticRow;
      const curMonthName = tr.getAttribute('data-month') || MONTHS[currentMonthIndex()];
      const curIdx = MONTHS.indexOf(curMonthName);
      const nextIdx = (curIdx >= 0 ? curIdx : currentMonthIndex()) + 1;
      const nextName = MONTHS[nextIdx % 12];

      // Advance month and set as due
      tr.setAttribute('data-month', nextName);
      tr.setAttribute('data-status', 'due');

      // Update cells
      const tds = tr.querySelectorAll('td');
      if (tds[2]) tds[2].textContent = nextName; // month column
      if (tds[3]) {
        const span = tds[3].querySelector('.status');
        if (span){ span.className = 'status due'; span.textContent = labelForStatus('due'); }
      }

      // update row classes (remove overdue, mark due)
      tr.classList.remove('overdue','paid');
      tr.classList.add('due');

      // close modal
      closeModal($studentModal);
      selectedStaticRow = null;
      return;
    }

    if(!selectedStudentId) return;
    const s = students.find(x=>x.id===selectedStudentId);
    if(!s) return;

    const cur = s.currentMonthIndex;
    // Record payment
    s.history.push({ monthIndex: cur, status:'paid', date: Date.now() });

    // Advance to next month automatically
    s.currentMonthIndex = (cur + 1) % 12;

    saveStudents();
    render();
    openStudentModal(s.id); // refresh modal contents
  }

  // Settings
  function openSettings(){
    $newPassword.value = '';
    openModal($settingsModal);
  }

  function saveSettings(){
    const p = ($newPassword.value||'').trim();
    if(p){ setPass(p); alert('Parol yangilandi.'); }
    closeModal($settingsModal);
  }

  // Event bindings
  document.addEventListener('click', (e)=>{
    const closeBtn = e.target.closest('[data-close]');
    if(closeBtn){
      const $modal = e.target.closest('.modal') || closeBtn.closest('.modal');
      if($modal) closeModal($modal);
    }
  });

  $togglePass?.addEventListener('click', ()=>{
    if($password.type==='password'){ $password.type='text'; $togglePass.innerHTML='<i class="fa-regular fa-eye-slash"></i>'; }
    else { $password.type='password'; $togglePass.innerHTML='<i class="fa-regular fa-eye"></i>'; }
  });

  $loginBtn?.addEventListener('click', ()=>{
    const input = ($password.value||'').trim();
    if(!input){ return alert('Parol kiriting'); }
    if(input === getPass()){
      setAuthed(true);
      $password.value = '';
      showMain();
    } else {
      alert('Noto\'g\'ri parol');
    }
  });

  $logoutBtn?.addEventListener('click', ()=>{
    setAuthed(false);
    showLogin();
  });

  $themePicker?.addEventListener('input', (e)=>{
    saveTheme(e.target.value);
  });

  $searchInput?.addEventListener('input', (e)=>{
    filterText = e.target.value;
    render();
  });

  $confirmBtn?.addEventListener('click', ()=>{
    confirmPayment();
  });

  $settingsBtn?.addEventListener('click', openSettings);
  $saveSettingsBtn?.addEventListener('click', saveSettings);
  $seedBtn?.addEventListener('click', seedStudents);

  // Views
  function showLogin(){
    $loginView.classList.remove('hidden');
    $mainView.classList.add('hidden');
  }
  function showMain(){
    $loginView.classList.add('hidden');
    $mainView.classList.remove('hidden');
    render();
  }

  // Init
  function init(){
    loadTheme();
    loadStudents();
    // migrate old default password to new one if needed
    const existingPass = lsGet(LS_KEYS.PASS, null);
    if (existingPass === null || existingPass === 'star123') {
      setPass(DEFAULT_PASS);
    }
    setupTabs();
    if(isAuthed()) showMain(); else showLogin();
  }

  // helpers
  window.addEventListener('keydown',(e)=>{
    if(e.key==='Escape'){
      [$studentModal,$settingsModal].forEach(m=>{ if(m && !m.classList.contains('hidden')) m.classList.add('hidden'); });
    }
  });

  init();
})();
