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

  // Initialize reveal-on-scroll observer for elements with .reveal
  initRevealObserver();
}

function initRevealObserver() {
  const reveals = Array.from(document.querySelectorAll('.reveal'));
  if (!reveals || reveals.length === 0) return;

  // Assign staggered transition delays per local group (preserve any existing inline delays)
  try {
    // Group by nearest ancestor that contains multiple .reveal children
    const groups = new Map();
    reveals.forEach((el) => {
      if (el.style && el.style.transitionDelay) return; // preserve explicit inline delay
      let parent = el.parentElement;
      while (parent && parent !== document.body) {
        if (parent.querySelectorAll && parent.querySelectorAll('.reveal').length > 1) break;
        parent = parent.parentElement;
      }
      const key = parent || document;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(el);
    });

    // Apply stagger per group
    groups.forEach((els) => {
      els.forEach((el, i) => {
        // only set when not already set inline
        if (!el.style || !el.style.transitionDelay) {
          const delay = (i * 0.06).toFixed(2) + 's';
          el.style.transitionDelay = delay;
        }
      });
    });
  } catch (e) {
    // fail silently
    console.warn('reveal stagger setup failed', e);
  }

  if (!('IntersectionObserver' in window)) {
    // Fallback: show all
    reveals.forEach((el) => el.classList.add('active'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach((el) => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('[data-include]')) loadIncludes(); else initUI();
});
