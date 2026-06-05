// seccion 1 — hangar de naves

// cargar datos de pilotos desde localstorage o crear array vacío si no existe
let pilotos = JSON.parse(localStorage.getItem("pilotos")) || [];

// cargar datos de misiones desde localstorage o crear array vacío si no existe
let misiones = JSON.parse(localStorage.getItem("misiones")) || [];

// índice usado para saber si estamos editando un piloto o creando uno nuevo
let editIndex = null;

// estados posibles de las misiones para el kanban
let estados = ["todo", "in_progress", "done"];

// array de naves fijo (datos iniciales del hangar)
let naves = [
    {
        imagen: null,
        nombre: "X-Wing",
        tipo: "caza",
        velocidad: 1050,
        tripulacion: 1,
        estado: "operativa"
    },
    {
        imagen: null,
        nombre: "Millennium Falcon",
        tipo: "transporte",
        velocidad: 1200,
        tripulacion: 4,
        estado: "operativa"
    },
    {
        imagen: null,
        nombre: "Y-Wing",
        tipo: "caza",
        velocidad: 800,
        tripulacion: 1,
        estado: "operativa"
    }
];

// ejecutar todo cuando el dom está cargado
document.addEventListener("DOMContentLoaded", () => {

//funciones para hacer el tema de los botones del nav
    const secciones = {
    navButton1: "Seccion1",
    navButton2: "Seccion2",
    navButton3: "Seccion3",
    navButton4: "Seccion4"
};

function mostrarSeccion(idVisible){
    Object.values(secciones).forEach(id => {
        const seccion = document.getElementById(id);

        if (id === idVisible) {
            seccion.classList.remove("invisible");
        } else {
            seccion.classList.add("invisible");
        }
    });
}

Object.entries(secciones).forEach(([botonId, seccionId]) => {
    document.getElementById(botonId).addEventListener("click", () => {
        mostrarSeccion(seccionId);
    });
});

// cargar todas las funciones iniciales al abrir la pagina
    cargarNaves();
    mostrarPilotos();
    cargarPilotos();
    cargarSelectNaves();
    cargarDificultades();
    pintarKanban();
    actualizarDashboard();

    // evento para añadir una misión
    document.getElementById("btnAñadirMision")
        .addEventListener("click", añadirMision);

    // evento para guardar o editar piloto
    document.getElementById("formPiloto")
        .addEventListener("submit", guardarPiloto);

    // evento para filtrar misiones por dificultad
    document.getElementById("filtroDificultad")
        .addEventListener("change", filtrarMisiones);

    // evento buscador naves
    document.getElementById("buscador")
        .addEventListener("input", filtrarPorNombre);

    // evento ordenar naves
    document.getElementById("ordenar")
        .addEventListener("click", ordenarNaves);
});


// seccion 1 — cargar naves en el hangar
function cargarNaves() {

    const hangar = document.getElementById("contenedorNaves");

    hangar.innerHTML = "";

    naves.forEach(nave => {

        const card = document.createElement("div");
        card.classList.add("card");

        card.dataset.tipo = nave.tipo;

        card.innerHTML = `
        <h3>${nave.nombre}</h3>
        <p>Tipo: ${nave.tipo}</p>
        <p>Velocidad: ${nave.velocidad}</p>
        <p>Tripulación: ${nave.tripulacion}</p>
        <p>Estado: ${nave.estado}</p>
        `;

        hangar.appendChild(card);
    });

    actualizarContador();
    cargarFiltroTipos();
}


// seccion 1 — filtro de tipos de naves
function cargarFiltroTipos() {

    const select = document.getElementById("filtroTipo");
    select.innerHTML = `<option value="Todos">Todos</option>`;

    const tiposUnicos = [...new Set(naves.map(n => n.tipo))];

    tiposUnicos.forEach(tipo => {
        const option = document.createElement("option");
        option.value = tipo;
        option.textContent = tipo;
        select.appendChild(option);
    });

    select.addEventListener("change", () => aplicarFiltros());
}


// filtro por nombre (buscador)
function filtrarPorNombre() {
    aplicarFiltros();
}


// ordenar naves por velocidad
let ordenAsc = true;
function ordenarNaves() {

    if (ordenAsc) {
        naves.sort((a, b) => a.velocidad - b.velocidad);
    } else {
        naves.sort((a, b) => b.velocidad - a.velocidad);
    }

    ordenAsc = !ordenAsc;

    cargarNaves();
}


// aplicar filtros combinados (tipo + buscador)
function aplicarFiltros() {

    const texto = document.getElementById("buscador").value.toLowerCase();
    const tipo = document.getElementById("filtroTipo").value;

    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {

        const nombre = card.querySelector("h3").textContent.toLowerCase();

        const coincideNombre = nombre.includes(texto);
        const coincideTipo = tipo === "Todos" || card.dataset.tipo === tipo;

        if (coincideNombre && coincideTipo) {
            card.classList.remove("invisible");
        } else {
            card.classList.add("invisible");
        }
    });

    actualizarContador();
}


// contador de naves visibles
function actualizarContador() {

    const cards = document.querySelectorAll(".card");
    const visibles = [...cards].filter(c => !c.classList.contains("invisible")).length;

    document.getElementById("contador").textContent =
        `Mostrando ${visibles} naves`;
}


// seccion 2 — guardar piloto (crear o editar)
function guardarPiloto(e) {

    e.preventDefault(); //evita el comportamiento por defecto del formulario (recargar la página)

    const piloto = {
        nombre: document.getElementById("nombre").value,
        rango: document.getElementById("rango").value,
        nave: document.getElementById("nave").value,
        victorias: parseInt(document.getElementById("victorias").value),
        estado: document.getElementById("estado").value
    };

    if (!piloto.nombre || !piloto.rango || !piloto.nave || !piloto.estado || piloto.victorias < 0) {
        alert("datos inválidos");
        return;
    }

    if (editIndex === null) {
        //si no estamos editando (editIndex es null), añadimos un piloto nuevo al array
        pilotos.push(piloto);
    } else {
        //si estamos editando, reemplazamos el piloto en la posición indicada
        pilotos[editIndex] = piloto;
        //reiniciamos editIndex para salir del modo edición
        editIndex = null;
    }

    guardarDatos();
    mostrarPilotos();
    cargarPilotos();
    actualizarDashboard();
}


// seccion 2 — mostrar pilotos
function mostrarPilotos() {

    const lista = document.getElementById("listaPilotos");
    lista.innerHTML = "";

    pilotos.forEach((p, i) => {

        const fila = document.createElement("tr");

        fila.innerHTML = `
        <td>${p.nombre}</td>
        <td>${p.rango}</td>
        <td>${p.nave}</td>
        <td>${p.victorias}</td>
        <td>${p.estado}</td>
        <td>
            <button onclick="editarPiloto(${i})">Editar</button>
            <button onclick="eliminarPiloto(${i})">Eliminar</button>
        </td>
        `;

        lista.appendChild(fila);
    });
}

// seccion 2 — cargar naves en select del formulario de pilotos
function cargarSelectNaves() {

    const select = document.getElementById("nave");

    select.innerHTML = `<option value="">Selecciona nave</option>`;

    naves.forEach(n => {

        const option = document.createElement("option");

        option.value = n.nombre;
        option.textContent = n.nombre;

        select.appendChild(option);
    });
}

// seccion 2 — editar piloto
function editarPiloto(i) {

    const p = pilotos[i];

    document.getElementById("nombre").value = p.nombre;
    document.getElementById("rango").value = p.rango;
    document.getElementById("nave").value = p.nave;
    document.getElementById("victorias").value = p.victorias;
    document.getElementById("estado").value = p.estado;

    editIndex = i;
}


// seccion 2 — eliminar piloto
function eliminarPiloto(i) {

    if (!confirm("¿Seguro?")) return;

    pilotos.splice(i, 1);

    guardarDatos();
    mostrarPilotos();
    cargarPilotos();
    actualizarDashboard();
}


// seccion 2 — guardar pilotos en localstorage
function guardarDatos() {
    localStorage.setItem("pilotos", JSON.stringify(pilotos));
    //para guardar el array de pilotos en el localStorage del navegador convirtiéndolo a texto (JSON)
}


// seccion 2 — cargar pilotos en select de misiones
function cargarPilotos() {

    const select = document.getElementById("selectPiloto");

    //reinicia el select para evitar duplicar opciones cada vez que se carga
    select.innerHTML = `<option value="default">Selecciona piloto</option>`;

    pilotos.forEach(p => {

        const option = document.createElement("option");

        option.value = p.nombre;
        option.textContent = p.nombre;

        select.appendChild(option);
    });
}


// seccion 3 — añadir misión
function añadirMision() {

    const mision = {
        id: Date.now(),
        nombre: document.getElementById("nombreMision").value,
        descripcion: document.getElementById("descripcionMision").value,
        piloto: document.getElementById("selectPiloto").value,
        dificultad: document.getElementById("selectDificultad").value,
        estado: "todo"
    };

    if (!mision.nombre || mision.dificultad === "default") return;

    misiones.push(mision);

    guardarMisiones();
    pintarKanban();
    actualizarDashboard();
}

// cargar dificultad en selects del kanban
function cargarDificultades() {

    const dificultad = ["facil", "media", "dificil", "suicida"];

    const select = document.getElementById("selectDificultad");
    const filtro = document.getElementById("filtroDificultad");

    select.innerHTML = `<option value="default">Selecciona dificultad</option>`;
    filtro.innerHTML = `<option value="default">Filtrar dificultad</option>`;

    dificultad.forEach(d => {

        const op1 = document.createElement("option");
        op1.value = d;
        op1.textContent = d;

        const op2 = op1.cloneNode(true);

        select.appendChild(op1);
        filtro.appendChild(op2);
    });
}


// seccion 3 — pintar kanban
function pintarKanban(lista = misiones) {

    document.querySelectorAll(".columna").forEach(c => c.innerHTML = "");

    lista.forEach(m => {

        const card = document.createElement("div");
        card.classList.add("card");

        card.innerHTML = `
        <h4>${m.nombre}</h4>
        <p>${m.descripcion}</p>
        <p>${m.piloto}</p>
        <p>${m.dificultad}</p>

        <button onclick="moverMision(${m.id}, -1)">⬅</button>
        <button onclick="moverMision(${m.id}, 1)">➡</button>
        <button onclick="eliminarMision(${m.id})">X</button>
        `;

        const col = document.querySelector(`[data-estado="${m.estado}"]`);
        if (col) col.appendChild(card);
    });
}


// seccion 3 — guardar misiones
function guardarMisiones() {
    localStorage.setItem("misiones", JSON.stringify(misiones));
}


// seccion 3 — mover misión
function moverMision(id, dir) {

    const m = misiones.find(x => x.id === id);
    if (!m) return;

    let i = estados.indexOf(m.estado);
    i += dir;

    if (i >= 0 && i < estados.length) {
        m.estado = estados[i];
    }

    guardarMisiones();
    pintarKanban();
    actualizarDashboard();
}


// seccion 3 — eliminar misión
function eliminarMision(id) {

    misiones = misiones.filter(m => m.id !== id);

    guardarMisiones();
    pintarKanban();
    actualizarDashboard();
}


// seccion 3 — filtrar misiones
function filtrarMisiones(e) {

    const valor = e.target.value;

    if (valor === "default") {
        pintarKanban();
    } else {
        pintarKanban(misiones.filter(m => m.dificultad === valor));
    }
}


// seccion 4 — dashboard
function actualizarDashboard() {

    // naves
    const totalNaves = naves.length;

    //filter() crea un nuevo array con las naves que cumplen la condición
    const operativas = naves.filter(n => n.estado === "operativa").length;
    const reparacion = naves.filter(n => n.estado === "en reparación").length;
    const destruidas = naves.filter(n => n.estado === "destruida").length;

    document.getElementById("totalNaves").textContent =
        `Total de naves: ${totalNaves}`;

    document.getElementById("estadoNaves").textContent =
        `Operativas: ${operativas} | En reparación: ${reparacion} | Destruidas: ${destruidas}`;


    // pilotos
    const totalPilotos = pilotos.length;

    const activos = pilotos.filter(p => p.estado === "activo").length;
    const heridos = pilotos.filter(p => p.estado === "herido").length;
    const kia = pilotos.filter(p => p.estado === "KIA").length;

    document.getElementById("totalPilotos").textContent =
        `Total de pilotos: ${totalPilotos}`;

    document.getElementById("estadoPilotos").textContent =
        `Activos: ${activos} | Heridos: ${heridos} | KIA: ${kia}`;


    // misiones
    const pendientes = misiones.filter(m => m.estado === "todo").length;
    const enCurso = misiones.filter(m => m.estado === "in_progress").length;
    const completadas = misiones.filter(m => m.estado === "done").length;

    document.getElementById("totalMisiones").textContent =
        `Pendientes: ${pendientes} | En curso: ${enCurso} | Completadas: ${completadas}`;


    // mejor piloto
    if (pilotos.length > 0) {

        const mejor = pilotos.reduce((max, p) => {
            if (p.victorias > max.victorias) {
                return p;
            } else {
                return max;
            }
        });

        document.getElementById("mejorPiloto").textContent =
            `Mejor piloto: ${mejor.nombre} (${mejor.victorias} victorias)`;

    } else {

        document.getElementById("mejorPiloto").textContent =
            `Mejor piloto: N/A`;
    }


    // nave más rápida
    if (naves.length > 0) {

        const rapida = naves.reduce((max, n) => {
            if (n.velocidad > max.velocidad) {
                return n;
            } else {
                return max;
            }
        });

        document.getElementById("naveRapida").textContent =
            `Nave más rápida: ${rapida.nombre} (${rapida.velocidad})`;
    }


    // progreso
    const total = misiones.length;

    let porcentaje = 0;

    if (total > 0) {
        porcentaje = (completadas / total) * 100;
    }

    const barra = document.getElementById("barraProgreso");

    barra.style.width = porcentaje + "%";
    barra.textContent = Math.round(porcentaje) + "%";
}