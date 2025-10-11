const db = require("../config/db");
const nodemailer = require('nodemailer');

// Setup your email transporter (use your SMTP config or service)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",  // replace with your SMTP server
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL, // your email
    pass: process.env.SMTP_PASS,    // your email password or app password
  },
});

const createAppointment = (req, res) => {
  const { clientName, clientEmail, clientPhone, preferredDate, preferredTime, purpose, notes } = req.body;

  if (!clientName || !clientEmail || !preferredDate || !preferredTime || !purpose) {
    return res.status(400).json({ message: "Please fill all required fields." });
  }

  const sql = `
    INSERT INTO appointment_requests
    (client_name, client_email, client_phone, preferred_date, preferred_time, purpose, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [clientName, clientEmail, clientPhone || null, preferredDate, preferredTime, purpose, notes || null],
    (error, results) => {
      if (error) {
        console.error("Error creating appointment:", error);
        return res.status(500).json({ message: "Internal server error." });
      }

      // Send confirmation email
      const mailOptions = {
        from: '"DUV ENGINEERS" <yourgmail@gmail.com>',
        to: clientEmail,
        subject: "Appointment Request Received",
        text: `Hello ${clientName},

Thank you for requesting an appointment with us.

Here are the details you submitted:
- Preferred Date: ${preferredDate}
- Preferred Time: ${preferredTime}
- Purpose: ${purpose || "None"}
- Additional Notes: ${notes || "None"}

We will review your request and get back to you shortly.

Best regards,
Your Business Team
`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Error sending email:", err);
          // Email failure does not block response, just log
        }
        // You may log info if needed
      });

      return res.status(201).json({ message: "Appointment request submitted successfully." });
    }
  );
};

const adminCreateAppointment = (req, res) => {
  const { clientName, clientEmail, clientPhone, preferredDate, preferredTime, purpose, notes } = req.body;

  if (!clientName || !clientEmail || !preferredDate || !preferredTime || !purpose) {
    return res.status(400).json({ message: "Please fill all required fields." });
  }

  const sql = `
    INSERT INTO appointment_requests
    (client_name, client_email, client_phone, preferred_date, preferred_time, purpose, notes, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [clientName, clientEmail, clientPhone || null, preferredDate, preferredTime, purpose, notes || null, "Confirmed"],
    (error, results) => {
      if (error) {
        console.error("Error creating appointment:", error);
        return res.status(500).json({ message: "Internal server error." });
      }

      // Send confirmation email
      const mailOptions = {
        from: '"DUV ENGINEERS" <yourgmail@gmail.com>',
        to: clientEmail,
        subject: "Appointment Request Confirmed",
        text: `Hello ${clientName},

Your appointment has been successfully confirmed.

Details:
- Date: ${preferredDate}
- Time: ${preferredTime}
- Purpose: ${purpose || "None"}
- Additional Notes: ${notes || "None"}

We look forward to seeing you.

Best regards,
Your Business Team
`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Error sending email:", err);
        }
      });

      return res.status(201).json({ message: "Appointment created and confirmed." });
    }
  );
};


const updateAppointmentStatus = (req, res) => {
  const appointmentId = req.params.id;
  const { status, adminNotes } = req.body; // expected: status='Confirmed' or 'Cancelled'

  // Validate status value
  const validStatuses = ['Confirmed', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  const sql = `UPDATE appointment_requests SET status = ?, admin_notes = ? WHERE id = ?`;

  db.query(sql, [status, adminNotes || null, appointmentId], (error, results) => {
    if (error) {
      console.error("Error updating appointment status:", error);
      return res.status(500).json({ message: "Internal server error." });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    // Fetch updated appointment details to send email notification
    const selectSql = `SELECT client_name, client_email, preferred_date, preferred_time FROM appointment_requests WHERE id = ?`;
    db.query(selectSql, [appointmentId], (err, rows) => {
      if (err || rows.length === 0) {
        console.error("Error fetching appointment details:", err);
        return res.status(500).json({ message: "Internal server error." });
      }

      const appointment = rows[0];

      // Prepare notification email content
      let subject, text;

      if (status === 'Confirmed') {
        subject = "Your Appointment Has Been Confirmed";
        text = `Hello ${appointment.client_name},

Good news! Your appointment request has been confirmed.

Details:
- Date: ${appointment.preferred_date}
- Time: ${appointment.preferred_time}

If you have any questions, feel free to contact us.

Best regards,
Your Business Team
`;
      } else if (status === 'Cancelled') {
        subject = "Your Appointment Has Been Cancelled";
        text = `Hello ${appointment.client_name},

We regret to inform you that your appointment request has been cancelled.

If you have questions or want to reschedule, please contact us.

Best regards,
Your Business Team
`;
      }

      const mailOptions = {
        from: '"Your Business Name" <yourgmail@gmail.com>',
        to: appointment.client_email,
        subject,
        text,
      };

      transporter.sendMail(mailOptions, (mailErr, info) => {
        if (mailErr) {
          console.error("Error sending status update email:", mailErr);
        }
        // Respond regardless of email success
        return res.json({ message: `Appointment status updated to ${status}.` });
      });
    });
  });
};

const getAllAppointments = (req, res) => {
  const sql = `SELECT id, client_name, client_email, client_phone, preferred_date, preferred_time, status, purpose, notes FROM appointment_requests ORDER BY created_at DESC`;

  db.query(sql, (error, results) => {
    if (error) {
      console.error("Error fetching appointments:", error);
      return res.status(500).json({ message: "Internal server error." });
    }

    return res.json(results);  // sends array of appointment objects
  });
};

const getBookedSlots = (req, res) => {
  const query = `
    SELECT preferred_date, COUNT(*) as count 
    FROM appointment_requests 
    WHERE status IN ('Pending', 'Confirmed') 
    GROUP BY preferred_date
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch booked slots' });
    res.status(200).json(results); // Each item will be { preferred_date, count }
  });
}


module.exports = { createAppointment, updateAppointmentStatus, getAllAppointments, getBookedSlots, adminCreateAppointment };