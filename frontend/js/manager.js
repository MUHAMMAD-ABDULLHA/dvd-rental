document.getElementById("addDvdForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const genre = document.getElementById("genre").value;
    const stock = parseInt(document.getElementById("stock").value, 10);
    const releaseDate = document.getElementById("releaseDate").value;
    const price = parseFloat(document.getElementById("price").value);

    const response = await fetch("http://localhost:5000/dvds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, genre, stock, releaseDate, price }),
    });

    if (response.ok) {
        alert("DVD Added!");
        fetchDvds();
    } else {
        alert("Failed to add DVD");
    }
});

// Fetch DVDs
async function fetchDvds() {
    try {
        const response = await fetch("http://localhost:5000/dvds");
        const dvds = await response.json();

        const dvdList = document.getElementById("dvdList");
        dvdList.innerHTML = dvds.map(
            (dvd) => `
            <div>
                <h3>${dvd.title} (${dvd.genre})</h3>
                <p>Stock: ${dvd.stock}</p>
                <p>Price: $${dvd.price.toFixed(2)}</p>
                <p>Release Date: ${new Date(dvd.releaseDate).toLocaleDateString()}</p>
                <button onclick="deleteDvd('${dvd._id}')">Delete</button>
                <button onclick="showUpdateForm('${dvd._id}')">Update</button>
            </div>`
        ).join("");
    } catch (err) {
        console.error("Failed to fetch DVDs:", err);
        alert("Failed to load DVDs");
    }
}

// Delete DVD
async function deleteDvd(dvdID) {
    try {
        const response = await fetch(`http://localhost:5000/dvds/${dvdID}`, {
            method: "DELETE",
        });

        if (response.ok) {
            alert("DVD deleted successfully!");
            fetchDvds();
            fetchRentals(); // Refresh rental list
        } else {
            alert("Failed to delete DVD");
        }
    } catch (err) {
        console.error("Failed to delete DVD:", err);
    }
}

// Show Update Form
function showUpdateForm(dvdID) {
    document.getElementById("updateDvdModal").style.display = "block";

    fetch(`http://localhost:5000/dvds/${dvdID}`)
        .then((response) => response.json())
        .then((dvd) => {
            document.getElementById("updateTitle").value = dvd.title;
            document.getElementById("updateGenre").value = dvd.genre;
            document.getElementById("updateStock").value = dvd.stock;
            document.getElementById("updateReleaseDate").value = dvd.releaseDate.split("T")[0];
            document.getElementById("updatePrice").value = dvd.price;
            document.getElementById("updateDvdForm").onsubmit = (e) => {
                e.preventDefault();
                updateDvd(dvdID);
            };
        });
}

// Update DVD
async function updateDvd(dvdID) {
    const title = document.getElementById("updateTitle").value;
    const genre = document.getElementById("updateGenre").value;
    const stock = parseInt(document.getElementById("updateStock").value, 10);
    const releaseDate = document.getElementById("updateReleaseDate").value;
    const price = parseFloat(document.getElementById("updatePrice").value);

    const response = await fetch(`http://localhost:5000/dvds/${dvdID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, genre, stock, releaseDate, price }),
    });

    if (response.ok) {
        alert("DVD updated successfully!");
        document.getElementById("updateDvdModal").style.display = "none";
        fetchDvds();
    } else {
        alert("Failed to update DVD");
    }
}

// Fetch Rentals
async function fetchRentals() {
    try {
        const response = await fetch("http://localhost:5000/rentals");
        const rentals = await response.json();

        const rentalList = document.getElementById("rentalList");
        rentalList.innerHTML = rentals.map(
            (rental) => `
                <p>
                    Customer: ${rental.name || "Unknown"}, 
                    DVD: ${rental.dvdTitle || "Unknown"}, 
                    Price: $${rental.price ? rental.price.toFixed(2) : "Unknown"}, 
                    Date: ${new Date(rental.rentalDate).toLocaleDateString()}
                </p>`
        ).join("");
    } catch (err) {
        console.error("Failed to fetch rentals:", err);
        alert("Failed to load rentals");
    }
}

// Fetch Payments
async function fetchPayments() {
    try {
        const response = await fetch("http://localhost:5000/payments");
        const data = await response.json();
        const { totalIncome, payments } = data;
        const paymentList = document.getElementById("paymentList");
        paymentList.innerHTML = payments.map(
            (payment) => `<p>Payment ID: ${payment._id}, Amount: $${(payment.price || 0).toFixed(2)}</p>`
        ).join("");
        document.getElementById("totalIncome").textContent = `$${(totalIncome || 0).toFixed(2)}`;
    } catch (err) {
        console.error("Failed to fetch payments:", err);
        alert("Failed to load payments");
    }
}

// Cancel Update
document.getElementById("cancelUpdate").addEventListener("click", () => {
    document.getElementById("updateDvdModal").style.display = "none";
});
document.getElementById("back").addEventListener("click", () => {
    window.location.href = "index.html"; 
});
// Initial Fetch Calls
fetchDvds();
fetchRentals();
fetchPayments();
