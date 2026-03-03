
/*************** VALIDACION DE FORMULARIO "REGISTRAR NUEVO USUARIO" **********/

// Seleccionamos las variables y los inputs del formulario
const admin_register_form = document.querySelector('#admin_register_form');
const userName = document.querySelector("#user_name");
const userLastName = document.querySelector("#user_lastname");
const userEmail = document.querySelector('#user_email');
const userTel = document.querySelector('#user_tel');
const userLoginName = document.querySelector('#user_login_name');
const userPassword = document.querySelector('#user_password');

// Definimos las funciones que nos permitirán realizar la validación de los inputs
function validateName(user_name) {
    const regex = /^(?=.{2,20}$)[A-Za-zÁÉÍÓÚáéíóúÑñ]+( [A-Za-zÁÉÍÓÚáéíóúÑñ]+){0,2}$/u;
    
    const message = "El nombre deberá contener entre 2 y 20 letras y se podrá hacer uso de hasta dos espacios no consecutivos";

    return regex.test(user_name) ? true : message;
}

function validateLastName(user_lastname) {
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]{2,20}(?: [A-Za-zÁÉÍÓÚáéíóúÑñ]{2,20})?$/u;

    const message = "El/los apellidos deberán contener entre 2 y 20 letras y se podrá hacer uso de un único espacio";

    return regex.test(user_lastname) ? true : message;
}

function validateEmail(user_email) {
    let regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

    const message = "El correo electrónico similar a: xxxxx@xxx.xxx";

    return regex.test(user_email) ? true : message;
}

function validateTel(user_tel) {
    let regex = /^\d{8,11}$/;

    const message = "El telefono deberá contener entre 8 y 11 dígitos";

    return regex.test(user_tel) ? true : message;
}

function validateLoginName(user_login_name) {
    let regex = /^[a-zA-Z0-9]{6,10}$/;
    
    const message = "El nombre de usuario deberá contener entre 6 y 10 caracteres alfanuméricos";

    return regex.test(user_login_name) ? true : message;
}

function validatePassword(user_password) {
    let regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[.,_\-])[a-zA-Z\d.,_\-]{6,10}$/

    const message = "La contraseña deberá contener entre 6 y 10 caracteres e incluir de forma obligatoria una letra mayúscula, un número y un símbolo entre los siguientes (.,_-)";

    return regex.test(user_password) ? true : message;
}

// Función ON BLUR 
function validateOnBlur(inputElement, validator) {
    if (!inputElement) return;

    inputElement.addEventListener('blur', function () {
        const value = inputElement.value.trim();
        const result = validator(value);
        const smallElement = inputElement.nextElementSibling;

        if (result !== true) {
            smallElement.textContent = result;
            smallElement.classList.add("error-visible");
            inputElement.classList.add("input-error");
        } else {
            smallElement.textContent = "";
            smallElement.classList.remove("error-visible");
            inputElement.classList.remove("input-error");
        }
    });
}

validateOnBlur(userName, validateName);
validateOnBlur(userLastName, validateLastName);
validateOnBlur(userEmail, validateEmail);
validateOnBlur(userTel, validateTel);
validateOnBlur(userLoginName, validateLoginName);
validateOnBlur(userPassword, validatePassword);

if (admin_register_form) {

    admin_register_form.addEventListener('submit', function (e) {

        const isNameValid = validateName(userName.value.trim());
        const isLastNameValid = validateLastName(userLastName.value.trim());
        const isEmailValid = validateEmail(userEmail.value.trim());
        const isTelValid = validateTel(userTel.value.trim());
        const isLoginNameValid = validateLoginName(userLoginName.value.trim());
        const isPasswordValid = validatePassword(userPassword.value.trim());

        if (
            isNameValid !== true ||
            isLastNameValid !== true ||
            isEmailValid !== true ||
            isTelValid !== true ||
            isLoginNameValid !== true ||
            isPasswordValid !== true
        ) {
            alert("Por favor, complete los campos que son obligatorios")
            e.preventDefault();
        };

    })
};

/***** RESETEAR FORMULARIO Y ESTILOS DE ERROR *****/
document.addEventListener("DOMContentLoaded", function () {

    const forms = document.querySelectorAll("form");

    forms.forEach(form => {

        form.addEventListener("reset", function () {

            // Esperamos un micro-tick para que el reset limpie valores primero
            setTimeout(() => {

                const inputs = form.querySelectorAll(".input-error");
                const smalls = form.querySelectorAll(".error-visible");

                inputs.forEach(input => {
                    input.classList.remove("input-error");
                });

                smalls.forEach(small => {
                    small.classList.remove("error-visible");
                    small.textContent = "";
                });

            }, 0);

        });

    });

});



/*************** VALIDACION DE FORMULARIO "MODIFICAR USUARIO"*************/

document.addEventListener("DOMContentLoaded", () => {
    
    // Funciones de validación
    function validateName(user_name) {
        const regex = /^(?=.{2,20}$)[A-Za-zÁÉÍÓÚáéíóúÑñ]+( [A-Za-zÁÉÍÓÚáéíóúÑñ]+){0,2}$/u;
        return regex.test(user_name);
    }

    function validateLastName(user_lastname) {
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]{2,20}(?: [A-Za-zÁÉÍÓÚáéíóúÑñ]{2,20})?$/u;
        return regex.test(user_lastname);
    }

    function validateEmail(user_email) {
        let regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        return regex.test(user_email);
    }

    function validateTel(user_tel) {
        let regex = /^\d{8,11}$/;
        return regex.test(user_tel);
    }

    // Función de validación cuando se hace submit
    const formModifyUsers = document.querySelectorAll('.usuario_edit_form');
    
    formModifyUsers.forEach((form) => {
        form.addEventListener('submit', function (e) {
            const userName = form.querySelector('input[name="nombre"]');
            const userLastName = form.querySelector('input[name="apellido"]');
            const userEmail = form.querySelector('input[name="email"]');
            const userTel = form.querySelector('input[name="telefono"]');
            
            let errorMessages = [];
            let isValid = true;

            // Validación para cada campo
            if (!validateName(userName.value)) {
                errorMessages.push("- Nombre no válido (debe tener entre 2 y 20 caracteres y máximo 2 espacios no consecutivos).");
                isValid = false;
            }

            if (!validateLastName(userLastName.value)) {
                errorMessages.push("- Apellido no válido (debe tener entre 2 y 20 caracteres y hasta 1 espacio permitido).");
                isValid = false;
            }

            if (!validateEmail(userEmail.value)) {
                errorMessages.push("- Correo electrónico no válido.");
                isValid = false;
            }

            if (!validateTel(userTel.value)) {
                errorMessages.push("- Número de teléfono no válido (debe tener entre 8 y 11 caracteres).");
                isValid = false;
            }

            // Si hay errores, mostrar alert con los mensajes
            if (!isValid) {
                alert("Por favor, corrige los siguientes errores:\n" + errorMessages.join("\n"));
                e.preventDefault(); // Prevenir el submit si hay errores
            }
        });
    });

    // Desplegar el formulario de edición cuando se hace clic en "Modificar"
    document.addEventListener("click", (e) => {
        // ====== MODIFICAR ======
        if (e.target.classList.contains("btn_modificar")) {

            const filaPrincipal = e.target.closest("tr");
            if (!filaPrincipal) return;

            const filaEdit = filaPrincipal.nextElementSibling;
            if (!filaEdit || !filaEdit.classList.contains("fila_edit")) return;

            // Cerrar las demás abiertas
            document.querySelectorAll("tr.fila_edit").forEach((fila) => {
                if (fila !== filaEdit) fila.classList.add("hidden");
            });

            // Abrir/cerrar la actual
            filaEdit.classList.toggle("hidden");
        }

        // ====== CANCELAR ======
        if (e.target.classList.contains("btn_cancel")) {
            const filaEdit = e.target.closest("tr.fila_edit");
            if (filaEdit) filaEdit.classList.add("hidden");
        }
    });

});


/*************** VALIDACION DE FORMULARIO "BORRAR USUARIO"*************/
document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('#form_borrar_usuario').forEach(form => {

        form.addEventListener('submit', function (e) {

            const confirmar = confirm('¿Seguro que deseas borrar este usuario?');

            if (!confirmar) {
                e.preventDefault();
            }

            // si confirma → NO hacemos nada
            // el submit sigue su curso normal
        });

    });

});