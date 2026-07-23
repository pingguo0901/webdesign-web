/* 星域网站设计 — 交互脚本 */

function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  const orig = btn.textContent;
  btn.textContent = '提交中...';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '✅ 已收到，我们会尽快联系你！';
    setTimeout(() => {
      btn.textContent = orig;
      btn.disabled = false;
      e.target.reset();
    }, 2500);
  }, 800);
  return false;
}
