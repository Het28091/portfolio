"use strict";
const menu = document.getElementById('hamburger');
const nav = document.getElementById('navLinks');
function closeMenu() { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open navigation'); }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; nav.classList.toggle('is-open', open); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); });
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMenu(); if (nav.contains(document.activeElement)) menu.focus(); } });
const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { nav.querySelectorAll('a').forEach(a => { if (a.hash === '#' + entry.target.id) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current'); }); } }); }, { rootMargin: '-20% 0px -60% 0px' });
document.querySelectorAll('main > section').forEach(s => observer.observe(s));
let sdkRequested = false;
document.getElementById('contactForm').addEventListener('focusin', () => {
 if (sdkRequested) return; sdkRequested = true;
 const script = document.createElement('script'); script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
 script.onload = () => window.emailjs.init({ publicKey: '42lSztGcz8oBeXs4m' }); document.head.appendChild(script);
});
document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const status = document.getElementById('formStatus');
    const name = document.getElementById('fName').value.trim();
    const mail = document.getElementById('fEmail').value.trim();
    const subj = document.getElementById('fSubject').value.trim();
    const msg = document.getElementById('fMsg').value.trim();

    const btn = this.querySelector('button[type=submit]');

    if (!name || !mail || !subj || !msg) {
        status.textContent = 'All fields are required.';
        status.className = 'form-status err';
        return;
    }

    btn.textContent = 'Sending...';
    btn.disabled = true;
    status.textContent = '';
    status.className = 'form-status';

    const useEmailJS = typeof emailjs !== 'undefined' && emailjs.send;
    if (useEmailJS) {
        emailjs.send('service_ybmu3rk', 'template_us1tvje', {
            from_name: name,
            from_email: mail,
            subject: subj,
            message: msg,
            to_email: 'het2809@gmail.com',
        }).then(() => {
            status.textContent = 'Message sent successfully!';
            status.className = 'form-status ok';
            btn.textContent = 'Send Message';
            btn.disabled = false;
            this.reset();
        }).catch((err) => {
            console.error('EmailJS error:', err);
            // Fallback to mailto
            openMailto(name, mail, subj, msg);
            btn.textContent = 'Send Message';
            btn.disabled = false;
        });
    } else {
        openMailto(name, mail, subj, msg);
        btn.textContent = 'Send Message';
        btn.disabled = false;
    }

    function openMailto(n, m, s, b) {
        const href = `mailto:het2809@gmail.com?subject=${encodeURIComponent('[Portfolio] ' + s)}&body=${encodeURIComponent('From: ' + n + ' <' + m + '>\n\n' + b)}`;
        window.open(href, '_blank');
        status.textContent = 'Email client opened. If it did not open, email het2809@gmail.com directly.';
        status.className = 'form-status ok';
    }
});
