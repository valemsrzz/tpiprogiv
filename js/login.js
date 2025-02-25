document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
  
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
  
    if (username === "" || password === "") {
      alert("Por favor, completa todos los campos.");
      return;
    }
    
  /* añadir lógica para autenticar al usuario */
    console.log("Usuario:", username);
    console.log("Contraseña:", password);
    alert("Inicio de sesión exitoso");
  
    window.location.href = "inicio.html";
  });
  