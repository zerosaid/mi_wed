const firebaseConfig = {
    apiKey: "AIzaSyCl4P4r8zkejQBqL8EArNBG893bAWJOSaM",
    authDomain: "myagenda-696c2.firebaseapp.com",
    databaseURL: "https://myagenda-696c2-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "myagenda-696c2",
    storageBucket: "myagenda-696c2.firebasestorage.app",
    messagingSenderId: "141315552777",
    appId: "1:141315552777:web:d90ed0a8213224ecd4ead8",
    measurementId: "G-1F5YLNE43Q"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const loginDiv = document.getElementById("login");
const agendaDiv = document.getElementById("agenda");
const mensaje = document.getElementById("mensaje");
const bienvenida = document.getElementById("bienvenida");
const listaTareas = document.getElementById("listaTareas");

let usuarioActivo = null;

// 🧍 Registrar usuario
function registrar() {
    const user = document.getElementById("usuario").value.trim();
    const pass = document.getElementById("password").value.trim();

    if (!user || !pass) {
        mensaje.textContent = "Completa todos los campos.";
        return;
    }

    db.ref("usuarios/" + user).set({
        password: pass,
        tareas: {}
    }).then(() => {
        mensaje.style.color = "lightgreen";
        mensaje.textContent = "Usuario registrado con éxito ✅";
    }).catch((error) => {
        mensaje.style.color = "red";
        mensaje.textContent = "Error al registrar: " + error;
    });
}

// 🔓 Iniciar sesión
function iniciar() {
    const user = document.getElementById("usuario").value.trim();
    const pass = document.getElementById("password").value.trim();

    db.ref("usuarios/" + user).get().then((snapshot) => {
        if (snapshot.exists() && snapshot.val().password === pass) {
            usuarioActivo = user;
            mostrarAgenda();
            cargarTareas();
        } else {
            mensaje.style.color = "red";
            mensaje.textContent = "Usuario o contraseña incorrectos.";
        }
    });
}

// 📘 Mostrar agenda
function mostrarAgenda() {
    loginDiv.classList.add("hidden");
    agendaDiv.classList.remove("hidden");
    bienvenida.textContent = `Bienvenido, ${usuarioActivo}`;
    mensaje.textContent = "";
}

// ➕ Agregar tarea
function agregarTarea() {
    const texto = document.getElementById("tarea").value.trim();
    const fecha = document.getElementById("fecha").value;

    if (!texto || !fecha) return;

    const nuevaTarea = {
        texto,
        fecha,
        completada: false
    };

    db.ref(`usuarios/${usuarioActivo}/tareas`).push(nuevaTarea);
    document.getElementById("tarea").value = "";
    document.getElementById("fecha").value = "";
    cargarTareas();
}

// 🔄 Cargar tareas
function cargarTareas() {
    listaTareas.innerHTML = "";
    db.ref(`usuarios/${usuarioActivo}/tareas`).on("value", (snapshot) => {
        listaTareas.innerHTML = "";
        snapshot.forEach((child) => {
            const t = child.val();
            const div = document.createElement("div");
            div.classList.add("tarea");
            if (t.completada) div.classList.add("hecha");

            div.innerHTML = `
        <label>
          <input type="checkbox" ${t.completada ? "checked" : ""} onchange="marcarTarea('${child.key}', this.checked)">
          <span>${t.texto} - <b>${t.fecha}</b></span>
        </label>
        <button onclick="eliminarTarea('${child.key}')">❌</button>
      `;

            listaTareas.appendChild(div);
        });
    });
}

// ✅ Marcar o desmarcar tarea
function marcarTarea(id, estado) {
    db.ref(`usuarios/${usuarioActivo}/tareas/${id}`).update({
        completada: estado
    });
}

// ❌ Eliminar tarea
function eliminarTarea(id) {
    db.ref(`usuarios/${usuarioActivo}/tareas/${id}`).remove();
}

// 🚪 Cerrar sesión
function cerrarSesion() {
    usuarioActivo = null;
    loginDiv.classList.remove("hidden");
    agendaDiv.classList.add("hidden");
    document.getElementById("usuario").value = "";
    document.getElementById("password").value = "";
}

// 👁️ Mostrar / Ocultar contraseña
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    // Cambiar el icono dinámicamente
    togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
});
