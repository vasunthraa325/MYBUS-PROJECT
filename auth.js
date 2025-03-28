// Function to handle login
function loginUser(event) {
    event.preventDefault();

    let email = document.getElementById("login-email").value;
    let password = document.getElementById("login-password").value;

    // Check if user is already registered (for now, just storing in localStorage)
    let storedEmail = localStorage.getItem("email");
    let storedPassword = localStorage.getItem("password");

    if (email === storedEmail && password === storedPassword) {
        alert("Login Successful!");
        window.location.href = "home.html"; // Redirect to home page
    } else {
        alert("Invalid email or password!");
    }
}

// Function to handle signup
function registerUser(event) {
    event.preventDefault();

    let name = document.getElementById("signup-name").value;
    let email = document.getElementById("signup-email").value;
    let password = document.getElementById("signup-password").value;

    // Store user details in localStorage
    localStorage.setItem("name", name);
    localStorage.setItem("email", email);
    localStorage.setItem("password", password);

    alert("Signup Successful! Redirecting to login...");
    window.location.href = "login.html"; // Redirect to login page
}
