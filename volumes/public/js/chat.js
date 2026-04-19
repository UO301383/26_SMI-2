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

    // Obtenemos la IP del servidor dinámicamente
    const openfireHost = window.location.hostname;
    const boshUrl = `http://${openfireHost}:7070/http-bind`;

    // Inicializamos converse.js con los datos del usuario en sesión
    converse.initialize({
      bosh_service_url:            `http://${openfireHost}:7070/http-bind`,
      default_domain:              openfireHost,
      view_mode:                   'fullscreen',
      auto_login:                  true,
      jid:                         `${user.username}@${openfireHost}`,
      password:                    xmppPassword,
      discover_connection_methods: false,
      locales:                     []
  });
});