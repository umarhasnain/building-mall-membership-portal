import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, addDoc, collection } from "firebase/firestore";

export async function creditCommission(referralCode, amount) {

  const membersRef = collection(db, "members");

  const q = await getDocs(membersRef);

  let sponsor = null;

  q.forEach((docSnap) => {
    if (docSnap.data().referralCode === referralCode) {
      sponsor = { id: docSnap.id, ...docSnap.data() };
    }
  });

  if (!sponsor) return;

  const commission = amount * 0.05;

  const walletRef = doc(db, "members", sponsor.id);

  await updateDoc(walletRef, {
    "wallet.balance": (sponsor.wallet?.balance || 0) + commission,
    "wallet.totalEarned": (sponsor.wallet?.totalEarned || 0) + commission,
  });

  await addDoc(collection(db, "transactions"), {
    userId: sponsor.id,
    amount: commission,
    type: "referral",
    createdAt: new Date(),
  });
}
