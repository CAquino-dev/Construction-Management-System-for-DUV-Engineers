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

const getMaterialCatalog = (req, res) => {
  const query = `SELECT * FROM material_catalog`;

  db.query(query, (err, result) => {
    if(err){
      console.error('Failed fetching material catalog')
      return res.status(400).json({ error: "Failed to get items" })
    }
    res.json(result);
  });
};

const createTransaction = (req, res) => {
  const {
    project_id,
    material_id,
    transaction_type,
    quantity,
    unit,
    reference,
    created_by
  } = req.body;

  // If OUT, check available stock first
  if (transaction_type === "OUT") {
    const checkStockQuery = `
      SELECT quantity FROM project_inventory
      WHERE project_id = ? AND material_id = ?
    `;

    db.query(checkStockQuery, [project_id, material_id], (err, rows) => {
      if (err) {
        console.error("Error checking stock:", err);
        return res.status(500).json({ success: false, message: "Error checking stock" });
      }

      const currentQty = rows.length > 0 ? parseFloat(rows[0].quantity) : 0;

      if (currentQty < quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock. Available: ${currentQty}, Requested: ${quantity}`
        });
      }

      // Proceed with transaction if stock is enough
      insertTransaction();
    });
  } else {
    // If IN, no need to check stock
    insertTransaction();
  }

  function insertTransaction() {
    const insertTransactionQuery = `
      INSERT INTO inventory_transactions
        (project_id, material_id, transaction_type, quantity, unit, reference, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertTransactionQuery,
      [project_id, material_id, transaction_type, quantity, unit, reference, created_by],
      (err, result) => {
        if (err) {
          console.error("Error inserting transaction:", err);
          return res.status(500).json({ success: false, message: "Error inserting transaction" });
        }

        const transactionId = result.insertId;

        // Update project_inventory
        const updateInventoryQuery = `
          INSERT INTO project_inventory (project_id, material_id, quantity, unit)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            quantity = CASE
              WHEN ? = 'IN' THEN quantity + VALUES(quantity)
              WHEN ? = 'OUT' THEN quantity - VALUES(quantity)
              ELSE quantity
            END
        `;

        db.query(
          updateInventoryQuery,
          [project_id, material_id, quantity, unit, transaction_type, transaction_type],
          (err2) => {
            if (err2) {
              console.error("Error updating project inventory:", err2);
              return res.status(500).json({ success: false, message: "Error updating project inventory" });
            }

            return res.status(201).json({
              success: true,
              message: "Transaction recorded and inventory updated",
              transaction_id: transactionId
            });
          }
        );
      }
    );
  }
};

const getProjectInventory = (req, res) => {
    const { projectId } = req.params;

    const query = 
     `SELECT
      pi.id,
      mc.name AS material_name,
      pi.project_id,
      pi.quantity,
      pi.unit
      FROM project_inventory pi
      JOIN material_catalog mc ON mc.id = pi.material_id
      WHERE project_id = ?`;

    db.query(query, [projectId], (err, result) => {
      if(err){
        console.error('Failed to get project inventory', err);
        return res.status(400).json({ error: "failed to get project inventory" })
      };
      return res.json(result);
    });
};


const getPendingDeliveries = (req, res) => {
  const { projectId } = req.params;

  const query = `
    SELECT 
      po.id AS po_id,
      po.po_number,
      po.total_amount,
      po.status,
      s.supplier_name,
      poi.id AS item_id,
      poi.material_name,
      poi.unit,
      poi.quantity,
      poi.unit_price,
      poi.delivered_quantity,
      (poi.quantity * poi.unit_price) AS total_price
    FROM purchase_orders po
    JOIN suppliers s ON po.supplier_id = s.id
    JOIN purchase_order_items poi ON poi.po_id = po.id
    WHERE po.project_id = ?
      AND po.status = 'Pending Delivery'
    ORDER BY po.created_at DESC
  `;

  db.query(query, [projectId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching pending deliveries:", err);
      return res
        .status(500)
        .json({ message: "Error fetching pending deliveries" });
    }

    if (results.length === 0) {
      return res.json([]); // no deliveries
    }

    // ✅ Group rows by purchase order
    const deliveries = {};

    results.forEach((row) => {
      if (!deliveries[row.po_id]) {
        deliveries[row.po_id] = {
          po_id: row.po_id,
          po_number: row.po_number,
          total_amount: row.total_amount,
          status: row.status,
          supplier_name: row.supplier_name,
          materials: [],
        };
      }

      // ✅ Calculate missing quantity
      const deliveredQty = Number(row.delivered_quantity || 0);
      const missingQty = Math.max(row.quantity - deliveredQty, 0);

      deliveries[row.po_id].materials.push({
        id: row.item_id,
        material_name: row.material_name,
        unit: row.unit,
        quantity: Number(row.quantity),
        delivered_quantity: deliveredQty,
        missing_quantity: missingQty,
        unit_price: Number(row.unit_price),
        total_price: Number(row.total_price),
      });
    });

    res.json(Object.values(deliveries));
  });
};


const updateDeliveredQuantity = (req, res) => {
    const { po_id, item_id, delivered_quantity, updated_by } = req.body;

  if (!po_id || !item_id || delivered_quantity == null) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: po_id, item_id, delivered_quantity.",
    });
  }

  // Step 1: Get the current delivered and ordered quantities
  const getItemQuery = `
    SELECT quantity, delivered_quantity 
    FROM purchase_order_items 
    WHERE id = ?
  `;

  db.query(getItemQuery, [item_id], (err, result) => {
    if (err) {
      console.error("❌ Error fetching item:", err);
      return res.status(500).json({ success: false, message: "Database error." });
    }

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }

    const { quantity, delivered_quantity: currentDelivered } = result[0];
    const totalDelivered = Number(currentDelivered) + Number(delivered_quantity);

    if (totalDelivered > quantity) {
      return res.status(400).json({
        success: false,
        message: `Delivered quantity exceeds ordered amount (${quantity}).`,
      });
    }

    // Step 2: Update delivered quantity
    const updateQuery = `
      UPDATE purchase_order_items
      SET delivered_quantity = ?, updated_by = ?, updated_at = NOW()
      WHERE id = ?
    `;

    db.query(updateQuery, [totalDelivered, updated_by, item_id], (err2) => {
      if (err2) {
        console.error("❌ Error updating delivered quantity:", err2);
        return res.status(500).json({ success: false, message: "Failed to update delivery." });
      }

      // Step 3: Respond success
      return res.status(200).json({
        success: true,
        message: "Delivered quantity updated successfully.",
        data: {
          po_id,
          item_id,
          delivered_quantity: totalDelivered,
        },
      });
    });
  });
};

const markAsDelivered = (req, res) => {
  const { po_id } = req.params;
  const { received_by, project_id } = req.body;

  if (!po_id || !received_by || !project_id) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: po_id, received_by, or project_id.",
    });
  }

  // Step 1: Get all items in this PO
  const getItemsQuery = `
    SELECT id AS material_id, quantity, unit
    FROM purchase_order_items
    WHERE po_id = ?
  `;

  db.query(getItemsQuery, [po_id], (err, items) => {
    if (err) {
      console.error("❌ Error fetching PO items:", err);
      return res.status(500).json({ success: false, message: "Database error." });
    }

    if (items.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No items found for this purchase order." });
    }

    // Step 2: Check if all items are fully delivered
    const checkIncomplete = `
      SELECT COUNT(*) AS incomplete
      FROM purchase_order_items
      WHERE po_id = ? AND (delivered_quantity IS NULL OR delivered_quantity < quantity)
    `;

    db.query(checkIncomplete, [po_id], (err2, result) => {
      if (err2) {
        console.error("❌ Error checking delivery completeness:", err2);
        return res.status(500).json({ success: false, message: "Database error." });
      }

      if (result[0].incomplete > 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot mark as delivered. Some items are still pending delivery.",
        });
      }

      // Step 3: Get milestone_id linked to this PO
      const getMilestoneQuery = `
        SELECT milestone_id
        FROM purchase_orders
        WHERE id = ?
      `;

      db.query(getMilestoneQuery, [po_id], (err3, milestoneResult) => {
        if (err3) {
          console.error("❌ Error fetching milestone ID:", err3);
          return res.status(500).json({ success: false, message: "Database error." });
        }

        const milestoneId = milestoneResult[0]?.milestone_id;

        // Step 4: Update PO status to 'Delivered'
        const updatePO = `
          UPDATE purchase_orders
          SET status = 'Delivered',
              received_by = ?,
              received_at = NOW()
          WHERE id = ?
        `;

        db.query(updatePO, [received_by, po_id], (err4, result2) => {
          if (err4) {
            console.error("❌ Error updating PO status:", err4);
            return res.status(500).json({ success: false, message: "Failed to mark as delivered." });
          }

          if (result2.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Purchase order not found." });
          }

          // Step 5: Insert delivered items into project inventory
          const inventoryQuery = `
            INSERT INTO project_inventory (project_id, material_id, quantity, unit)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              quantity = CASE
                WHEN ? = 'IN' THEN quantity + VALUES(quantity)
                WHEN ? = 'OUT' THEN quantity - VALUES(quantity)
                ELSE quantity
              END
          `;

          let processed = 0;
          items.forEach((item) => {
            db.query(
              inventoryQuery,
              [
                project_id,
                item.material_id,
                item.quantity,
                item.unit,
                'IN', // movement direction
                'IN',
              ],
              (err5) => {
                if (err5) console.error("❌ Error updating project inventory:", err5);

                processed++;

                if (processed === items.length) {
                  // Step 6: Update milestone status if linked
                  if (milestoneId) {
                    const updateMilestone = `
                      UPDATE milestones
                      SET status = 'Delivered'
                      WHERE id = ?
                    `;
                    db.query(updateMilestone, [milestoneId], (err6) => {
                      if (err6) console.error("❌ Error updating milestone:", err6);

                      return res.status(200).json({
                        success: true,
                        message:
                          "Purchase order marked as delivered, milestone updated, and items added to project inventory.",
                        data: {
                          po_id,
                          received_by,
                          received_at: new Date(),
                          project_id,
                          milestone_id: milestoneId,
                        },
                      });
                    });
                  } else {
                    // No milestone linked — just return success
                    return res.status(200).json({
                      success: true,
                      message:
                        "Purchase order marked as delivered and items added to project inventory (no milestone linked).",
                      data: {
                        po_id,
                        received_by,
                        received_at: new Date(),
                        project_id,
                      },
                    });
                  }
                }
              }
            );
          });
        });
      });
    });
  });
};




module.exports = { 
getInventoryItems, updateInventoryItem, addInventoryItem, 
inventoryRequest, getInventoryRequests, updateRequestStatus,
getUserRequest, claimItem, getMaterialCatalog, createTransaction,
getProjectInventory, getPendingDeliveries, updateDeliveredQuantity,
markAsDelivered
};