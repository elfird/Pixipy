const session = JSON.parse(localStorage.getItem('pixipy-session') || 'null');

if (!session) {
  window.location.href = 'index.html';
}

const email = session?.email || 'pengguna@pixipy.id';
const name = email.split('@')[0].replace(/[._-]/g, ' ');
document.querySelector('#user-email').textContent = email;
const userName = document.querySelector('#user-name');
if (userName) userName.textContent = name;
document.querySelector('#avatar').textContent = name.charAt(0).toUpperCase();

const themeToggle = document.querySelector('#theme-toggle');
const themeIcon = document.querySelector('#theme-icon');

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark-mode', isDark);
  themeIcon.textContent = isDark ? '☀' : '☾';
  themeToggle.title = isDark ? 'Aktifkan tema terang' : 'Aktifkan tema gelap';
  themeToggle.setAttribute('aria-label', themeToggle.title);
}

applyTheme(localStorage.getItem('pixipy-theme') || 'light');
themeToggle.addEventListener('click', () => {
  const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
  localStorage.setItem('pixipy-theme', nextTheme);
  applyTheme(nextTheme);
});

document.querySelector('#logout-button').addEventListener('click', () => {
  localStorage.removeItem('pixipy-session');
  window.location.href = 'index.html';
});

const modalBackdrop = document.querySelector('#modal-backdrop');
const modalTitle = document.querySelector('#modal-title');
const modalMessage = document.querySelector('#modal-message');
const modalIcon = document.querySelector('#modal-icon');
const modalAction = document.querySelector('#modal-action');
let modalSubmit = closeModal;

function openModal(title, message, icon = '+') {
  document.querySelector('#modal-date-input')?.remove();
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalIcon.textContent = icon;
  modalBackdrop.hidden = false;
  document.querySelector('#modal-action').focus();
}

function closeModal() {
  modalBackdrop.hidden = true;
  modalSubmit = closeModal;
  modalAction.textContent = 'Mengerti';
}

document.querySelector('#profile-button').addEventListener('click', () => {
  openModal('Profil pengguna', `Akun aktif: ${email}`, '◉');
});
document.querySelector('#modal-close').addEventListener('click', closeModal);
modalAction.addEventListener('click', () => modalSubmit());
modalBackdrop.addEventListener('click', (event) => {
  if (event.target === modalBackdrop) closeModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modalBackdrop.hidden) closeModal();
});

const moduleFiles = {
  overview: 'modules/overview/overview.html',
  kiosk: 'modules/kiosk/kiosk.html',
  transaction: 'modules/transaction/transaction.html',
};

const moduleStyles = {
  overview: 'modules/overview/overview.css',
  kiosk: 'modules/kiosk/kiosk.css',
  transaction: 'modules/transaction/transaction.css',
};

let moduleRequestId = 0;

async function loadModule(moduleName, label) {
  const requestId = ++moduleRequestId;
  const view = document.querySelector('#module-container');
  const file = moduleFiles[moduleName] || 'modules/placeholder/placeholder.html';
  view.className = 'module-view module-loading-state';
  view.innerHTML = '<div class="module-loading">Memuat modul...</div>';
  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error('Module request failed');
    if (requestId !== moduleRequestId) return;
    view.innerHTML = await response.text();
    view.className = `module-view active-view module-enter ${moduleName}-module`;
    requestAnimationFrame(() => view.classList.add('module-ready'));
    if (!moduleFiles[moduleName]) {
      view.querySelector('#placeholder-title').textContent = label;
      view.querySelector('#placeholder-description').textContent = `Tampilan ${label} sudah siap. Data dan CRUD akan dihubungkan melalui backend.`;
    }
    if (moduleStyles[moduleName] && !document.querySelector(`link[href="${moduleStyles[moduleName]}"]`)) {
      const stylesheet = document.createElement('link');
      stylesheet.rel = 'stylesheet';
      stylesheet.href = moduleStyles[moduleName];
      document.head.appendChild(stylesheet);
    }
  } catch (error) {
    view.innerHTML = '<div class="module-placeholder"><h1>Modul belum dapat dimuat</h1><p>Jalankan dashboard melalui server lokal agar file modul dapat dibaca.</p></div>';
  }
}

document.querySelector('.sidebar nav').addEventListener('click', async (event) => {
  const item = event.target.closest('.nav-item[data-module]');
  if (!item) return;
  event.preventDefault();
  try {
    const moduleName = item.dataset.module;
    document.querySelectorAll('.nav-item').forEach((navItem) => navItem.classList.remove('active'));
    item.classList.add('active');
    await loadModule(moduleName, item.textContent.trim());
    window.history.replaceState(null, '', `#${moduleName}`);
  } catch (error) {
    console.error('Gagal membuka modul:', error);
  }
});

async function activateModule(moduleName) {
  const item = document.querySelector(`[data-module="${moduleName}"]`);
  if (!item) return;
  document.querySelectorAll('.nav-item').forEach((navItem) => navItem.classList.remove('active'));
  item.classList.add('active');
  await loadModule(moduleName, item.textContent.trim());
}

document.querySelectorAll('.module-view').forEach((view) => view.remove());
const moduleContainer = document.createElement('section');
moduleContainer.id = 'module-container';
moduleContainer.className = 'module-view active-view';
document.querySelector('.main-content').appendChild(moduleContainer);
moduleContainer.addEventListener('click', (event) => {
  const dateCard = event.target.closest('.date-card');
  if (dateCard) {
    const currentDate = dateCard.querySelector('strong').textContent.split('/').reverse().join('-');
    modalTitle.textContent = 'Pilih tanggal';
    modalMessage.textContent = 'Pilih tanggal laporan yang ingin ditampilkan pada Overview.';
    modalIcon.textContent = '▣';
    let dateInput = document.querySelector('#modal-date-input');
    if (!dateInput) {
      dateInput = document.createElement('input');
      dateInput.id = 'modal-date-input';
      dateInput.type = 'date';
      dateInput.required = true;
      dateInput.className = 'modal-date-input';
      modalMessage.after(dateInput);
    }
    dateInput.value = currentDate;
    modalAction.textContent = 'Terapkan tanggal';
    modalSubmit = () => {
      if (!dateInput.value) return;
      const selected = new Date(`${dateInput.value}T00:00:00`);
      const formatted = selected.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
      document.querySelectorAll('.date-card strong').forEach((date) => { date.textContent = formatted; });
      document.querySelectorAll('.overview-stat-grid small').forEach((label) => { label.textContent = `${formatted} - ${formatted}`; });
      closeModal();
    };
    modalBackdrop.hidden = false;
    dateInput.focus();
    return;
  }
  const action = event.target.closest('.primary-button');
  if (!action) return;
  const label = action.textContent.trim();
  openModal(label, `Aksi "${label}" sudah disiapkan. Form dan proses CRUD akan dihubungkan melalui backend CodeIgniter.`, '+');
});
moduleContainer.addEventListener('input', (event) => {
  if (event.target.id !== 'kiosk-search') return;
  const keyword = event.target.value.toLowerCase();
  moduleContainer.querySelectorAll('.kiosk-row').forEach((row) => {
    row.hidden = !row.firstElementChild.textContent.toLowerCase().includes(keyword);
  });
});
const initialModule = window.location.hash.slice(1);
activateModule(initialModule || 'overview');
window.addEventListener('hashchange', () => activateModule(window.location.hash.slice(1) || 'overview'));
