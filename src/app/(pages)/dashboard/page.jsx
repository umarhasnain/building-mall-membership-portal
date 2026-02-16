"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaUser, FaStar, FaUsers, FaWallet, FaCheckCircle, FaCode } from "react-icons/fa";

const MySwal = withReactContent(Swal);

export default function DashboardPage() {
  const router = useRouter();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  const planPoints = { annual: 2000, monthly: 800, representative: 0 };
  const planPrice = { annual: "$720 / Year", monthly: "$60 / Month", representative: "Ask a Rep" };

  const getLevel = (refCount) => {
    if (refCount >= 30) return "Platinum";
    if (refCount >= 15) return "Gold";
    if (refCount >= 5) return "Silver";
    return "Starter";
  };

  useEffect(() => {
    let unsub;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/membership");
        return;
      }
      const ref = doc(db, "members", user.uid);
      unsub = onSnapshot(ref, (snap) => {
        if (!snap.exists()) return;
        setMember(snap.data());
        setLoading(false);
      });
    });
    return () => {
      unsubAuth();
      if (unsub) unsub();
    };
  }, [router]);

  const copyReferral = () => {
    navigator.clipboard.writeText(member?.referralCode);
    MySwal.fire({
      icon: "success",
      title: "Copied!",
      text: "Referral code copied successfully",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/membership");
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <p className="text-gray-600 text-xl animate-pulse">Loading your dashboard...</p>
    </div>
  );

  if (!member) return null;

  const level = getLevel(member.referrals?.length || 0);
  const chartData = [
    { month: "Jan", referrals: 2 },
    { month: "Feb", referrals: 5 },
    { month: "Mar", referrals: 8 },
    { month: "Apr", referrals: 3 },
  ];
  const leaderboard = [
    { name: "John", refs: 25 },
    { name: "Emma", refs: 18 },
    { name: member.name, refs: member.referrals?.length || 0 },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <FaUser size={50} className="text-indigo-600"/>
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900">Welcome, {member.name}</h1>
              <p className="text-gray-600">Member ID: <span className="font-semibold text-indigo-700">{member.memberId}</span></p>
              <p className="text-sm text-purple-600 font-semibold mt-1">Level: {level}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-linear-to-r from-[#7f5d2b] to-[#7f5d2b] text-white  px-6 py-3 rounded-2xl shadow hover:bg-blue-600 transition">
            Logout
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard title="Plan" value={member.plan} icon={<FaStar size={30} className="text-yellow-500"/>}/>
          <StatCard title="Points" value={`${member.points || 0} pts`} icon={<FaStar size={30} className="text-indigo-500"/>}/>
          <StatCard title="Referrals" value={member.referrals?.length || 0} icon={<FaUsers size={30} className="text-green-500"/>}/>
          <StatCard title="Wallet" value={`$${member.wallet?.balance || 0}`} icon={<FaWallet size={30} className="text-purple-500"/>}/>
        </div>

        {/* REFERRAL CARD */}
        <motion.div whileHover={{ scale: 1.02 }} className="bg-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FaCode className="text-purple-600" size={20}/>
            <h2 className="text-xl font-bold mb-0">Referral Program</h2> 
          </div>
             <p className="text-gray-700">Share your referral code and earn points!</p>
          <div className="flex gap-3 flex-wrap">
            <span className="bg-purple-100 px-4 py-2 rounded-xl font-bold">{member.referralCode}</span>
            <button onClick={copyReferral} className="bg-linear-to-r from-[#7f5d2b] to-[#7f5d2b] text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition">Copy Code</button>
          </div>
        </motion.div>

        {/* ANALYTICS & LEADERBOARD */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div className="bg-white p-6 rounded-3xl shadow-lg">
            <h2 className="font-bold mb-4 text-lg">Referral Analytics</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis dataKey="month"/>
                <YAxis/>
                <Tooltip/>
                <Bar dataKey="referrals" fill="#6366F1"/>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div className="bg-white p-6 rounded-3xl shadow-lg">
            <h2 className="font-bold mb-4 text-lg">Leaderboard</h2>
            {leaderboard.map((u, i) => (
              <div key={i} className="flex justify-between p-3 border-b last:border-none">
                <span>{u.name}</span>
                <span className="font-bold">{u.refs}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* BENEFITS */}
        <motion.div className="bg-white p-6 rounded-3xl shadow-lg">
          <h2 className="font-bold mb-4 text-lg">Membership Benefits</h2>
          <ul className="grid md:grid-cols-2 gap-2">
            <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500"/> Exclusive pricing</li>
            <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500"/> Financing benefits</li>
            <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500"/> Referral rewards</li>
            <li className="flex items-center gap-2"><FaCheckCircle className="text-green-500"/> Member only deals</li>
          </ul>
        </motion.div>

      </div>
    </div>
  );
}

/* 🔥 STAT CARD */
function StatCard({ title, value, icon }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-6 rounded-3xl shadow-lg flex flex-col items-center text-center">
      {icon}
      <p className="text-gray-500 mt-2">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </motion.div>
  );
}
