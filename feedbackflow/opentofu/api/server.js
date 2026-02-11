const cors = require("cors");
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const uri = "mongodb://root:rootpassword@mongodb:27017/feedback?authSource=admin";
const client = new MongoClient(uri);

const dbName = "feedback";
const collectionFeedback = "feedback";

let db;

async function startServer() {
    try {
        await client.connect();
        db = client.db(dbName);
        console.log("✅ Connecté à MongoDB");

        app.listen(port, "0.0.0.0", () => {
            console.log("Server running on http://0.0.0.0:3000");
        });

    } catch (err) {
        console.error(err);
    }
}

/* =========================
   CREATE
========================= */
app.post("/feedback", async (req, res) => {
    try {
        const {
            userId,
            type,
            createdAt,
            rating,
            comment,
            status
        } = req.body;

        if (!userId || !type || !createdAt) {
            return res.status(400).json({
                error: "userId, type et createdAt sont obligatoires"
            });
        }

        const feedback = {
            userId,
            type,
            createdAt: new Date(createdAt)
        };

        // Champs optionnels
        if (rating !== undefined) feedback.rating = rating;
        if (comment !== undefined) feedback.comment = comment;
        if (status !== undefined) feedback.status = status;

        const result = await db
            .collection(collectionFeedback)
            .insertOne(feedback);

        res.status(201).json({
            message: "Feedback créé",
            id: result.insertedId
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/* =========================
   READ ALL
========================= */
app.get("/feedbacks", async (req, res) => {
    try {
        const { userId, status } = req.query;

        const filter = {};
        if (userId) { filter.userId = userId; }
        if (status) { filter.status = status; }

        const feedbacks = await db
            .collection(collectionFeedback)
            .find(filter)
            .toArray();

        res.json(feedbacks);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/* =========================
   READ ONE
========================= */
app.get("/feedbacks/:id", async (req, res) => {
    try {
        const feedback = await db.collection(collectionFeedback).findOne({
            _id: new ObjectId(req.params.id)
        });

        if (!feedback) return res.status(404).json({ message: "feedback non trouvé" });

        res.json(feedback);
    } catch (err) {
        res.status(400).json({ error: "ID invalide" });
    }
});

/* =========================
   UPDATE
========================= */
app.put("/feedbacks/:id", async (req, res) => {
    try {
        const result = await db.collection(collectionFeedback).updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body }
        );

        if (result.matchedCount === 0)
            return res.status(404).json({ message: "feedback non trouvé" });

        res.json({ message: "feedback mis à jour" });
    } catch (err) {
        res.status(400).json({ error: "ID invalide" });
    }
});

/* =========================
   DELETE
========================= */
app.delete("/feedbacks/:id", async (req, res) => {
    try {
        const result = await db.collection(collectionFeedback).deleteOne({
            _id: new ObjectId(req.params.id)
        });

        if (result.deletedCount === 0)
            return res.status(404).json({ message: "feedback non trouvé" });

        res.json({ message: "feedback supprimé" });
    } catch (err) {
        res.status(400).json({ error: "ID invalide" });
    }
});

startServer();