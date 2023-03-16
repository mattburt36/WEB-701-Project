//Beneficiary schema
const mongoose = require('mongoose');

const beneficiaryMemberSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    tokens: { type: Number, default: 0 },
});

module.exports = mongoose.models.BeneficiaryMember || mongoose.model('BeneficiaryMember', beneficiaryMemberSchema);