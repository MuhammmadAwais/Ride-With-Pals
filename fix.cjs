const fs = require('fs');
let myPurchases = fs.readFileSync('src/features/public-club/pages/MyPurchases.tsx', 'utf8');
myPurchases = myPurchases.replace(/MapPin,\s*/, '').replace(/Calendar,\s*/, '');
fs.writeFileSync('src/features/public-club/pages/MyPurchases.tsx', myPurchases);

let wallet = fs.readFileSync('src/features/ClubSide/Wallet.tsx', 'utf8');
wallet = wallet.replace(/Download,\s*/, '');
wallet = wallet.replace(/Wallet,\s*/, '');
wallet = wallet.replace(/WalletIcon/g, 'Wallet');
wallet = wallet.replace(/"7D"/g, '"90D"');
fs.writeFileSync('src/features/ClubSide/Wallet.tsx', wallet);

let athleteProfile = fs.readFileSync('src/features/auth/components/AthleteProfileForm.tsx', 'utf8');
athleteProfile = athleteProfile.replace(/AlertCircle,\s*/, '');
fs.writeFileSync('src/features/auth/components/AthleteProfileForm.tsx', athleteProfile);

let product = fs.readFileSync('src/features/ClubSide/Product.tsx', 'utf8');
product = product.replace(/,\s*useMemo/, '');
fs.writeFileSync('src/features/ClubSide/Product.tsx', product);

let profileSetup = fs.readFileSync('src/features/club/ProfileSetup.tsx', 'utf8');
profileSetup = profileSetup.replace(/import React, { useState } from 'react';/, 'import { useState } from "react";');
profileSetup = profileSetup.replace(/const { getFieldProps, touched, errors, values, setFieldValue, isSubmitting, isTouched } = formik;/, 'const { getFieldProps, touched, errors, values, setFieldValue, isSubmitting } = formik;');
fs.writeFileSync('src/features/club/ProfileSetup.tsx', profileSetup);

console.log('Fixed simple errors');
