document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("role");
    document.getElementById("role").textContent = role.charAt(0).toUpperCase() + role.slice(1);
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = localStorage.getItem("role");

    try {
        const response = await fetch(`http://localhost:5000/login/${role}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const user = await response.json();
            localStorage.setItem("user", JSON.stringify(user));
            window.location.href = `${role}.html`;
        } else {
            const error = await response.json();
            alert("Login failed: " + error.error);
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
});
