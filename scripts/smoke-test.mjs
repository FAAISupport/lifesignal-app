import crypto from "node:crypto";

function makeReferralCode(email){
  const hash = crypto.createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
  return hash.slice(0,10);
}

const code1 = makeReferralCode("Test@Example.com");
const code2 = makeReferralCode("test@example.com");

if(code1 !== code2) {
  console.error("FAIL: referral codes should be deterministic across casing.");
  process.exit(1);
}

if(code1.length !== 10) {
  console.error("FAIL: referral code length should be 10.");
  process.exit(1);
}

console.log("OK: smoke tests passed", {code: code1});
