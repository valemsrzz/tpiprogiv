document.addEventListener("DOMContentLoaded", function () {
    const saveButton = document.getElementById("saveButton");
    const notaInputs = document.querySelectorAll(".nota");

    saveButton.addEventListener("click", function (e) {
        e.preventDefault();

        let notas = {};

        notaInputs.forEach((input, index) => {
            let nota = input.value.trim();
            if (nota === "") {
                alert("Todos los campos de calificaciones deben estar llenos.");
                return;
            }

            notas[`nota${index}`] = parseFloat(nota);
        });

        // Guardar las notas en LocalStorage
        localStorage.setItem('notas', JSON.stringify(notas));
        alert("Las calificaciones han sido guardadas exitosamente en el almacenamiento local.");
    });
});
