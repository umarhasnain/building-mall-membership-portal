"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  // Points logic based on plan
  const planPoints = {
    annual: 2000,
    monthly: 800,
    representative: 0,
  };

  const planPrice = {
    annual: "$720 / Year",
    monthly: "$60 / Month",
    representative: "Ask a Rep",
  };

  useEffect(() => {
    let unsubscribeSnapshot;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "members", user.uid);

        // Real-time listener
        unsubscribeSnapshot = onSnapshot(docRef, async (docSnap) => {
          if (docSnap.exists()) {
            let data = docSnap.data();

            // Dynamic points update based on plan
            const expectedPoints = planPoints[data.plan] || 0;
            if (data.points !== expectedPoints) {
              await updateDoc(docRef, { points: expectedPoints });
              data.points = expectedPoints;
            }

            setMember(data);
          } else {
            alert("Member data not found!");
            signOut(auth);
            router.push("/membership");
          }
          setLoading(false);
        });
      } else {
        router.push("/membership");
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/membership");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-indigo-50 via-white to-purple-50">
        <p className="text-gray-600 text-xl animate-pulse">Loading your membership...</p>
      </div>
    );

  const benefits = [
    "Exclusive pricing on off-lease buildings",
    "12 months same-as-cash financing",
    "Transport & setup discounts",
    "Early access to refurbished structures",
    "Earn points for referrals & feedback",
    "Special member-only offers & events",
  ];

  const quickActions = [
    { name: "Refer a Friend", color: "bg-indigo-500", hover: "hover:bg-indigo-600" },
    { name: "Upgrade Plan", color: "bg-purple-500", hover: "hover:bg-purple-600" },
    { name: "View Off-Lease Buildings", color: "bg-green-500", hover: "hover:bg-green-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Welcome, {member?.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              Membership ID:{" "}
              <span className="font-medium text-indigo-700">{member?.memberId}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-3 rounded-2xl shadow hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Membership Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-2xl rounded-3xl p-6 border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0"
        >
          <div>
            <p className="text-gray-700 font-medium">Membership Plan</p>
            <p className="mt-1 text-xl font-bold text-indigo-800">
              {member?.plan ? member.plan.charAt(0).toUpperCase() + member.plan.slice(1) : "-"} (
              {planPrice[member?.plan] || "-"})
            </p>
          </div>

          <div>
            <p className="text-gray-700 font-medium">Membership Status</p>
            <p
              className={`mt-1 text-xl font-bold ${
                member?.plan === "representative"
                  ? "text-yellow-500"
                  : "text-green-600"
              }`}
            >
              {member?.plan === "representative" ? "Pending Approval" : "Active"}
            </p>
          </div>

          <div>
            <p className="text-gray-700 font-medium">Points</p>
            <p className="text-indigo-800 font-bold text-2xl">{member?.points || 0} pts</p>
            <div className="w-48 h-3 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <div
                className="h-3 bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((member?.points / 2000) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Interests */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white shadow-2xl rounded-3xl p-6 border border-gray-200"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Interests</h2>
          <div className="flex flex-wrap gap-3">
            {member?.interests?.length > 0 ? (
              member.interests.map((i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-purple-100 text-purple-800 font-medium rounded-full shadow-md hover:shadow-lg transition"
                >
                  {i}
                </span>
              ))
            ) : (
              <p className="text-gray-600">No interests selected.</p>
            )}
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white shadow-2xl rounded-3xl p-6 border border-gray-200"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Loyalty Benefits</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((b, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                className="p-4 border-l-4 border-indigo-500 rounded-xl bg-indigo-50 shadow-sm hover:shadow-md transition"
              >
                {b}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white shadow-2xl rounded-3xl p-6 border border-gray-200"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            {quickActions.map((action) => (
              <motion.button
                key={action.name}
                whileHover={{ scale: 1.05 }}
                className={`${action.color} ${action.hover} text-white font-semibold px-6 py-3 rounded-2xl shadow`}
              >
                {action.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Contact / Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white shadow-2xl rounded-3xl p-6 border border-gray-200 text-center"
        >
          <p className="text-gray-700">
            Need help? Contact our support team at{" "}
            <span className="text-indigo-600 font-medium">info@buildingmall.com</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
