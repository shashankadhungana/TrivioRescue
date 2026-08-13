async function loadIncludes() {
  const includes = document.querySelectorAll('[data-include]');
  await Promise.all(Array.from(includes).map(async (el) => {
    const url = el.getAttribute('data-include');
    try {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        const wrapper = document.createElement('div');
        wrapper.innerHTML = text;
        el.replaceWith(...Array.from(wrapper.children));
      } else {
        console.error('Include failed:', url, res.status);
      }
    } catch (e) {
      console.error('Include error:', e);
    }
  }));
  initUI();
}

function initUI() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    // If the form posts to an external endpoint (e.g. Formspree), allow normal submission.
    const action = contactForm.getAttribute('action') || '';
    const isExternal = /^https?:\/\//i.test(action) && !action.includes(location.hostname);
    if (!isExternal) {
      contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const submitButton = contactForm.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.textContent = 'Message sent!';
          submitButton.disabled = true;
          setTimeout(() => {
            submitButton.textContent = 'Send message';
            submitButton.disabled = false;
            contactForm.reset();
          }, 1800);
        }
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('[data-include]')) loadIncludes(); else initUI();
});
