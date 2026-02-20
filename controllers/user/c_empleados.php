<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../db_conn.php';
require_once __DIR__ . '/../db_functions.php';
require_once __DIR__ . '/../validations/v_inputData.php';
require_once __DIR__ . '/../flash.php';

# Comprobamos si existe una sesión activa y en caso de que no sea así la creamos.
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

# Comprobamos si existe una variable de SESSION y que sea ADMIN, y sino, redirigimos a index.php
if (!isset($_SESSION['user_data']) || ($_SESSION['user_data']['id_user'] != 1)) {
    header("Location: ../../index.php");
    exit;
}

/* =========================
   POST: RESET FORMULARIO
   ========================= */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['reset_form'])) {
    unset($_SESSION['datos']);

    // redirigir a la MISMA página
    header("Location: ../../views/user/empleados.php");
    exit;
}


try {

    /* =========================
    POST: REGISTRAR EMPLEADO
    ========================= */

    # Comprobamos si la información llega a través del método POST y del formulario con submit "registrarse"
    if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['registro_empleado'])) {

        /* ---------- SANITIZACIÓN ---------- */
        # En primer lugar obtenemos los datos del formulario saneados
        $nombre = htmlspecialchars($_POST['user_name']);
        $apellido = htmlspecialchars($_POST['user_lastname']);
        $dni = filter_input(INPUT_POST, 'user_dni', FILTER_SANITIZE_NUMBER_INT);
        $cuit = filter_input(INPUT_POST, 'user_cuit', FILTER_SANITIZE_NUMBER_INT);
        $telefono = filter_input(INPUT_POST, 'user_tel', FILTER_SANITIZE_NUMBER_INT);
        $direccion = htmlspecialchars($_POST['user_adress']);
        $email = filter_input(INPUT_POST, 'user_email', FILTER_SANITIZE_EMAIL);
        $contacto = trim($_POST['user_contact'] ?? '');

        # Validamos "fecha de nacimiento" (tipo input date)
        $validacion_fecha = validar_fecha_nacimiento($_POST['user_date'] ?? null);
            /*  Si ESTA OK la fecha, nos devuelve un array con la CLAVE "ok" en TRUE, y sino en FALSE.    
                -> Si está en TRUE, recogemos la fecha convertida en string (compatible con BD) con la clave $validacion_fecha[fecha]
                -> Si está con FALSE, recogemos el ERROR con $validacion_fecha[error];
            */

        /* ---------- VALIDACIONES ---------- */
        $errores_validacion_oblig = validar_registro_empleado_oblig($nombre, $apellido, $dni, $cuit, $telefono);

        $errores_validacion_opc = validar_registro_empleado_opc($direccion, $email, $contacto);


        # Comprobar si se han generado errores de validacion o no
        if (!empty($errores_validacion_oblig) || !empty($errores_validacion_opc) || !$validacion_fecha['ok']) {
            # Si hay errores de validación vamos a guardarlos en una cadena para mostrarselos al usuario
            $mensaje_error = "";

            # Recorremos el array de errores_validación para concatenar los mensajes en la variable $mensaje_error
            foreach ($errores_validacion_oblig as $clave => $mensaje) {
                $mensaje_error .= $mensaje . "<br>";
            }

            foreach ($errores_validacion_opc as $clave => $mensaje) {
                $mensaje_error .= $mensaje . "<br>";
            }

            # Si el array fecha_nacimiento tiene la clave "ok" como "false", concatenamos también a la variable $mensaje_error, el valor de su clave "error" que tiene que tener dentro
            if (!$validacion_fecha['ok']) {
                $mensaje_error .= $validacion_fecha['error'];
            }

            # Asignamos la cadena de errores a $_SESSION['mensaje_error']
            $_SESSION['mensaje_error'] = $mensaje_error;

            setFlash('old', $_POST); // guardamos todos los inputs

            header("Location: ../../views/user/empleados.php");
            exit();
        }

        # Intentamos realizar un registro sencillo en "empleados"
        try {
            # Declaramos la variable que registrará si se ha producido una excepción durante el proceso que
            # comprueba si el DNI y CUIT que se está intentando registrar YA existe en la base de datos.
            $errores = [];

            # SI el resultado de check_email es TRUE (ya existe el email)
            if (check_dni($dni, $mysqli_connection)) {
                # Esablecemos un mensaje de error
                $errores['dni'] = "- Ya existe un usuario registrado con ese DNI";
            }

            # SI el resultado de check_cuit es TRUE (ya existe el CUIT)
            if (check_cuit($cuit, $mysqli_connection)) {
                # Esablecemos un mensaje de error
                $errores['cuit'] = "- Ya existe un usuario registrado con ese CUIT";
            }

            if (!empty($errores)) {

                $_SESSION['mensaje_error'] = "";

                # Recorremos el array $errores e ingresamos su contenido al mensaje de sesión que mostraremos en pantalla
                foreach ($errores as $clave => $error) {
                    $_SESSION['mensaje_error'] .= $error . '<br>';
                }

                setFlash('old', $_POST); // guardamos todos los inputs

                # Redirigimos al usuario a la página de registro
                header("Location: ../../views/user/empleados.php");
                exit();
            }

            registrar_empleado($mysqli_connection, [
                'nombre'           => $nombre,
                'apellido'         => $apellido,
                'dni'              => $dni,
                'cuit'             => $cuit,
                'fecha_nacimiento' => $validacion_fecha['fecha'],
                'telefono'         => $telefono,
                'direccion'        => $direccion,
                'email'            => $email,
                'contacto'         => $contacto
            ]);

            $_SESSION['mensaje_exito'] = "ÉXITO: El empleado se ha registrado correctamente";
            header("Location: ../../views/user/empleados.php");
            exit();
        } catch (Exception $e) {
            $_SESSION['mensaje_error'] = "Error interno al registrar al empleado.";

            header("Location: ../../views/errors/error500.html");
            exit();
        }
    }


    /* =========================
      POST: MODIFICAR EMPLEADO
    ========================= */
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['modificar_empleado'])) {

        try {
            /* ===============================
                VALIDACIÓN BÁSICA
            =============================== */

            $id_empleado = (int) $_POST['id_empleado'];

            /* ---------- SANITIZACIÓN ---------- */
            $nombre    = htmlspecialchars($_POST['user_name']);
            $apellido  = htmlspecialchars($_POST['user_lastname']);
            $dni       = filter_input(INPUT_POST, 'user_dni', FILTER_SANITIZE_NUMBER_INT);
            $cuit      = filter_input(INPUT_POST, 'user_cuit', FILTER_SANITIZE_NUMBER_INT);
            $telefono  = filter_input(INPUT_POST, 'user_tel', FILTER_SANITIZE_NUMBER_INT);
            $direccion = htmlspecialchars($_POST['user_adress']);
            $email     = filter_input(INPUT_POST, 'user_email', FILTER_SANITIZE_EMAIL);
            $contacto  = trim($_POST['user_contact'] ?? '');

            /* ---------- FECHA ---------- */
            $validacion_fecha = validar_fecha_nacimiento($_POST['user_date'] ?? null);

            /* ---------- VALIDACIONES ---------- */
            $errores_oblig = validar_registro_empleado_oblig(
                $nombre,
                $apellido,
                $dni,
                $cuit,
                $telefono
            );

            $errores_opc = validar_registro_empleado_opc(
                $direccion,
                $email,
                $contacto
            );

            if (!empty($errores_oblig) || !empty($errores_opc) || !$validacion_fecha['ok']) {

                $mensaje_error = '';

                foreach ($errores_oblig as $m) {
                    $mensaje_error .= $m . '<br>';
                }

                foreach ($errores_opc as $m) {
                    $mensaje_error .= $m . '<br>';
                }

                if (!$validacion_fecha['ok']) {
                    $mensaje_error .= $validacion_fecha['error'];
                }

                $_SESSION['mensaje_error'] = $mensaje_error;
                setFlash('old', $_POST); // guardamos todos los inputs

                header("Location: ../../views/user/empleados.php");
                exit;
            }

            /* ---------- CHECK DNI / CUIT ---------- */
            $errores = [];

            if (check_dni($dni, $mysqli_connection)) {
                $errores[] = "- Ya existe un usuario registrado con ese DNI";
            }

            if (check_cuit($cuit, $mysqli_connection)) {
                $errores[] = "- Ya existe un usuario registrado con ese CUIT";
            }

            if (!empty($errores)) {
                $_SESSION['mensaje_error'] = implode('<br>', $errores);
                setFlash('old', $_POST); // guardamos todos los inputs
                
                header("Location: ../../views/user/empleados.php");
                exit;
            }

            /* ---------- UPDATE ---------- */
            actualizar_empleado($mysqli_connection, [
                'id_empleado'      => $id_empleado,
                'nombre'           => $nombre,
                'apellido'         => $apellido,
                'dni'              => $dni,
                'cuit'             => $cuit,
                'fecha_nacimiento' => $validacion_fecha['fecha'],
                'telefono'         => $telefono,
                'direccion'        => $direccion,
                'email'            => $email,
                'contacto'         => $contacto
            ]);

            $_SESSION['mensaje_exito'] = "El usuario se ha modificado correctamente";
            header("Location: ../../views/user/empleados.php");
            exit;
        } catch (Exception $e) {

            error_log("Error modificar empleado: " . $e->getMessage());
            header('Location: ../../views/errors/error500.html');
            exit;
        } finally {

            if (isset($mysqli_connection) && $mysqli_connection) {
                $mysqli_connection->close();
            }
        }
    }


    /************************* VALIDACION FORMULARIO "BORRAR USUARIO"*************************** */

    if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['borrar_empleado'])) {

        $id_empleado = (int)($_POST['id_empleado'] ?? 0);

        if (borrar_empleado($id_empleado, $mysqli_connection)) {
            $_SESSION['mensaje_exito'] = "El empleado se ha borrado correctamente";

            header("Location: ../../views/user/empleados.php?delete=ok");
            exit();
        } else {
            # Se redirige al empleadoa página de error 500
            header('Location: ../../views/errors/error500.html');
            exit();
        }
    }
} catch (Exception $e) {
    error_log("Error usuarios controller: " . $e->getMessage());
    header("Location: ../../views/errors/error500.html");
    exit();
    
} finally {
    if (isset($mysqli_connection) && $mysqli_connection) {
        $mysqli_connection->close();
    }
}
