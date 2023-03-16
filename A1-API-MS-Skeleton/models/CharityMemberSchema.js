const mongoose = require('mongoose');

//Charity member schema
const CharityMemberSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    loginStatus: { type: String, default: 'offline' },
    advertisements: [
      {
        description: { type: String, required: true },
        tokenAmount: { type: Number, required: true },
      }
    ]
});

module.exports = mongoose.models.CharityMember || mongoose.model('CharityMember', CharityMemberSchema);