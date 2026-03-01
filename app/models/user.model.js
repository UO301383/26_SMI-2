// Declaramos un array para guardar los objetos de usuario
const users = [];

// Operaciones para gestionar los objetos de usuario
module.exports.create = (data) => {
    const id = users.length + 1;
    
    // Creamos el objeto usuario con los campos del guion
    const user = { 
        id: id, 
        name: data.name, 
        email: data.email,
        icon: data.icon, 
        username: data.username,
        password: data.password
    };
    
    users.push(user);
    return Promise.resolve(user);
};

module.exports.findAll = () => {
    return Promise.resolve(users);
};

module.exports.findById = (id) => {
    const user = users.find(u => u.id == id);
    return Promise.resolve(user);
};

module.exports.drop = () => {
    users.length = 0;
    return Promise.resolve();
};