/* WebHub — Language Switch & Modal Script */

let currentLang = localStorage.getItem('webhub-lang') || 'en';

function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

function switchLang() {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  localStorage.setItem('webhub-lang', currentLang);
  applyLang();
}

function applyLang() {
  const t = LANG[currentLang];
  document.documentElement.lang = currentLang === 'zh' ? 'zh' : 'en';

  if (currentLang === 'zh') {
    document.title = 'WebHub — 专业定制网站 & 模板';
  } else {
    document.title = 'WebHub — Professional Custom Websites & Templates';
  }

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) el.textContent = t[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key]) el.placeholder = t[key];
  });
}

function openModal() {
  document.getElementById('ctaModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('ctaModal')) return;
  document.getElementById('ctaModal').classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.getElementById('ctaModal').classList.remove('active');
    document.body.style.overflow = '';
  }
});

applyLang();
