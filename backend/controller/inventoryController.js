const db = require("../config/db");

const getInventoryItems = (req, res) => {
    
    const query = `SELECT * FROM inventory_items`;

    db.query(query, (err, results) => {
        if(err){
            console.error(`failed to get inventory items`, err)
            return res.status(500).json({ message: "Internal server error." });
        };
        return res.json(results);
    });
};

const updateInventoryItem = (req, res) => {
    const { itemId } = req.params;
    const {
        name,
        category,
        quantity,
        unit,
        description
    } = req.body;

    if(!name || !category || !quantity || !unit || !description){
        return res.status(400).json({ error: 'inventory items required' });
    }

    const query = `UPDATE inventory_items SET name = ?, category = ?, quantity = ?, unit = ?, description = ? WHERE id = ?`;

    db.query(query, [name, category, quantity, unit, description, itemId], (err, result) => {
        if (err) {
            console.error("Error updating item:", err);
            return res.status(500).json({ error: "Failed to update item" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Item not found" });
        }
        res.json({ message: "Item updated successfully" });
    });
};

const addInventoryItem = (req, res) => {
  const { name, category, quantity, unit, description } = req.body;

  // ✅ Fix validation for quantity
  if (!name || !category || quantity === undefined || !unit || !description) {
    return res.status(400).json({ error: "All inventory fields are required" });
  }

  const query = `
    INSERT INTO inventory_items (name, category, quantity, unit, description)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [name, category, quantity, unit, description], (err, result) => {
    if (err) {
      console.error("Error adding item:", err);
      return res.status(500).json({ error: "Failed to add item" });
    }

    // ✅ Return the inserted item
    res.json({
      message: "Item added successfully",
      item: {
        id: result.insertId,
        name,
        category,
        quantity,
        unit,
        description,
      },
    });
  });
};


module.exports = { getInventoryItems, updateInventoryItem, addInventoryItem };