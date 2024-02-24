const { render } = require('ejs');
const express = require('express');
const mongoose = require('mongoose');
var app = express();

const dbconn = 'mongodb+srv://meyran99:sJ6gGMpJMQTrNbCd@cluster0.z8j0ub1.mongodb.net/school?retryWrites=true&w=majority';
mongoose.connect(dbconn, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  id: Number,
  name: String,
  age: Number,
  subject: String,
  instructor: String,
  fee: Number,
  startdate: String,
  status: String,
});

const User = mongoose.model('User', userSchema);

const teacherSchema = new mongoose.Schema({
  id: Number,
  instructors_name: String,
  pay: Number,
  subject: String,
});




const Teacher = mongoose.model('teacher', teacherSchema);



app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.text());
app.use(express.static('views'));
app.use(express.static('css'));
app.set('view engine', 'ejs');


app.get('/', async (req, res) => {
  try {
    const totalstd = await User.countDocuments();
    const totaltr_sub = await Teacher.countDocuments();
    const totalrevenue = await Teacher.aggregate([{ $group: { _id: null, total: { $sum: '$pay' } } }]);
    res.render('index', { totalstd, totaltr_sub, totalrevenue });
  } catch (error) {
      console.error('Error fetching users:', error)
  }
});

app.get('/table', async (req, res) => {
  try {
    const users = await User.find();
    const message = req.query.message || '';
    res.render('userTable', { users, message });
  } catch (error) {
    console.error('Error fetching users:', error);
  }
});
app.get('/updateForm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.render('updateUser', { user });
  } catch (err) {
    console.error('Error updating user:', err);
  }

});

app.get('/register', (req, res) => {
  res.render('newUser', { title: 'register' })
})

app.get('/about', (req, res) => {
  res.render('about', { title: 'about' })
})





app.post('/addUser', async (req, res) => {
  const { id, name, age, subject, startdate, status } = req.body;
  try {
    const existingUser = await User.findOne({ id: id });


    if (existingUser) {
      const message = 'User with id ' + id + ' already exists in the database.';
      res.redirect('/table?message=' + encodeURIComponent(message));
    } else {
      const teacher = await Teacher.findOne({ subject: subject });
      console.log(teacher);
      const user = new User({
        id, name, age, subject,
        instructor: teacher ? teacher.instructors_name : 'Unknown',
        fee: teacher ? teacher.pay : 0,
        startdate,
        status,
      });

      await user.save();
      console.log('user saved successfully:', name);
      res.redirect('/table');
    }
    // console.log('Request body:', req.body);

  } catch (err) {
    console.error('Error saving user:', err);
  }
});

app.post('/updateUser', async (req, res) => {
  try {
    const { id, name, age, subject, status } = req.body;
    // console.log(req.body);  
    // console.log(id);        
    // const idd = mongoose.Types.ObjectId(id);
    const teacher = await Teacher.findOne({ subject: subject });

    console.log(teacher);
    const updatedUser = await User.findOneAndUpdate({ id: id }, {
      name, age, subject,
      instructor: teacher ? teacher.instructors_name : 'Unknown',
      fee: teacher ? teacher.pay : 0,
      status,

    }, { new: true });


    if (!updatedUser) {
      return res.status(404).send('user not found');
    }

    console.log('user updated successfully:', updatedUser);

    // res.status(200).json(updatedUser);
    res.redirect('/table')
  } catch (err) {
    console.error('Error updating user:', err);
  }
});



app.get('/deleteUser/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    console.log('user deleted successfully:', id);
    res.redirect('/table');
  } catch (err) {
    console.error('Error deleting user:', err);
  }
});

app.use((req, res) => {
  res.status(404).render('404', { title: '404' })
})


app.listen(9000, () => {
  console.log(`Server listening at http://localhost:9000`);
});