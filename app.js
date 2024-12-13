const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Item = require('./model');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/api')
  .then(() => console.log('Database Connected'))
  .catch((err) => console.log('Connection failed', err));


app.get('/', (req, res) => {
    res.send('<h1>Welcome to the RESTful API!</h1><h1>Home Page');
});

app.get('/items', async (req, res) => {
    try {
        const items = await Item.find();
        res.status(200).json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch items.', details: err.message });
    }
});

app.post('/items', async (req, res) => {
    try {
        const newItem = new Item(req.body);
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Failed to create the item.', details: err.message });
    }
});

app.get('/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found.' });
        res.status(200).json(item);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch item", details: err.message });
    }
});

app.put('/items/:id', async (req, res) => {
    try {
        const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedItem) return res.status(404).json({ error: 'Item not found.' });
        res.status(200).json(updatedItem);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Failed to update the item.', details: err.message });
    }
});

app.delete('/items/:id', async (req, res) => {
    try {
        const deletedItem = await Item.findByIdAndDelete(req.params.id);
        if (!deletedItem) return res.status(404).json({ error: 'Item not found.' });
        res.status(200).json({ message: 'Item deleted successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete the item.', details: err.message });
    }
});

app.listen(3000, () => {
    console.log(`Server running on http://localhost:3000`);
});