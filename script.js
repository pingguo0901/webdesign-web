/* WebHub — Language Switch & Interactive Script */

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

  // Update title
  if (currentLang === 'zh') {
    document.title = 'WebHub — 专业定制网站 & 模板';
  } else {
    document.title = 'WebHub — Professional Custom Websites & Templates';
  }

  // Update all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      el.textContent = t[key];
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key]) {
      el.placeholder = t[key];
    }
  });

  // Update select options (textContent for option elements)
  const select = document.getElementById('serviceSelect');
  if (select) {
    const options = select.querySelectorAll('option');
    options.forEach(opt => {
      const key = opt.getAttribute('data-i18n');
      if (key && t[key]) {
        opt.textContent = t[key];
      }
    });
  }
}

function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  const orig = LANG[currentLang].formSubmit;
  btn.textContent = LANG[currentLang].sending;
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = LANG[currentLang].received;
    setTimeout(() => {
      btn.textContent = orig;
      btn.disabled = false;
      e.target.reset();
    }, 2500);
  }, 800);
  return false;
}

// Apply language on page load
applyLang();
