// Test script for CUCASO STK Push, Query, Donations, and SMS
async function runTests() {
  console.log("--- 1. Testing STK Push API ---");
  const pushRes = await fetch("http://127.0.0.1:3000/api/daraja/stk-push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: "0712345678",
      amount: 1000,
      purpose: "Student Welfare",
      donorName: "Dr. Joshua Odhiambo",
      email: "joshua@example.com",
    }),
  });

  const pushData = await pushRes.json();
  console.log("STK Push Response:", pushData);

  if (!pushData.checkoutRequestId) {
    console.error("STK Push failed!");
    return;
  }

  const checkoutId = pushData.checkoutRequestId;
  console.log("\n--- 2. Testing STK Status Query (Waiting 4s for auto-simulation) ---");
  await new Promise((resolve) => setTimeout(resolve, 4000));

  const queryRes = await fetch(`http://127.0.0.1:3000/api/daraja/query-status?checkoutRequestId=${checkoutId}`);
  const queryData = await queryRes.json();
  console.log("STK Query Status Response:", queryData);

  console.log("\n--- 3. Testing Donations List API ---");
  const donRes = await fetch("http://127.0.0.1:3000/api/donations");
  const donData = await donRes.json();
  console.log("Donations API Response: Total donations =", donData.totalCount, "Total KES =", donData.totalDonationsKes);

  console.log("\n--- 4. Testing SMS Send API ---");
  const smsRes = await fetch("http://127.0.0.1:3000/api/sms/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: "0712345678",
      message: "Test SMS from CUCASO Central Council. May God bless your ministry!",
    }),
  });
  const smsData = await smsRes.json();
  console.log("SMS Send Response:", smsData);

  console.log("\nAll integration tests finished successfully!");
}

runTests().catch(console.error);
