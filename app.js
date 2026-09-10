const form = document.querySelector('#login-form');
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const emailError = document.querySelector('#email-error');
const passwordError = document.querySelector('#password-error');
const formStatus = document.querySelector('#form-status');
const passwordToggle = document.querySelector('#password-toggle');
const visualStage = document.querySelector('#visual-stage');

if (visualStage) {
  visualStage.addEventListener('click', () => {
    visualStage.classList.toggle('is-active');
  });

  visualStage.addEventListener('pointermove', (event) => {
    const bounds = visualStage.getBoundingClientRect();
    const rotateX = ((event.clientY - bounds.top) / bounds.height - 0.5) * -10;
    const rotateY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 12;
    visualStage.style.setProperty('--tilt-x', `${rotateX}deg`);
    visualStage.style.setProperty('--tilt-y', `${rotateY}deg`);
  });

  visualStage.addEventListener('pointerleave', () => {
    visualStage.style.setProperty('--tilt-x', '0deg');
    visualStage.style.setProperty('--tilt-y', '0deg');
  });
}

passwordToggle.addEventListener('click', () => {
  const isPassword = password.type === 'password';
  password.type = isPassword ? 'text' : 'password';
  passwordToggle.textContent = isPassword ? 'Sembunyikan' : 'Tampilkan';
  passwordToggle.setAttribute('aria-label', isPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
  passwordToggle.setAttribute('title', isPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
});

function clearErrors() {
  email.classList.remove('invalid');
  password.classList.remove('invalid');
  emailError.textContent = '';
  passwordError.textContent = '';
  formStatus.textContent = '';
  formStatus.classList.remove('error');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearErrors();
  let valid = true;

  if (!email.value.trim() || !email.validity.valid) {
    email.classList.add('invalid');
    emailError.textContent = 'Masukkan alamat email yang valid.';
    valid = false;
  }
  if (password.value.length < 6) {
    password.classList.add('invalid');
    passwordError.textContent = 'Kata sandi minimal 6 karakter.';
    valid = false;
  }
  if (!valid) return;

  localStorage.setItem('pixipy-session', JSON.stringify({ email: email.value.trim(), remember: document.querySelector('#remember').checked }));
  window.location.href = 'dashboard.html';
});

document.querySelector('#google-button').addEventListener('click', () => {
  formStatus.textContent = 'Login Google akan aktif setelah Firebase dikonfigurasi.';
  formStatus.classList.add('error');
});

document.querySelector('#signup-link').addEventListener('click', (event) => {
  event.preventDefault();
  formStatus.textContent = 'Halaman pendaftaran akan ditambahkan berikutnya.';
  formStatus.classList.remove('error');
});

document.querySelector('#forgot-link').addEventListener('click', (event) => {
  event.preventDefault();
  formStatus.textContent = 'Tautan reset kata sandi akan dikirim setelah backend auth aktif.';
  formStatus.classList.remove('error');
});
