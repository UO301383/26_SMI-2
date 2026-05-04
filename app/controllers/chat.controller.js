// Chat controller: real-time messages with Server-Sent Events.

const jwt = require('jsonwebtoken');

const db = require('../models/db.js');
const authConfig = require('../config/auth.config.js');

const User = db.User;
const SECRET_KEY = authConfig.secret;

const clients = new Set();
const messages = [];
let nextMessageId = 1;

function getToken(req) {
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.replace('Bearer ', '');
    }
    return req.query.token;
}

async function getUserFromToken(req) {
    const token = getToken(req);
    if (!token) {
        return null;
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    return User.findByPk(decoded.id, {
        attributes: ['id', 'name', 'username', 'icon']
    });
}

function buildMessage(user, text) {
    return {
        id: nextMessageId++,
        text,
        userId: user.id,
        username: user.username || user.name,
        avatar: user.icon || '',
        createdAt: new Date().toISOString()
    };
}

function writeEvent(res, event, payload) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function broadcast(message) {
    clients.forEach(client => {
        writeEvent(client.res, 'message', message);
    });
}

module.exports.getMessages = (req, res) => {
    res.status(200).json(messages);
};

module.exports.stream = async (req, res) => {
    let user;

    try {
        user = await getUserFromToken(req);
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }

    if (!user) {
        return res.status(401).json({ error: 'Acceso denegado: No has enviado ningún token.' });
    }

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });

    writeEvent(res, 'history', messages);

    const client = { res, userId: user.id };
    clients.add(client);

    const keepAlive = setInterval(() => {
        res.write(': keep-alive\n\n');
    }, 25000);

    req.on('close', () => {
        clearInterval(keepAlive);
        clients.delete(client);
    });
};

module.exports.create = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'name', 'username', 'icon']
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const text = String(req.body.text || '').trim();
        if (!text) {
            return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
        }

        const message = buildMessage(user, text.slice(0, 500));
        messages.push(message);

        if (messages.length > 100) {
            messages.shift();
        }

        broadcast(message);
        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al enviar el mensaje.' });
    }
};
