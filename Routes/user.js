import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'
import { User } from '../models/User.js'
const router = express.Router();
router.use(express.json());

router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
        username,
        email,
        password: hashedPassword,
        repeatPassword: hashedPassword
    });
    await newUser.save();
    res.json({ status: true, message: 'User created successfully' });


})
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid password' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.KEY,
        {
            expiresIn: '1h' // Token expiration time
        })
    res.cookie('token', token, { httpOnly: true, maxAge: 360000 })
    return res.json({ status: true, message: 'login succesfulluy' })
})
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not registered" });
      }
  
      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, process.env.KEY, { expiresIn: '1h' });
  
      // Create Nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'harishmano98@gmail.com',
          pass: 'jbjilmeolccbhhpp'
        }
      });
  
      // Construct email options
      const mailOptions = {
        from: 'harishmano98@gmail.com',
        to: email,
        subject: 'Reset password',
        text: `Click the following link to reset your password: https://password-reset-flo-fe-harish.netlify.app/resetPassword/${token}`
      };
  
      // Send email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).json({ message: "Failed to send password reset email" });
        } else {
          console.log("Password reset email sent:", info.response);
          return res.status(200).json({ message: "Password reset email sent successfully" });
        }
      });
  
    } catch (error) {
      console.error("Error occurred:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
  router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
  
    try {
      // Check if the token is valid (you may want to implement this logic)
  
      // Decode the token and get user ID
      const decodedToken = jwt.verify(token, process.env.KEY);
      const userId = decodedToken.userId;
  
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Update the user's password in the database
      await User.findByIdAndUpdate(userId, { password: hashedPassword });
  
      return res.status(200).json({ status: true, message: "Password reset successfully." });
    } catch (error) {
      console.error("Error occurred while resetting password:", error);
      return res.status(500).json({ status: false, message: "Failed to reset password. Please try again later." });
    }
  });









export { router as UserRouter }