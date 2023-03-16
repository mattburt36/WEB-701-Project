const express = require('express');
const router = express.Router();
const FoodAdvertisement = require('../models/FoodAdvertisementSchema');
const CharityMember = require('../models/CharityMemberSchema');
const BeneficiaryMember = require('../models/BeneficiaryMemberSchema');

// Create a charity member
router.post('/charitymembers', async (req, res) => {
  const newCharityMember = req.body;

  try {
    // Save the new charity member to the database
    const charityMember = await CharityMember.create(newCharityMember);
    res.status(201).send(charityMember);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating charity member');
  }
});

//Login charity member
router.post('/charitymembers/login', async (req, res) => {
  const { email, password} = req.body;

  try {
    // Find the charity member with the given email and password and update their login status to "online"
    const charityMember = await CharityMember.findOneAndUpdate({ email, password }, { loginStatus: 'online' }, { new: true });

    if (charityMember) {
      res.status(200).send(charityMember);
    } else {
      res.status(401).send('Invalid email or password');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging in charity member');
  }
});
    
// Log out a charity member
router.post('/charitymembers/logout', async (req, res) => {
  const { email } = req.body;

  try {
    const charityMember = await CharityMember.findOne({ email });
    if (!charityMember) {
      return res.status(404).json({ message: 'Charity member not found.' });
    }

    charityMember.loginStatus = 'offline';
    await charityMember.save();

    return res.status(200).json({ message: 'Charity member logged out successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while logging out the charity member.' });
  }
});

// Delete a charity member
router.delete('/charitymembers/:memberID', async (req, res) => {
  const { memberID } = req.params;
  
  try {
  // Delete the charity member with the given ID from the database
  await CharityMember.findByIdAndDelete(memberID);
  res.status(204).send();
  } catch (error) {
  console.error(error);
  res.status(500).send('Error deleting charity member');
  }
  });
  
// Edit a charity member
router.put('/charitymembers/:memberID', async (req, res) => {
  const { memberID } = req.params;
  const updatedCharityMember = req.body;
  
  try {
  // Find the charity member with the given ID and update their information
  const charityMember = await CharityMember.findByIdAndUpdate(memberID, updatedCharityMember, { new: true });
  res.status(200).send(charityMember);
  } catch (error) {
  console.error(error);
  res.status(500).send('Error updating charity member');
  }
  });

  
// Add a food advertisement
router.post('/charitymembers/:memberID/advertisements', async (req, res) => {
  const { memberID } = req.params;
  const newFoodAdvertisement = req.body;
  
  try {
  // Find the charity member with the given ID and create a new food advertisement for them
  const charityMember = await CharityMember.findById(memberID);
  const foodAdvertisement = new FoodAdvertisement(newFoodAdvertisement);
  charityMember.advertisements.push(foodAdvertisement);
  await charityMember.save();
  res.status(201).send(foodAdvertisement);
  } catch (error) {
  console.error(error);
  res.status(500).send('Error creating food advertisement');
  }
  });

  
// Remove a food advertisement
router.delete('/charitymembers/:memberID/advertisements/:advertisementID', async (req, res) => {
  const { memberID, advertisementID } = req.params;
  
  try {
  // Find the charity member with the given ID and remove the food advertisement with the given ID from their advertisements array
  const charityMember = await CharityMember.findById(memberID);
  charityMember.advertisements.id(advertisementID).remove();
  await charityMember.save();
  res.status(204).send();
  } catch (error) {
  console.error(error);
  res.status(500).send('Error deleting food advertisement');
  }
  });

  
// Edit a food advertisement
router.put('/charitymembers/:memberID/advertisements/:advertisementID', async (req, res) => {
  const { memberID, advertisementID } = req.params;
  const updatedFoodAdvertisement = req.body;
  
  try {
  // Find the charity member with the given ID and update the food advertisement with the given ID in their advertisements array
  const charityMember = await CharityMember.findById(memberID);
  const foodAdvertisement = charityMember.advertisements.id(advertisementID);
  Object.assign(foodAdvertisement, updatedFoodAdvertisement);
  await charityMember.save();
  res.status(200).send(foodAdvertisement);
  } catch (error) {
  console.error(error);
  res.status(500).send('Error updating food advertisement');
  }
  });

  
// Approve communication
router.get('/charitymembers/:memberID', async (req, res) => {
  const { memberID } = req.params;
  const { phoneNumber, email } = req.body;

  try {
    const charityMember = await CharityMember.findById(memberID);
    if (!charityMember) {
      return res.status(404).json({ message: 'Charity member not found.' });
    }

    // Update the communication information if provided
    if (phoneNumber) {
      charityMember.phoneNumber = phoneNumber;
    }
    if (email) {
      charityMember.email = email;
    }
    await charityMember.save();

    return res.status(200).json(charityMember);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while approving communication.' });
  }
});


router.post('/beneficiarymembers', async (req, res) => {
  try {
    const newBeneficiaryMember = new BeneficiaryMember(req.body);
    const savedBeneficiaryMember = await newBeneficiaryMember.save();
    res.status(201).json(savedBeneficiaryMember);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});


router.post('/beneficiarymembers/login', async (req, res) => {
  try {
    const beneficiaryMember = await BeneficiaryMember.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await beneficiaryMember.generateAuthToken();
    res.json({ beneficiaryMember, token });
  } catch (error) {
    console.error(error);
    res.status(401).send('Unable to log in');
  }
});


router.post('/beneficiarymembers/logout', async (req, res) => {
  try {
    req.beneficiaryMember.tokens = req.beneficiaryMember.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.beneficiaryMember.save();
    res.send();
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});


router.delete('/beneficiarymembers/:beneficiaryID', async (req, res) => {
  try {
    const beneficiaryMember = await BeneficiaryMember.findByIdAndDelete(
      req.params.beneficiaryID
    );
    if (!beneficiaryMember) {
      return res.status(404).send('Beneficiary member not found');
    }
    res.send(beneficiaryMember);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});


router.put('/beneficiarymembers/:beneficiaryID', async (req, res) => {
  try {
    const beneficiaryMember = await BeneficiaryMember.findByIdAndUpdate(
      req.params.beneficiaryID,
      req.body,
      { new: true, runValidators: true }
    );
    if (!beneficiaryMember) {
      return res.status(404).send('Beneficiary member not found');
    }
    res.send(beneficiaryMember);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});


router.post('/:beneficiaryID/requestCommunication', async (req, res) => {
  try {
    const beneficiaryID = req.params.beneficiaryID;
    const { advertisementID, tokenAmount } = req.body;

    // check if beneficiary exists
    const beneficiary = await BeneficiaryMember.findById(beneficiaryID);
    if (!beneficiary) {
      return res.status(404).json({ message: 'Beneficiary not found' });
    }

    // check if advertisement exists
    const advertisement = await CharityMemberAdvertisement.findById(advertisementID);
    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }

    // check if advertisement has enough tokens
    if (advertisement.tokenAmount < tokenAmount) {
      return res.status(400).json({ message: 'Advertisement does not have enough tokens' });
    }

    // create a communication request
    const communicationRequest = new CommunicationRequest({
      beneficiaryID: beneficiaryID,
      advertisementID: advertisementID,
      tokenAmount: tokenAmount,
      status: 'Pending'
    });

    await communicationRequest.save();

    // update advertisement token amount
    advertisement.tokenAmount -= tokenAmount;
    await advertisement.save();

    res.status(201).json({ message: 'Communication request created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


router.put('/api/beneficiarymembers/:beneficiaryID/confirmGoods', async (req, res) => {
  try {
    const beneficiaryID = req.params.beneficiaryID;
    const advertisementID = req.body.advertisementID;
    const tokenAmount = req.body.tokenAmount;

    // Check if beneficiary member exists
    const beneficiary = await BeneficiaryMember.findById(beneficiaryID);
    if (!beneficiary) {
      return res.status(404).json({ message: 'Beneficiary member not found' });
    }

    // Check if advertisement exists and has enough tokens
    const advertisement = await Advertisement.findById(advertisementID);
    if (!advertisement) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    if (advertisement.tokenAmount < tokenAmount) {
      return res.status(400).json({ message: 'Not enough tokens for this advertisement' });
    }

    // Update advertisement and beneficiary member token balance
    advertisement.tokenAmount -= tokenAmount;
    beneficiary.tokenBalance += tokenAmount;
    await advertisement.save();
    await beneficiary.save();

    return res.status(200).json({ message: 'Goods confirmed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;