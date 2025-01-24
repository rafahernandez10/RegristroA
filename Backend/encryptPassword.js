import bcrypt from 'bcryptjs';

const contrasena = '123'; // Cambia esto por la contraseña que deseas encriptar

async function encryptPassword() {
    try {
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        console.log(`Contraseña encriptada: ${hashedPassword}`);
    } catch (error) {
        console.error('Error al encriptar la contraseña:', error);
    }
}

encryptPassword();
