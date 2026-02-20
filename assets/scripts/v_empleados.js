
/*************** VALIDACION DE FORMULARIO "REGISTRAR EMPLEADO NUEVO" **********/

// Seleccionamos las variables y los inputs del formulario
const empleados_register_form = document.querySelector('#empleados_register_form');
const empleado_edit_form = document.querySelector('.empleado_edit_form');
const userName = document.querySelector("#user_name");
const userLastName = document.querySelector("#user_lastname");
const userDni = document.querySelector("#user_dni");
const userCuit = document.querySelector("#user_cuit");
const userDate = document.querySelector('#user_date');
const userTel = document.querySelector('#user_tel');
const userEmail = document.querySelector('#user_email');
const userAdress = document.querySelector('#user_adress');
const userContact = document.querySelector('#user_contact');


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

function validateDni(user_dni) {
    let regex = /^\d{8}$/;

    const message = "El DNI debe contener 8 dígitos";

    return regex.test(user_dni) ? true : message;
}

function validateCuit(user_cuit) {
    let regex = /^\d{11}$/;

    const message = "El CUIT debe contener 11 dígitos";

    return regex.test(user_cuit) ? true : message;
}

function validateBirthDate(user_date) {

    if (!user_date) {
        return "La fecha de nacimiento es obligatoria";
    }

    const birthDate = new Date(user_date);
    const today = new Date();

    if (isNaN(birthDate.getTime())) {
        return "La fecha introducida no es válida";
    }

    if (birthDate > today) {
        return "La fecha no puede ser futura";
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    if (age < 18) {
        return "Debes ser mayor de edad";
    }

    return true;
}


function validateTel(user_tel) {
    let regex = /^\d{8,11}$/;

    const message = "El telefono deberá contener entre 8 y 11 dígitos";

    return regex.test(user_tel) ? true : message;
}

// (Validamos los campos NO OBLIGATORIOS en caso de tener contenido y si estan vacíos, devolvemos TRUE)
function validateAdress(user_adress) {

    const value = user_adress.trim();
    const regex = /^(?=.{8,50}$)[A-Za-z0-9º\-,]+( [A-Za-z0-9º\-,]+){0,5}$/u;

    const message = "El campo dirección puede quedar vacío o deberá contener entre 8 y 50 caracteres válidos";

    // Puede estar vacío el campo también:
    if (value === '') {
        return true; // campo opcional
    }

    return regex.test(value) ? true : message;
}

function validateEmail(user_email) {

    const value = user_email.trim();

    let regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

    const message = "El campo email puede quedar vacío o el contenido debe ser similar a: xxxxx@xxx.xxx";

    // Puede estar vacío el campo también:
    if (value === '') {
        return true; // campo opcional
    }

    return regex.test(value) ? true : message;
}

function validateContact(user_contact) {
    
    const value = user_contact.trim();
    let regex = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ0-9 _\-\.,º]{10,250}$/;

    const message = "El campo Contacto de emergencia puede quedar vacío o debe escribir entre 10 y 250 caracteres. Sólo se aceptan los siguientes símbolos especiales: . , _ - º ";

    // Puede estar vacío el campo también:
    if (value === '') {
        return true; // campo opcional
    }

    // Si tiene contenido → validar
    return regex.test(value) ? true : message;

}


// Función ON BLUR de todos los elementos MENOS el de fecha de nacimiento (TIPO DATE -> validación especial)
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

// Función ON BLUR SOLO para el input DATE
function validateDateOnBlur(inputElement) {
    if (!inputElement) return;

    inputElement.addEventListener('blur', function () {

        const result = validateBirthDate(inputElement.value);
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
validateOnBlur(userDni, validateDni);
validateOnBlur(userCuit, validateCuit);
validateDateOnBlur(userDate); // SOLO DATE
validateOnBlur(userTel, validateTel);
validateOnBlur(userAdress, validateAdress);
validateOnBlur(userEmail, validateEmail);
validateOnBlur(userContact, validateContact);


// CHEQUEO de formulario de REGISTRO NUEVO de empleado antes de enviarse (con prevent default())
if (empleados_register_form) {

    empleados_register_form.addEventListener('submit', function (e) {

        const isNameValid = validateName(userName.value.trim());
        const isLastNameValid = validateLastName(userLastName.value.trim());
        const isDniValid = validateDni(userDni.value.trim());
        const isCuitValid = validateCuit(userCuit.value.trim());
        const isDateValid = validateBirthDate(userDate.value);
        const isTelValid = validateTel(userTel.value.trim());
        const isEmailValid = validateEmail(userEmail.value.trim());
        const isAdressValid = validateAdress(userAdress.value.trim());
        const isContactValid = validateContact(userContact.value.trim());

        if (
            isNameValid !== true  ||
            isLastNameValid !== true  ||
            isDniValid !== true  ||
            isCuitValid !== true  ||
            isDateValid !== true ||
            isTelValid !== true  ||
            isAdressValid !== true  ||
            isEmailValid !== true  ||
            isContactValid !== true 
        ) {
            alert("Por favor, complete los campos que son obligatorios")
            e.preventDefault();
        };

    })
};


/*************** VALIDACION DE FORMULARIO "MODIFICAR EMPLEADO" *************/

document.addEventListener("DOMContentLoaded", () => {

    // Validación cuando se haga submit
    const forms = document.querySelectorAll('.empleado_edit_form');
    
    forms.forEach((form) => {
        form.addEventListener('submit', function (e) {
            const nombre = form.querySelector('input[name="user_name"]');
            const apellido = form.querySelector('input[name="user_lastname"]');
            const dni = form.querySelector('input[name="user_dni"]');
            const cuit = form.querySelector('input[name="user_cuit"]');
            const fecha = form.querySelector('input[name="user_date"]');
            const telefono = form.querySelector('input[name="user_tel"]');
            const direccion = form.querySelector('input[name="user_adress"]');
            const email = form.querySelector('input[name="user_email"]');
            const contacto = form.querySelector('input[name="user_contact"]');

            let errores = [];

            if (!validateName(nombre.value)) errores.push("Nombre inválido");
            if (!validateLastName(apellido.value)) errores.push("Apellido inválido");
            if (!validateDni(dni.value)) errores.push("DNI inválido");
            if (!validateCuit(cuit.value)) errores.push("CUIT inválido");

            const fechaResult = validateBirthDate(fecha.value);
            if (!fechaResult.ok) errores.push(fechaResult.error);

            if (!validateTel(telefono.value)) errores.push("Teléfono inválido");
            if (!validateAdress(direccion.value)) errores.push("Dirección inválida");
            if (!validateEmail(email.value)) errores.push("Email inválido");
            if (!validateContact(contacto.value)) errores.push("Contacto de emergencia inválido");

            // Si hay errores, preventDefault y mostrar los errores
            if (errores.length > 0) {
                e.preventDefault(); // Prevenir el envío del formulario
                alert("Errores encontrados:\n\n• " + errores.join("\n• "));
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

/*************** VALIDACION DE FORMULARIO "BORRAR EMPLEADO"*************/
document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('.btn_borrar').forEach(btn => {

        btn.addEventListener('click', function (e) {

            const confirmar = confirm('¿Seguro que deseas borrar este empleado?');

            if (!confirmar) {
                e.preventDefault();
            }
        });
    });

});
