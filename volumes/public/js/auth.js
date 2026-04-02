
//Redirige a la pagina de login si el usuario no esta logueado
function requiereAuth(){
    if (!isLoggedIn()){
        window.location.href = 'auth.html';
    }
}

//Pinta los botones de inicio se sesion o cerrar sesión dependiendo de si el usuario esta logueado o no
function botonesAuth(){
    const nav = document.getElementById('nav-auth');
    if(!nav){
        return;
    }
    if (isLoggedIn()){ //Si hay sesión, muestra el botón de perfil y cerrar sesión
        nav.innerHTML = '<a href="profile.html" class="btn btn-outline-danger btn-sm">Mi perfil</a>' +
        '<button onclick="logout()" class="btn btn-outline-danger btn-sm">Cerrar sesión</button>';
    } else { //Si no hay sesión, muestra el botón de iniciar sesión
        nav.innerHTML = '<a href="auth.html" class="btn btn-outline-danger btn-sm">Iniciar sesión</a>';
    }

}


//guarda sesión en localStorage después de iniciar sesión o registrarse
function saveSession(token, user){
    localStorage.setItem('token', token);
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

document.addEventListener('DOMContentLoaded', function(){
    const btnLogin = document.getElementById('btn-login');
    const btnRegister = document.getElementById('btn-register');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');

    //Alternar entre formulario de login y registro
    if (showRegister){
        showRegister.addEventListener('click', function(e){
            e.preventDefault();
            document.getElementById('login-form').style.display = 'none'; // Oculta el formulario de login
            document.getElementById('register-form').style.display = 'block'; // Muestra el formulario de registro
        });
    }
    if (showLogin){
        showLogin.addEventListener('click', function(e){
            e.preventDefault();
            document.getElementById('register-form').style.display = 'none'; // Oculta el formulario de registro
            document.getElementById('login-form').style.display = 'block'; // Muestra el formulario de login
        });   
    }

    if (btnLogin){
        btnLogin.addEventListener('click', async function(e){
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const error = document.getElementById('login-error');

            const res = await login(email, password); //llama a api.js

            if (res.token){
                saveSession(res.token, res.user);
                window.location.href = 'index.html';
            } else {
                error.textContent = res.message || 'Error al iniciar sesión';
            }
        });
    }

    if (btnRegister){
        btnRegister.addEventListener('click', async function(e){
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const error = document.getElementById('register-error');

            const res = await register(username, email, password); //llama a api.js

            if(res.id){
                const loginRes = await login(email, password); //inicia sesión automáticamente después de registrarse
                saveSession(loginRes.token, loginRes.user);
                window.location.href = 'index.html';
            }else {
                error.textContent = res.message || 'Error al registrarse';
            }
        });
    }
})
