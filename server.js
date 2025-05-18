const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI || "mongodb://3.84.159.138:27017";
const client = new MongoClient(uri);
let db;

(async () => {
    try {
        await client.connect();
        console.log("MongoDB Connected");
        db = client.db("rental");
        app.post("/login/:role", async (req, res) => {
            try {
                const email = req.body.email;
                const password  = req.body.password;
                const { role } = req.params;       
                const collection = role === "customer" ? "customers" : "managers";
                const user = await db.collection(collection).findOne({ email: email}); 
                const name = user.name ;
                console.log(name)
                if (!user) {
                    console.log("User not found for email:", email);
                    return res.status(404).json({ error: "User not found" });
                }
        
                if (user.password !== password) {
                    console.log("Invalid password for email:", email);
                    return res.status(401).json({ error: "Invalid password" });
                }
    
                res.status(200).json({ email: user.email, role });
            } catch (err) {
                console.error("Error during login:", err);
                res.status(500).json({ error: err.message });
            }
        });
                
        app.post("/customers", async (req, res) => {
            try {
                console.log("Received payload for customer registration:", req.body);
                const payload = {
                    customerID: req.body.id,
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    contactNo: req.body.contactNo,
                    age: req.body.age,
                    address: req.body.address,
                    registrationNo: req.body.registrationNo,
                    DOB: req.body.dob,
                    gender: req.body.gender,
                };
                const result = await db.collection("customers").insertOne(payload);
                res.status(201).json({ message: "Customer account created successfully", id: result.insertedId });
            } catch (err) {
                res.status(400).json({ error: err.message });
            }
        });
        
        app.post("/managers", async (req, res) => {
            try {
                const payload = {
                    managerID: req.body.id, 
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    contactNo: req.body.contactNo,
                    department: req.body.department,
                };
                const result = await db.collection("managers").insertOne(payload);
                res.status(201).json({ message: "Manager account created successfully", id: result.insertedId });
            } catch (err) {
                res.status(400).json({ error: err.message });
            }
        });

        app.post("/dvds", async (req, res) => {
            try {
                const { title, genre, stock, releaseDate, price } = req.body;

                if (!title || !genre || !stock || !releaseDate || !price) {
                    return res.status(400).json({ error: "All fields are required" });
                }

                const result = await db.collection("dvds").insertOne({
                    title,
                    genre,
                    stock,
                    releaseDate,
                    price,
                });

                res.status(201).json({ message: "DVD added successfully", id: result.insertedId });
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        // Get All DVDs
        app.get("/dvds", async (req, res) => {
            try {
                const dvds = await db.collection("dvds").find().toArray();
                res.status(200).json(dvds);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });
        app.get("/dvds/:id", async (req, res) => {
            try {
                const { id } = req.params;
                const dvd = await db.collection("dvds").findOne({ _id: new ObjectId(id) });
                if (!dvd) return res.status(404).json({ error: "DVD not found" });
                res.status(200).json(dvd);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.put("/dvds/:id", async (req, res) => {
            try {
                const { id } = req.params;
                const { title, genre, stock, releaseDate, price } = req.body;
                if (!title || !genre || !stock || !releaseDate || !price) {
                    return res.status(400).json({ error: "All fields are required" });
                }

                const result = await db.collection("dvds").updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { title, genre, stock, releaseDate, price } }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ error: "DVD not found" });
                }

                res.status(200).json({ message: "DVD updated successfully" });
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });

        app.delete("/dvds/:dvdID", async (req, res) => {
            try {
                const { dvdID } = req.params;
                const dvdObjectId = new ObjectId(dvdID);

                const dvdResult = await db.collection("dvds").deleteOne({ _id: dvdObjectId });

                if (dvdResult.deletedCount > 0) {
                    res.status(200).json({ message: "DVD deleted successfully" });
                } else {
                    res.status(404).json({ error: "DVD not found" });
                }
            } catch (err) {
                res.status(500).json({ error: "Failed to delete DVD" });
            }
        });

        app.post("/rentals", async (req, res) => {
            try {
                const { name, dvdID } = req.body;
                const dvdObjectId = new ObjectId(dvdID);
                const dvd = await db.collection("dvds").findOne({ _id: dvdObjectId });
                if (!dvd) return res.status(404).send({ error: "DVD not found" });
                if (dvd.stock <= 0) return res.status(400).send({ error: "DVD out of stock" });

                await db.collection("dvds").updateOne({ _id: dvdObjectId }, { $inc: { stock: -1 } });
                const rental = { name: name, dvdTitle: dvd.title, rentalDate: new Date(), price : dvd.price };
                console.log(name)
                const result = await db.collection("rentals").insertOne(rental);

                res.status(201).send({ message: "Rental added successfully", rentalID: result.insertedId });
            } catch (err) {
                res.status(500).send({ error: "Failed to add rental" });
            }
        });

        app.get("/rentals", async (req, res) => {
            try {
                const rentals = await db.collection("rentals").find().toArray();
                res.status(200).json(rentals);
            } catch (err) {
                res.status(500).json({ error: err.message });
            }
        });
        
        app.get("/payments", async (req, res) => {
            try {
                const payments = await db.collection("rentals").find().toArray();        
                const totalIncome = payments.reduce((sum, payment) => sum + (payment.price || 0), 0);       
                res.status(200).json({ totalIncome, payments });
            } catch (err) {
                console.error("Error fetching payments:", err);
                res.status(500).json({ error: "Failed to fetch payments" });
            }
        });
        
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err.message);
    }
})();
