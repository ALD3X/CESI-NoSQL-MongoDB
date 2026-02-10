const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

app.use(express.json());

const uri = "mongodb://root:rootpassword@mongodb:27017/places?authSource=admin";
const client = new MongoClient(uri);

app.get('/test', async (req, res) => {
    try {
        await client.connect();
        const db = client.db("places");
        const collection = db.collection("places");
        const stations = await collection.find({}).limit(100).toArray();
        res.json(stations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        await client.close();
    }
});

app.get('/near', async (req, res) => {
    try {
        await client.connect();
        const db = client.db("places");
        const collection = db.collection("places");

        const lat = parseFloat(req.query.lat);
        const lng = parseFloat(req.query.lng);

        if (!lat || !lng) {
            return res.status(400).json({ error: "lat and lng are required" });
        }

        let radius = parseInt(req.query.radius) || 800;
        radius = Math.min(radius, 500000); // limiter à 500 km
        const category = req.query.category;
        const openNow = req.query.openNow === 'true';
        let limit = parseInt(req.query.limit) || 500;
        limit = Math.min(limit, 500);
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const query = {
            "geometry": {
                $geoWithin: {
                    $centerSphere: [
                        [lng, lat],
                        radius / 6378137 // convertir mètres en radians
                    ]
                }
            }
        };

        if (category) {
            query["properties.amenity"] = category;
        }

        if (openNow) {
            query["properties.opening_hours"] = { $regex: "24/7", $options: "i" };
        }

        const stations = await collection.find(query)
            .skip(skip)
            .limit(limit)
            .toArray();

        res.json(stations);

    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        await client.close();
    }
});

app.get('/categories', async (req, res) => {
    try {
        await client.connect();
        const db = client.db("places");
        const collection = db.collection("places");
        const amenities = await collection.distinct("properties.amenity");
        res.json(amenities);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        await client.close();
    }
});

app.listen(port, "0.0.0.0", () => {
  console.log("Server running on http://0.0.0.0:3000");
});
