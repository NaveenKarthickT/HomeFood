// Authentication Logic for User and Admin Logins

let selectedRole = 'user'; // 'user' or 'admin'
let isRegisterMode = false;
let currentLang = localStorage.getItem('homefood_lang') || 'ta';
let currentTheme = localStorage.getItem('homefood_theme') || 'light';

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(currentTheme);
  applyLang(currentLang);

  document.getElementById('langToggleBtn')?.addEventListener('click', () => {
    const nextLang = currentLang === 'ta' ? 'en' : 'ta';
    applyLang(nextLang);
  });

  document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });
});

function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('homefood_theme', theme);
  const icon = document.getElementById('themeIcon');
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('homefood_lang', lang);
  const label = document.getElementById('currentLangLabel');
  if (label) label.textContent = lang === 'ta' ? 'English' : 'தமிழ்';

  updateRoleUI();
}

function switchLoginRole(role) {
  selectedRole = role;
  isRegisterMode = false;

  const tabUser = document.getElementById('tabUserLogin');
  const tabAdmin = document.getElementById('tabAdminLogin');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const switchContainer = document.getElementById('switchFormContainer');

  loginForm.style.display = 'block';
  registerForm.style.display = 'none';

  if (role === 'admin') {
    tabUser.classList.remove('active');
    tabAdmin.classList.add('active');
    switchContainer.style.display = 'none'; // Admin cannot self-register from public form
  } else {
    tabAdmin.classList.remove('active');
    tabUser.classList.add('active');
    switchContainer.style.display = 'block';
  }

  updateRoleUI();
}

function updateRoleUI() {
  const isTa = currentLang === 'ta';
  const mainHeading = document.getElementById('loginMainHeading');
  const subHeading = document.getElementById('loginSubHeading');
  const lblUsername = document.getElementById('lblUsername');
  const loginPhone = document.getElementById('loginPhone');
  const demoDesc = document.getElementById('demoDescription');
  const demoLabel = document.getElementById('demoBtnLabel');

  if (selectedRole === 'admin') {
    mainHeading.textContent = isTa ? '🔐 சமையலறை நிர்வாகி உள்நுழைவு' : '🔐 Kitchen Admin Portal Login';
    subHeading.textContent = isTa ? 'உணவு பட்டியல் மற்றும் நேரடி ஆர்டர் மேலாண்மை' : 'Manage live kitchen orders and menu stock';
    lblUsername.textContent = isTa ? 'நிர்வாகி எண் / பயனர் பெயர் (Admin User)' : 'Admin Mobile / Username';
    loginPhone.placeholder = '7200676767 or admin';
    demoDesc.textContent = isTa ? 'நிர்வாகி கணக்கை உடனடியாக திறக்க:' : 'Open Admin Portal immediately:';
    demoLabel.textContent = isTa ? 'நிர்வாகியாக உள்நுழைக (Demo Admin)' : 'Sign In as Demo Admin';
  } else {
    mainHeading.textContent = isTa ? '👤 வாடிக்கையாளர் உள்நுழைவு' : '👤 Customer Login';
    subHeading.textContent = isTa ? 'உங்கள் விருப்பமான வீட்டு உணவுகளை ஆர்டர் செய்யுங்கள்' : 'Order delicious home cooked food';
    lblUsername.textContent = isTa ? 'செல்போன் எண் (Mobile Number)' : 'Mobile Number';
    loginPhone.placeholder = '9876543210';
    demoDesc.textContent = isTa ? 'கிராமத்து வாடிக்கையாளராக உடனடி சோதனை:' : 'Try as Village Customer:';
    demoLabel.textContent = isTa ? 'வாடிக்கையாளர் உள்நுழைவு (Demo User)' : 'Sign In as Demo User';
  }
}

function toggleAuthMode() {
  isRegisterMode = !isRegisterMode;
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const switchPrompt = document.getElementById('switchPrompt');
  const switchFormBtn = document.getElementById('switchFormBtn');
  const demoBox = document.getElementById('demoBoxContainer');

  const isTa = currentLang === 'ta';

  if (isRegisterMode) {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    demoBox.style.display = 'none';
    switchPrompt.textContent = isTa ? 'ஏற்கனவே கணக்கு உள்ளதா?' : 'Already have an account?';
    switchFormBtn.textContent = isTa ? 'உள்நுழையவும் (Login)' : 'Sign In';
  } else {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    demoBox.style.display = 'block';
    switchPrompt.textContent = isTa ? 'புதிய வாடிக்கையாளரா?' : 'New customer?';
    switchFormBtn.textContent = isTa ? 'இங்கு பதிவு செய்யுங்கள் (Register)' : 'Register Here';
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const phone = document.getElementById('loginPhone').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const submitBtn = document.getElementById('btnSubmitLogin');

  submitBtn.disabled = true;
  submitBtn.textContent = '...';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password, loginType: selectedRole })
    });

    const data = await res.json();
    if (data.success) {
      localStorage.setItem('homefood_token', data.token);
      localStorage.setItem('homefood_user', JSON.stringify(data.user));

      showToast(`🎉 ${data.message}`);

      setTimeout(() => {
        if (data.user.role === 'admin') {
          window.location.href = '/admin.html';
        } else {
          window.location.href = '/';
        }
      }, 700);
    } else {
      showToast(data.message || 'Login failed');
    }
  } catch (err) {
    showToast('உள்நுழைவு பிழை. மீண்டும் முயற்சிக்கவும்.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '🚀 உள்நுழைக (Sign In)';
  }
}

async function handleRegisterSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const villageOrCity = document.getElementById('regVillageOrCity').value;
  const address = document.getElementById('regAddress').value.trim();

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, phone, password, villageOrCity, address, preferredLang: currentLang
      })
    });

    const data = await res.json();
    if (data.success) {
      localStorage.setItem('homefood_token', data.token);
      localStorage.setItem('homefood_user', JSON.stringify(data.user));
      showToast('🎉 கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது!');
      setTimeout(() => {
        window.location.href = '/';
      }, 800);
    } else {
      showToast(data.message || 'Registration failed');
    }
  } catch (err) {
    showToast('பதிவு செய்வதில் சிக்கல்');
  }
}

async function quickDemoLogin() {
  try {
    const res = await fetch('/api/auth/quick-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: selectedRole })
    });

    const data = await res.json();
    if (data.success) {
      localStorage.setItem('homefood_token', data.token);
      localStorage.setItem('homefood_user', JSON.stringify(data.user));
      showToast(`⚡ ${data.message}`);

      setTimeout(() => {
        if (selectedRole === 'admin') {
          window.location.href = '/admin.html';
        } else {
          window.location.href = '/';
        }
      }, 500);
    } else {
      showToast(data.message);
    }
  } catch (err) {
    showToast('Demo login failed');
  }
}

function showToast(msg) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
