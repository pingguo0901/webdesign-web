/* WebHub — Interactive Script */

function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  const orig = btn.textContent;
  btn.textContent = 'Sending...';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '✅ Received! We\'ll get back to you shortly.';
    setTimeout(() => {
      btn.textContent = orig;
      btn.disabled = false;
      e.target.reset();
    }, 2500);
  }, 800);
  return false;
}
