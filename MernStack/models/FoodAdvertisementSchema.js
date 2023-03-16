const mongoose = require('mongoose');

//Advertisements schema
const FoodAdvertisementSchema = new mongoose.Schema({
    description: { type: String, required: true },
    tokenAmount: { type: Number, required: true },
});

module.exports = mongoose.models.FoodAdvertisement || mongoose.model('FoodAdvertisement', FoodAdvertisementSchema);