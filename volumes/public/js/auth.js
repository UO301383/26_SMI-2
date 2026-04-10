
//Redirige a la pagina de login si el usuario no esta logueado
function requiereAuth(){
    if (!estaLogueado()){
        window.location.href = 'auth.html';
    }
}

//Pinta los botones de inicio se sesion o cerrar sesión dependiendo de si el usuario esta logueado o no
function botonesAuth(){
    const nav = document.getElementById('nav-auth');
    if(!nav){
        return;
    }
    if (estaLogueado()){ //Si hay sesión, muestra el botón de perfil y cerrar sesión
        nav.innerHTML = '<a href="profile.html" class="btn btn-outline-danger btn-sm">Mi perfil</a>' +
        '<button onclick="logout()" class="btn btn-outline-danger btn-sm">Cerrar sesión</button>';
    } else { //Si no hay sesión, muestra el botón de iniciar sesión
        nav.innerHTML = '<a href="auth.html" class="btn btn-outline-danger btn-sm">Iniciar sesión</a>';
    }

}


//guarda sesión en localStorage después de iniciar sesión o registrarse
function guardaSession(token, user){
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

//cerrar sesión
function logout(){
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

//devuelve el usuario en sesión (si hay token, devuelve el usuario almacenado en localStorage, de lo contrario devuelve null)
function obtenerUsuarioEnSesion(){
    const user = localStorage.getItem('user');
    if (user){
        return JSON.parse(user);
    }
    return null;
}

//devuelve true si hay sesion activa, false si no
function estaLogueado(){
    return !!localStorage.getItem('token');
}

document.addEventListener('DOMContentLoaded', function(){
    const btnLogin = document.getElementById('btn-login');
    const btnRegistro = document.getElementById('btn-registro');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');

    //Alternar entre formulario de login y registro
    if (showRegister){
        showRegister.addEventListener('click', function(e){
            e.preventDefault();
            document.getElementById('login-form').style.display = 'none'; // Oculta el formulario de login
            document.getElementById('form-registro').style.display = 'block'; // Muestra el formulario de registro
        });
    }
    if (showLogin){
        showLogin.addEventListener('click', function(e){
            e.preventDefault();
            document.getElementById('form-registro').style.display = 'none'; // Oculta el formulario de registro
            document.getElementById('login-form').style.display = 'block'; // Muestra el formulario de login
        });   
    }

    if (btnLogin){
        btnLogin.addEventListener('click', async function(e){
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-contraseña').value;
            const error = document.getElementById('login-error');

            const res = await login(email, password); //llama a api.js

            if (res.token){
                guardaSession(res.token, res.user);
                window.location.href = 'index.html';
            } else {
                error.textContent = res.message || 'Error al iniciar sesión';
            }
        });
    }

    if (btnRegistro){
        btnRegistro.addEventListener('click', async function(e){
            const nombreUsuario = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const contraseña = document.getElementById('reg-contraseña').value;
            const error = document.getElementById('registro-error');

            const res = await registro(nombreUsuario, email, contraseña); //llama a api.js
            console.log('respuesta registro',res);
            if(res.id){
                const loginRes = await login(email, contraseña);
                if(loginRes.token){
                    guardaSession(loginRes.token, loginRes.user);
                    window.location.href = 'index.html';
                } else {
                error.textContent = 'Registro OK pero error al iniciar sesión automáticamente';
            }
            } else {
                error.textContent = res.error || 'Error al registrarse';
        }
        });
    }
})
