const URL = 'http://localhost:3000'; // Dirección del backend Express

//devuelve los headers necesarios para las peticiones, si withAuth es true, incluye el token de autenticación en los headers.
function getHearders(withAuth = false) {
    const token = localStorage.getItem('token');
    if(withAuth){
        const headers = { 'Content-Type': 'application/json' };
        if(token){
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }
}

// obtener todos los videos (con búsqueda opcional))
async function getVideos(search) {
    let url;
    if (search) {
        url = URL + '/videos?search=' + encodeURIComponent(search);
    } else{
        url = URL + '/videos';
    }
    const response = await fetch(url);
    return response.json();
}

//obtener un video por su ID
async function getVideoById(id) {
    const response = await fetch(URL + '/video/' + id);
    return response.json();
}

//obtener videos de un usuario concreto
async function getVideosByUser(userId) {
    const response = await fetch(URL + '/video/user/' + userId);
    return response.json();
}

//obtener playlist
async function getPlaylist(){
    const response = await fetch(URL + '/playlist');
    return response.json();
}

//obtener todos los usuarios
async function getUsers() {
    const response = await fetch(URL + '/users');
    return response.json();
}

//obtener un usuario por su ID
async function getUserById(id) {
    const response = await fetch(URL + '/user/' + id);
    return response.json();
}

//actualizar nombre y username del usuario en sesión (requiere autenticación)
async function updateUser(id, userData) {
    const res = await fetch(URL + /user/, {
        method: 'PUT',
        headers: getHearders(true),
        body: JSON.stringify(userData)
    });
    return res.json();
}

//inicar sesión
async function login(email, password) {
    const res = await fetch(URL + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return res.json();
}

//registrar usuario
async function register(username, email, password) {
    const res = await fetch(URL + '/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });
    return res.json();
}

//guardar la sesion en localStorage después de iniciar sesión o registrarse
function saveSession(token, user){
    localStorage.setItem('token', user);
    localStorage.setItem('user', JSON.stringify(user));
}

//cerrar sesión
function logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

//devuelve el usuario en sesión (si hay token, devuelve el usuario almacenado en localStorage, de lo contrario devuelve null)
function getSessionUser(){
    const user = localStorage.getItem('user');
    if (user){
        return JSON.parse(user);
    }
    return null;
}

//devuelve true si hay sesion activa, false si no
function isLoggedIn(){
    return !!localStorage.getItem('token');
}
