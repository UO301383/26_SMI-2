// Chat con converse.js + Openfire XMPP

document.addEventListener('DOMContentLoaded', () => {

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const xmppPassword = localStorage.getItem('xmpp_password');

    // Si no hay sesión redirigimos al login
    if (!token || !user.username || !xmppPassword) {
        window.location.href = 'auth.html';
        return;
    }

    // Inicializamos converse.js con los datos del usuario en sesión
    converse.initialize({
        bosh_service_url: 'http://192.168.1.84:7070/http-bind',
        default_domain:   '192.168.1.84',
        view_mode:        'fullscreen',
        auto_login:       true,
        jid:              `${user.username}@192.168.1.84`,
        password:         xmppPassword
    });
});