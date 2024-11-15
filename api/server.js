const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const md5 = require('md5');
const cors = require('cors');
const { createCanvas, loadImage } = require('canvas');
dotenv.config();
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Import uuid for unique filenames
// Configure the email transporter
const transporter = nodemailer.createTransport({
  host: 'mail.brighttospecialhome.com',
  port: 465,
  secure: true,
  auth: {
    user: 'noreply@brighttospecialhome.com',
    pass: 'J78O-IFuU)zK'
  }
});

// Function to generate OTP
function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

// Middleware for parsing JSON bodies and enabling CORS
app.use(express.json());
app.use(cors());

// Create a MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});
// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email/Username and password are required' });
  }

  const query = 'SELECT * FROM users WHERE username = ? OR email = ?';
  try {
    const [results] = await db.query(query, [email, email]);
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];

    if (user.password !== md5(password)) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        userType: user.userType,
        username: user.username,
        profilePic_url: user.profilePic_url,
      },
    });
  } catch (err) {
    console.error('Error executing query:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to get a user by ID
app.get('/users/:id', async (req, res) => {
  const userId = req.params.id;

  // Validate user ID
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  // Optionally validate user ID format (e.g., if it should be a number)
  if (isNaN(userId)) {
    return res.status(400).json({ message: 'User ID must be a valid number' });
  }

  try {
    // Query the database using the promise interface
    const [result] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result[0];

    // Exclude sensitive information before sending the response
    const { password, ...userData } = user; // Assuming the user object has a password field

    res.status(200).json(userData);
  } catch (err) {
    console.error('Error retrieving user:', err); // Log error for debugging
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the upload directory
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`; // Retain the original file extension
    cb(null, uniqueName); // Save the file with the new unique name
  }
});
// Function to find the next available ID in sequence


const upload = multer({ storage: storage });

app.put('/users/:id', upload.single('profilePic'), (req, res) => {
  const userId = req.params.id;
  const { name, email, username, userType } = req.body;
  const profilePicUrl = req.file ? req.file.path : null; // Get the uploaded file path if exists

  // Validate user ID
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  // Optional: Validate user ID format
  if (isNaN(userId)) {
    return res.status(400).json({ message: 'User ID must be a valid number' });
  }

  // Split name into first and last names if provided
  let firstName = '';
  let lastName = '';

  if (name) {
    const nameParts = name.trim().split(' ');
    firstName = nameParts[0]; // Get the first part as the first name
    lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''; // Join the rest as last name or set as empty
  }

  // Get the current user data to preserve existing values
  const getUserQuery = 'SELECT * FROM users WHERE id = ?';

  db.query(getUserQuery, [userId], (err, result) => {
    if (err) {
      console.error('Error fetching user data:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingUser = result[0];

    // Prepare values for update, using existing values if not provided
    const updatedFirstName = firstName || existingUser.first_name;
    const updatedLastName = lastName || existingUser.last_name;
    const updatedEmail = email || existingUser.email;
    const updatedUsername = username || existingUser.username;
    const updatedUserType = userType || existingUser.userType;
    const updatedProfilePicUrl = profilePicUrl || existingUser.profilePic_url;

    const updateQuery = 'UPDATE users SET first_name = ?, last_name = ?, email = ?, username = ?, userType = ?, profilePic_url = ? WHERE id = ?';

    db.query(updateQuery, [updatedFirstName, updatedLastName, updatedEmail, updatedUsername, updatedUserType, updatedProfilePicUrl, userId], (err, result) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'User updated successfully' });
    });
  });
});

// Update Password route
app.put('/users/:id/password', (req, res) => {
  const userId = req.params.id;
  const { oldPassword, newPassword } = req.body;

  // Validate input
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Old password and new password are required' });
  }

  // Optional: Validate user ID format
  if (isNaN(userId)) {
    return res.status(400).json({ message: 'User ID must be a valid number' });
  }

  // Get the current user data to verify the old password
  const getUserQuery = 'SELECT * FROM users WHERE id = ?';

  db.query(getUserQuery, [userId], (err, result) => {
    if (err) {
      console.error('Error fetching user data:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result[0];

    // Verify the old password
    if (user.password !== md5(oldPassword)) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    // Update the password
    const updatePasswordQuery = 'UPDATE users SET password = ? WHERE id = ?';

    db.query(updatePasswordQuery, [md5(newPassword), userId], (err, result) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'Password updated successfully' });
    });
  });
});

function camelCaseToLowerCase(str) {
  return str.replace(/([A-Z])/g, ' $1').trim().toLowerCase().replace(/\s+/g, '');
}
// Route to insert a new receipt
// Function to find the next available receipt ID
const findNextAvailableId = (callback) => {
  const query = `BEGIN
  DECLARE next_id INT;
  
  SELECT COUNT(*) + 1 INTO next_id FROM receipts;
  
  SET NEW.receipt_id = LPAD(next_id, 10, '0');
`;

  db.query(query, (err, results) => {
    if (err) return callback(err);

    // Get the last used ID or default to 0 if there are no receipts
    const lastId = results[0].maxId || 0; // If there are no records, start from 0
    const nextId = lastId + 1; // Assign next ID as last ID + 1

    callback(null, nextId); // Return the next available ID
  });
};

app.post('/receipts', upload.single('receiptFile'), async (req, res) => {
  const { receivedFrom, contactNumber, sumRinggit, rm, paymentMethod, userId, remarks, collectedBy } = req.body;
  const receiptFile = req.file ? req.file.path : null; // User-provided receipt URL
  const generatedReceiptUrl = `uploads/receipt_${Date.now()}.jpg`; // URL for the generated receipt
  const templateImagePath = path.join(__dirname, 'uploads', 'template.jpg'); // Path to the template file

  try {
    // Load the template image first
    const templateImage = await loadImage(templateImagePath);
    
    // Create a new canvas with the dimensions of the loaded image
    const canvas = createCanvas(templateImage.width, templateImage.height);
    const ctx = canvas.getContext('2d');

    // Draw the receipt template image
    ctx.drawImage(templateImage, 0, 0, templateImage.width, templateImage.height);

    // Set text properties
    ctx.fillStyle = 'black'; // Text color
    ctx.font = '46px Arial'; // Font size and family

    // Get the current date
    const currentDate = new Date();
const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
const formattedDate = currentDate.toLocaleDateString('en-GB', options); // 'en-GB' for dd/mm/yyyy format


    // Overlay the text on the image
    ctx.fillText(receivedFrom, 484, 730);
    ctx.fillText(contactNumber, 447, 888);
    ctx.fillText(sumRinggit, 530, 1025);
    ctx.fillText(rm, 344, 1405);
    ctx.fillText(formattedDate, 1899, 610); // Add current date
    ctx.fillText(remarks, 350, 1188); // Add current date
    // Checkmark the payment method
    const paymentMethods = ['cash', 'cdm', 'rhbbank', 'ambank', 'touchngo', 'maybank'];
    const coords = {
      cash: { x: 844, y: 1333 },
      cdm: { x: 850, y: 1403 },
      rhbbank: { x: 1157, y: 1330 },
      ambank: { x: 1157, y: 1396 },
      touchngo: { x: 1157, y: 1468 },
      maybank: { x: 850, y: 1468 }
    };

    function drawCheckMark(ctx, x, y) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 20, y + 20);
      ctx.lineTo(x + 50, y - 20);
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 5;
      ctx.stroke();
    }

    // Draw check marks based on the payment method
    if (paymentMethods.includes(paymentMethod.toLowerCase())) {
      drawCheckMark(ctx, coords[paymentMethod.toLowerCase()].x, coords[paymentMethod.toLowerCase()].y);
    }

    // Write the initial image to a file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(__dirname, generatedReceiptUrl), buffer);

    // Fetch and update the last receipt ID
    const [result] = await db.query('SELECT last_id FROM last_receipt_id LIMIT 1');
    const lastId = result[0].last_id; // Get the last receipt ID (as a string)
    const newReceiptId = (parseInt(lastId) + 1).toString().padStart(10, '0'); // Increment and format as a 10-digit string

    // Update the receipt ID in the image
    ctx.fillText(newReceiptId, 1907, 348); // Fill in the actual Receipt ID

    // Write the updated image again
    const finalBuffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(__dirname, generatedReceiptUrl), finalBuffer);

    // Insert receipt data into the database
    const insertQuery =
      'INSERT INTO receipts (receipt_id, received_from, contact_number, sum_ringgit, rm, payment_method, receipt_file, generated_receipt, added_by, remarks, collectedBy) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    
    await db.query(insertQuery, [newReceiptId, receivedFrom, contactNumber, sumRinggit, rm, paymentMethod, receiptFile, generatedReceiptUrl, userId, remarks, collectedBy]);

    // Update the last_receipt_id table
    await db.query('UPDATE last_receipt_id SET last_id = ?', [newReceiptId]);

    // Send email with receipt
    const mailOptions = {
      from: 'noreply@brighttospecialhome.com',
      to: 'brighttospecialhome99@gmail.com ',
      subject: 'New Receipt Submitted',
      text: `
      A new receipt has been submitted successfully.

      Details:
      Received From: ${receivedFrom}
      Contact Number: ${contactNumber}
      Sum (Ringgit): ${sumRinggit}
      RM: ${rm}
      Payment Method: ${paymentMethod}
      Receipt ID: ${newReceiptId}
      Remarks: ${remarks}
      Date: ${formattedDate}
      CollectedBy:  ${collectedBy}
    `,
      attachments: [
        {
          filename: `receipt_${newReceiptId}.png`,
          path: path.join(__dirname, generatedReceiptUrl) // Path to the generated receipt
        }
      ]
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(200).send({ message: 'Receipt submitted, but failed to send email.' });
      }

      // Return success response with the image URL
      res.status(200).send({ message: 'Receipt submitted successfully, and email sent!', generatedReceiptUrl });
    });
  } catch (error) {
    console.error('Error processing receipt:', error);
    res.status(500).send({ message: 'Error processing receipt' });
  }
});




app.get('/receipts', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM receipts ORDER BY updated_at DESC');
    res.json(results); // Send only the results (the data)
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/deletedReceipts', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM deleted_receipts ORDER BY updated_at DESC');
    res.json(results); // Send only the results (the data)
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// Route to delete a receipt
app.post('/receipts/:id/delete', async (req, res) => {
  const receiptId = req.params.id;

  try {
    // Fetch the receipt details before deletion
    const [result] = await db.query('SELECT * FROM receipts WHERE receipt_id = ?', [receiptId]);
    
    if (result.length === 0) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    const receipt = result[0];

    // Insert receipt into deleted_receipts
    await db.query('INSERT INTO deleted_receipts SET ?', receipt);

    // Delete receipt from receipts
    await db.query('DELETE FROM receipts WHERE receipt_id = ?', [receiptId]);

    res.status(200).json({ message: 'Receipt deleted and moved to deleted_receipts' });
  } catch (err) {
    console.error('Error during receipt deletion:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

app.post('/updateReceipt/:id', upload.single('receiptFile'), async (req, res) => {
  const receiptId = req.params.id;
  const { receivedFrom, contactNumber, sumRinggit, rm, paymentMethod, remarks, collectedBy } = req.body;
  const receiptFile = req.file ? req.file.path : null; // New user-provided receipt URL
  const generatedReceiptUrl = `uploads/receipt_${Date.now()}.jpg`; // URL for the generated receipt
  const templateImagePath = path.join(__dirname, 'uploads', 'template.jpg'); // Path to the template file

  try {
    // Fetch the existing receipt details
    const [existingReceipt] = await db.query('SELECT receipt_file FROM receipts WHERE receipt_id = ?', [receiptId]);

    if (!existingReceipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    // Check if a new receipt file is uploaded
    if (receiptFile) {
      // Delete the existing receipt file if it exists
      const existingFilePath = existingReceipt.receipt_file;
      if (existingFilePath && fs.existsSync(existingFilePath)) {
        fs.unlinkSync(existingFilePath);
      }
    }

    // Load the template image first
    const templateImage = await loadImage(templateImagePath);

    // Create a new canvas with the dimensions of the loaded image
    const canvas = createCanvas(templateImage.width, templateImage.height);
    const ctx = canvas.getContext('2d');

    // Draw the receipt template image
    ctx.drawImage(templateImage, 0, 0, templateImage.width, templateImage.height);

    // Set text properties
    ctx.fillStyle = 'black'; // Text color
    ctx.font = '46px Arial'; // Font size and family

    // Get the current date
    const currentDate = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const formattedDate = currentDate.toLocaleDateString('en-GB', options); // 'en-GB' for dd/mm/yyyy format

    // Overlay the text on the image
    ctx.fillText(receivedFrom, 484, 730);
    ctx.fillText(contactNumber, 447, 888);
    ctx.fillText(sumRinggit, 530, 1025);
    ctx.fillText(rm, 344, 1405);
    ctx.fillText(formattedDate, 1899, 610); // Add current date
    ctx.fillText(remarks, 350, 1188); // Add remarks

    // Checkmark the payment method
    const paymentMethods = ['cash', 'cdm', 'rhbbank', 'ambank', 'touchngo', 'maybank'];
    const coords = {
      cash: { x: 844, y: 1333 },
      cdm: { x: 850, y: 1403 },
      rhbbank: { x: 1157, y: 1330 },
      ambank: { x: 1157, y: 1396 },
      touchngo: { x: 1157, y: 1468 },
      maybank: { x: 850, y: 1468 }
    };

    function drawCheckMark(ctx, x, y) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 20, y + 20);
      ctx.lineTo(x + 50, y - 20);
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 5;
      ctx.stroke();
    }

    // Draw check marks based on the payment method
    if (paymentMethods.includes(paymentMethod.toLowerCase())) {
      drawCheckMark(ctx, coords[paymentMethod.toLowerCase()].x, coords[paymentMethod.toLowerCase()].y);
    }

    // Write the initial image to a file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(__dirname, generatedReceiptUrl), buffer);

    // Fetch and update the last receipt ID
    const [result] = await db.query('SELECT last_id FROM last_receipt_id LIMIT 1');
    const lastId = result[0].last_id; // Get the last receipt ID (as a string)
    const newReceiptId = (parseInt(lastId) + 1).toString().padStart(10, '0'); // Increment and format as a 10-digit string

    // Update the receipt ID in the image
    ctx.fillText(newReceiptId, 1907, 348); // Fill in the actual Receipt ID

    // Write the updated image again
    const finalBuffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(__dirname, generatedReceiptUrl), finalBuffer);

    // Update the receipt data in the database
    const updateQuery =
      'UPDATE receipts SET received_from = ?, contact_number = ?, sum_ringgit = ?, rm = ?, payment_method = ?, receipt_file = ?, generated_receipt = ?, remarks = ?, collectedBy = ? WHERE receipt_id = ?';

    await db.query(updateQuery, [
      receivedFrom,
      contactNumber,
      sumRinggit,
      rm,
      paymentMethod,
      receiptFile || existingReceipt.receipt_file,
      generatedReceiptUrl,
      remarks,
      collectedBy,
      receiptId,
    ]);

    // Update the last_receipt_id table
    await db.query('UPDATE last_receipt_id SET last_id = ?', [newReceiptId]);

    // Send email with receipt
    const mailOptions = {
      from: 'noreply@brighttospecialhome.com',
      to: 'brighttospecialhome99@gmail.com',
      subject: 'Receipt Updated',
      text: `
      A receipt has been updated successfully.

      Details:
      Received From: ${receivedFrom}
      Contact Number: ${contactNumber}
      Sum (Ringgit): ${sumRinggit}
      RM: ${rm}
      Payment Method: ${paymentMethod}
      Receipt ID: ${newReceiptId}
      Remarks: ${remarks}
      Date: ${formattedDate}
      CollectedBy:  ${collectedBy}
    `,
      attachments: [
        {
          filename: `receipt_${newReceiptId}.png`,
          path: path.join(__dirname, generatedReceiptUrl) // Path to the generated receipt
        }
      ]
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(200).send({ message: 'Receipt updated, but failed to send email.' });
      }

      // Return success response with the image URL
      res.status(200).send({ message: 'Receipt updated successfully, and email sent!', generatedReceiptUrl });
    });
  } catch (error) {
    console.error('Error updating receipt:', error);
    res.status(500).send({ message: 'Error updating receipt' });
  }
});

// Route to get receipt details by ID
app.get('/receipts/:id', async (req, res) => {
  const receiptId = req.params.id;

  try {
    // Fetch the receipt details for the given receipt ID
    const [results] = await db.query('SELECT * FROM receipts WHERE receipt_id = ?', [receiptId]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    res.json(results[0]);
  } catch (err) {
    console.error('Database query error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to restore a deleted receipt
app.post('/receipts/:id/restore', async (req, res) => {
  const receiptId = req.params.id;

  try {
    // Fetch deleted receipt details
    const [result] = await db.query('SELECT * FROM deleted_receipts WHERE receipt_id = ?', [receiptId]);
    
    if (result.length === 0) {
      return res.status(404).json({ message: 'Receipt not found in deleted_receipts' });
    }

    const receipt = result[0];

    // Determine if the original ID is available or get the next available ID
    const [existing] = await db.query('SELECT receipt_id FROM receipts WHERE receipt_id = ?', [receiptId]);

    const finalId = existing.length > 0 ? await findNextAvailableId() : receiptId; // Make sure `findNextAvailableId` returns a Promise
    receipt.receipt_id = finalId;

    const originalPath = receipt.generated_receipt;

    // Check if generated_receipt path exists and update file name
    if (originalPath) {
      const newPath = path.join(path.dirname(originalPath), `receipt_${finalId}.jpg`);
      await fs.promises.rename(originalPath, newPath).catch(err => console.warn('Failed to rename file:', err));
      receipt.generated_receipt = newPath;
    }

    // Insert receipt back into receipts table
    await db.query('INSERT INTO receipts SET ?', receipt);

    // Remove from deleted_receipts
    await db.query('DELETE FROM deleted_receipts WHERE receipt_id = ?', [receiptId]);

    res.status(200).json({ message: 'Receipt restored', receiptId: finalId });
  } catch (err) {
    console.error('Error during receipt restoration:', err);
    res.status(500).json({ message: 'Database error' });
  }
});


const otpStore={};
// Placeholder for verifying OTP and resetting the password
// Send OTP to user's email
app.post('/sendotp', async (req, res) => {
  const { email } = req.body;

  try {
    // Execute a query to find the user by email
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP and store it with an expiration time
    const otp = generateOtp();
    otpStore[email] = {
      otp,
      expires: Date.now() + 10 * 60 * 1000 // OTP valid for 10 minutes
    };

    // Send OTP via email
    const mailOptions = {
      from: 'noreply@brighttospecialhome.com',
      to: email,
      subject: 'Your OTP for Password Reset',
      text: `Your OTP for resetting the password is: ${otp}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'OTP sent to your email successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Check if OTP exists and is valid
  const storedOtpInfo = otpStore[email];
  if (!storedOtpInfo || storedOtpInfo.otp !== otp || Date.now() > storedOtpInfo.expires) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }

  try {
    // Hash the new password using bcrypt
    const hashedPassword = md5(newPassword);
    
    // Update the user's password in the database
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
    
    // Remove the OTP after successful reset
    delete otpStore[email];

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
