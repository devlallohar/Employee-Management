const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// MongoDB Schema
const employeeSchema = new mongoose.Schema({
  name: String,
  position: String,
  department: String
});
const Employee = mongoose.model('Employee', employeeSchema);

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
};

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    next();
  });
};

// Handlers
module.exports.createEmployee = async (event) => {
  await connectDB();
  const { name, position, department } = JSON.parse(event.body);
  const employee = new Employee({ name, position, department });
  await employee.save();
  return {
    statusCode: 201,
    body: JSON.stringify(employee)
  };
};

module.exports.getEmployee = async (event) => {
  await connectDB();
  const employee = await Employee.findById(event.pathParameters.id);
  if (!employee) return { statusCode: 404, body: JSON.stringify({ error: 'Employee not found' }) };
  return {
    statusCode: 200,
    body: JSON.stringify(employee)
  };
};

module.exports.listEmployees = async () => {
  await connectDB();
  const employees = await Employee.find();
  return {
    statusCode: 200,
    body: JSON.stringify(employees)
  };
};

module.exports.updateEmployee = async (event) => {
  await connectDB();
  const { name, position, department } = JSON.parse(event.body);
  const employee = await Employee.findByIdAndUpdate(
    event.pathParameters.id,
    { name, position, department },
    { new: true }
  );
  if (!employee) return { statusCode: 404, body: JSON.stringify({ error: 'Employee not found' }) };
  return {
    statusCode: 200,
    body: JSON.stringify(employee)
  };
};

module.exports.deleteEmployee = async (event) => {
  await connectDB();
  const employee = await Employee.findByIdAndDelete(event.pathParameters.id);
  if (!employee) return { statusCode: 404, body: JSON.stringify({ error: 'Employee not found' }) };
  return { statusCode: 204 };
};

module.exports.generateToken = async (event) => {
  // For simplicity, no user authentication; in real scenarios, validate user credentials
  const token = jwt.sign({ user: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return {
    statusCode: 200,
    body: JSON.stringify({ token })
  };
};

// Apply authentication middleware for CRUD operations
module.exports.createEmployee.handler = authenticateToken(module.exports.createEmployee.handler);
module.exports.getEmployee.handler = authenticateToken(module.exports.getEmployee.handler);
module.exports.listEmployees.handler = authenticateToken(module.exports.listEmployees.handler);
module.exports.updateEmployee.handler = authenticateToken(module.exports.updateEmployee.handler);
module.exports.deleteEmployee.handler = authenticateToken(module.exports.deleteEmployee.handler);
