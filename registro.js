document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.querySelector(".form-container");

    formulario.addEventListener("submit", function (e) {
        let nombre = document.getElementById("nombre").value.trim();
        let correo = document.getElementById("correo").value.trim();
        let telefono = document.getElementById("telefono").value.trim();
        let dni = document.getElementById("DNI").value.trim();
        let fecha = document.getElementById("fecha").value.trim();

        if (nombre === "" || correo === "" || telefono === "" || dni === "" || fecha === "") {
            alert("Todos los campos son obligatorios.");
            e.preventDefault();
            return;
        }

        let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(correo)) {
            alert("Correo inválido.");
            e.preventDefault();
            return;
        }

        let telefonoPattern = /^[0-9]{10}$/;
        if (!telefonoPattern.test(telefono)) {
            alert("Teléfono inválido. Debe contener 10 dígitos.");
            e.preventDefault();
            return;
        }

        let dniPattern = /^[0-9]{7,8}$/;
        if (!dniPattern.test(dni)) {
            alert("DNI inválido. Debe contener 7 u 8 números.");
            e.preventDefault();
            return;
        }
    });
});
