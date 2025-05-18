document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("role");
    document.getElementById("role").textContent = role.charAt(0).toUpperCase() + role.slice(1);
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const role = localStorage.getItem("role"); 
    const payload = {
        id: document.getElementById("id").value,
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        contactNo: document.getElementById("contactNo").value,
    };

    if (role === "customer") {
        Object.assign(payload, {
            age: parseInt(document.getElementById("age").value, 10),
            address: document.getElementById("address").value,
            registrationNo: document.getElementById("registrationNo").value,
            dob: document.getElementById("dob").value,
            gender: document.getElementById("gender").value,
        });
    } else if (role === "manager") {
        Object.assign(payload, {
            department: document.getElementById("department").value,
        });
    }

    try {
        const response = await fetch(`http://localhost:5000/${role}s`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            alert(`${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully!`);
            window.location.href = "login.html"; 
        } else {
            const error = await response.json();
            alert("Registration failed: " + error.error);
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
});
