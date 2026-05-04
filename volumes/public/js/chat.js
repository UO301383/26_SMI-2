// Chat en tiempo real usando el backend y Server-Sent Events.

function mostrarEstadoChat(message) {
    const status = document.getElementById('chat-status');
    if (!status) {
        return;
    }

    status.textContent = message;
    status.classList.remove('d-none');
}

function setConnectionStatus(text, variant) {
    const badge = document.getElementById('chat-connection');
    if (!badge) {
        return;
    }

    badge.textContent = text;
    badge.className = `badge text-bg-${variant}`;
}

function crearElementoMensaje(message, currentUserId) {
    const item = document.createElement('article');
    const isOwn = Number(message.userId) === Number(currentUserId);
    item.className = `chat-message ${isOwn ? 'own' : ''}`;
    item.dataset.messageId = message.id;

    const bubble = document.createElement('div');
    bubble.className = `rounded-3 p-3 ${isOwn ? 'bg-danger text-white' : 'bg-white border'}`;

    const header = document.createElement('div');
    header.className = `small mb-1 ${isOwn ? 'text-white-50' : 'text-muted'}`;
    header.textContent = `${message.username} · ${new Date(message.createdAt).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    })}`;

    const text = document.createElement('div');
    text.textContent = message.text;

    bubble.appendChild(header);
    bubble.appendChild(text);
    item.appendChild(bubble);

    return item;
}

function scrollChatToBottom() {
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

async function enviarMensaje(text) {
    const response = await fetch(baseURL + '/chat/messages', {
        method: 'POST',
        headers: obtenerHeaders(true),
        body: JSON.stringify({ text })
    });

    return response.json();
}

document.addEventListener('DOMContentLoaded', async () => {
    botonesAuth();

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const messagesContainer = document.getElementById('chat-messages');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    const renderedMessages = new Set();

    if (!token || !user.id) {
        window.location.href = 'auth.html';
        return;
    }

    function pintarMensaje(message) {
        if (!message || renderedMessages.has(message.id)) {
            return;
        }

        renderedMessages.add(message.id);
        messagesContainer.appendChild(crearElementoMensaje(message, user.id));
        scrollChatToBottom();
    }

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const text = input.value.trim();

        if (!text) {
            return;
        }

        input.value = '';

        const response = await enviarMensaje(text);
        if (response.error) {
            mostrarEstadoChat(response.error);
        }
    });

    const streamUrl = `${baseURL}/chat/stream?token=${encodeURIComponent(token)}`;
    const events = new EventSource(streamUrl);

    events.addEventListener('open', () => {
        setConnectionStatus('Conectado', 'success');
    });

    events.addEventListener('history', event => {
        JSON.parse(event.data).forEach(pintarMensaje);
    });

    events.addEventListener('message', event => {
        pintarMensaje(JSON.parse(event.data));
    });

    events.addEventListener('error', () => {
        setConnectionStatus('Reconectando', 'warning');
    });
});
