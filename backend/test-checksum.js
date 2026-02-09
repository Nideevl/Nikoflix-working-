// // test-checksum.js
// import PaytmChecksum from 'paytmchecksum';

// const params = {
//   MID: 'iAKmTF21742672263619',
//   ORDER_ID: 'ORD_1767520458622',
//   CUST_ID: 'e5421dae-3f43-4166-88bc-25ed4db01ced',
//   CHANNEL_ID: 'WEB',
//   INDUSTRY_TYPE_ID: 'Retail',
//   WEBSITE: 'WEBSTAGING',
//   TXN_AMOUNT: '2.00',
//   CALLBACK_URL: 'NEXT_PUBLIC_API_BASE/payments/paytm/callback'
// };

// // Replace with your actual merchant key
// const MERCHANT_KEY = '6cMj&dY4AQzS7mX#';

// async function test() {
//   try {
//     // Generate checksum
//     const checksum = await PaytmChecksum.generateSignature(
//       params,
//       MERCHANT_KEY
//     );
    
//     console.log('Generated checksum:', checksum);
//     console.log('Your checksum:', 'qR2xCRw7x49UOJc4RWoftKKB+kf1osnTcx9kyG5u8pnDwTsNc41297fKqrdJpwiT7DWjw0mP27tM2lPYVEpB8jE8q/4c8QZhamKSqcCVYNA=');
//     console.log('Match:', checksum === 'qR2xCRw7x49UOJc4RWoftKKB+kf1osnTcx9kyG5u8pnDwTsNc41297fKqrdJpwiT7DWjw0mP27tM2lPYVEpB8jE8q/4c8QZhamKSqcCVYNA=');
    
//     // Verify checksum
//     const isValid = PaytmChecksum.verifySignature(
//       params,
//       MERCHANT_KEY,
//       'qR2xCRw7x49UOJc4RWoftKKB+kf1osnTcx9kyG5u8pnDwTsNc41297fKqrdJpwiT7DWjw0mP27tM2lPYVEpB8jE8q/4c8QZhamKSqcCVYNA='
//     );
    
//     console.log('Is valid?', isValid);
    
//   } catch (error) {
//     console.error('Error:', error.message);
//   }
// }

// test();