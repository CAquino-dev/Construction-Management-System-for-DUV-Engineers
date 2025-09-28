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

const inventoryRequest = (req, res) => {
  const { userId } = req.params;
  const {
    item_id,
    quantity,
    notes
  } = req.body;

  const query = `INSERT INTO item_requests(user_id, item_id, quantity, notes) VALUES(?, ?, ?, ?)`;

  db.query(query, [userId, item_id, quantity, notes], (err, result) => {
    if(err){
      console.error('Failed to request an item', err)
      return res.status(500).json({ error: "Failed to request item" });
    }
    res.json({message: "Item Requested, Please Wait for Approval" })
  });
};

const getInventoryRequests = (req, res) => {
  
  const query = `SELECT 
  r.id,
  i.name AS item_name,
  u.full_name AS requester_name,
  r.quantity,
  r.notes,
  r.status,
  r.request_date
  FROM item_requests r
  JOIN inventory_items i ON i.id = r.item_id
  JOIN users u ON u.id = r.user_id;
  `;

  db.query(query, (err, result) => {
    if(err){
      console.error('Failed to get item requests', err)
      return res.status(500).json({ error: "Failed to fetch item requests" });
    };
    res.json(result);
  });
};

const updateRequestStatus = (req, res) => {
  const { requestId } = req.params;
  const { status, rejection_note } = req.body;

  const query = `UPDATE item_requests SET status = ?, rejection_note = ? WHERE id = ?`;
  const values = [status, rejection_note, requestId];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error updating request:", err);
      return res.status(500).json({ error: "Failed to update request" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json({ message: `Request ${status.toLowerCase()} successfully` });
  });
};

const getUserRequest = (req, res) => {
  const { userId } = req.params;

  const query = `
  SELECT 
  u.full_name AS requester_name,
  ii.name,
  ir.quantity,
  ir.notes,
  ir.status,
  ir.request_date,
  ir.rejection_note
  FROM item_requests ir
  JOIN inventory_items ii ON ii.id = ir.item_id
  JOIN users u ON u.id = ir.user_id
  WHERE user_id = ?
  `;

  db.query(query, [userId], (err, result) => {
    if(err){
      console.error("Error getting user requests", err)
      return res.status(500).json({ error: "Failed to fetch user request" });
    }
    res.json(result);
  });
};

const claimItem = (req, res) => {
  const { requestId } = req.params; // the item request being claimed
  const { userId } = req.body; // manager's user ID

  if (!requestId || !userId) {
    return res.status(400).json({ error: "requestId and userId are required" });
  }

    const query = `
      UPDATE item_requests
      SET status = 'Claimed',
          claimed_by = ?,
          claimed_at = NOW()
      WHERE id = ?
    `;

    db.query(query, [userId, requestId], (err, updateResult) => {
      if (err) {
        console.error("Error updating request:", err);
        return res.status(500).json({ error: "Failed to update request" });
      }

      return res.json({ message: "Item marked as claimed ✅" });
    });
};


module.exports = { 
getInventoryItems, updateInventoryItem, addInventoryItem, 
inventoryRequest, getInventoryRequests, updateRequestStatus,
getUserRequest, claimItem
};