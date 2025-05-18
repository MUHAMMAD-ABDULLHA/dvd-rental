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
                    <button onclick="rentDvd(1, '${dvd._id}')">Rent</button>
                </div>`
        ).join("");
    } catch (err) {
        console.error("Failed to fetch DVDs:", err);
        alert("Failed to load DVDs");
    }
}


async function rentDvd(name, dvdID, price) {
    try {
        const response = await fetch("http://localhost:5000/rentals", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: name, 
                dvdID: dvdID,
                price: price,
            }),
        });
        //console.log(name)
        console.log(response.name)
        

        if (response.ok) {
            alert("DVD rented successfully!");
            fetchDvds(); 
        } else {
            const error = await response.json();
            alert("Failed to rent DVD: " + error.error);
        }
    } catch (err) {
        alert("Error: " + err.message);
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
document.getElementById("back").addEventListener("click", () => {
    window.location.href = "index.html"; 
});

fetchDvds()
fetchRentals()