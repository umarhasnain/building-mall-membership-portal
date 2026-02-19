"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import {
  collection, updateDoc, doc, deleteDoc, arrayRemove,
  onSnapshot,
  setDoc,
  getDocs,
  query,
  where,
  arrayUnion,
} from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
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
import {
  FaUser,
  FaStar,
  FaUsers,
  FaWallet,
  FaCheckCircle,
  FaCode,
  FaEdit,
  FaPlus,
} from "react-icons/fa";

const MySwal = withReactContent(Swal);

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const getLevel = (refCount) => {
    if (refCount >= 30) return "Platinum";
    if (refCount >= 15) return "Gold";
    if (refCount >= 5) return "Silver";
    return "Starter";
  };

  // 🔥 Load Admin & all members (email based)
  useEffect(() => {
    let unsubAuth;
    let unsubMembers;

    unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      // ✅ Check if email is admin
      // if (user.email !== "ron@portablebuildingmall.com") {
      //   router.push("/dashboard"); // normal member dashboard
      //   return;
      // }

      // If admin email → allow access
      setAdmin({ uid: user.uid, email: user.email });

      // Load all members
      unsubMembers = onSnapshot(collection(db, "members"), (snap) => {
        const allMembers = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setMembers(allMembers);
        setLoading(false);
      });
    });

    return () => {
      if (unsubAuth) unsubAuth();
      if (unsubMembers) unsubMembers();
    };
  }, [router]);


  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
  };
  const handleDeleteMember = async (member) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: "This member will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      // 🔥 Remove member from parent's referral list (if exists)
      if (member.referredBy) {
        await updateDoc(doc(db, "members", member.referredBy), {
          referrals: arrayRemove(member.id),
        });
      }

      // 🔥 Delete Firestore document
      await deleteDoc(doc(db, "members", member.id));

      await MySwal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Member deleted successfully.",
      });

    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };


  const handleSaveMember = async (updatedMember) => {
    try {
      const ref = doc(db, "members", updatedMember.id);
      await updateDoc(ref, {
        name: updatedMember.name,
        email: updatedMember.email,
        plan: updatedMember.plan,
        points: updatedMember.points,
        wallet: { balance: parseFloat(updatedMember.walletBalance) },
      });
      setEditingMember(null);
      MySwal.fire({
        icon: "success",
        title: "Member updated successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      MySwal.fire({
        icon: "error",
        title: "Update failed",
        text: err.message,
      });
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
      <p className="text-gray-600 text-xl animate-pulse">Loading super admin dashboard...</p>
    </div>
  );

  // Aggregate Stats
  const totalMembers = members.length;
  const totalPoints = members.reduce((sum, m) => sum + (m.points || 0), 0);
  const totalWallet = members.reduce((sum, m) => sum + ((m.wallet?.balance) || 0), 0);
  const topReferrers = [...members].sort((a, b) => (b.referrals?.length || 0) - (a.referrals?.length || 0)).slice(0, 5);

  // Chart Data
  const chartData = members.map((m) => ({
    name: m.name,
    referrals: m.referrals?.length || 0,
  }));

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* HEADER */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <FaUser size={50} className="text-indigo-600" />
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-gray-600">Manage all members</p>
            </div>

          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl shadow hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <FaPlus /> Add Member
          </button>
          <button onClick={handleLogout} className="bg-linear-to-r from-[#7f5d2b] to-[#7f5d2b] text-white px-6 py-3 rounded-2xl shadow hover:bg-blue-600 transition">
            Logout
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid md:grid-cols-4 gap-6 justify-center items-center">
          <StatCard title="Total Members" value={totalMembers} icon={<FaUsers size={30} className="text-green-500" />} />
          {/* <StatCard title="Total Points" value={totalPoints} icon={<FaStar size={30} className="text-indigo-500" />} />
          <StatCard title="Total Wallet $" value={totalWallet.toFixed(2)} icon={<FaWallet size={30} className="text-purple-500" />} />
          <StatCard title="Top Referrer" value={topReferrers[0]?.name || "N/A"} icon={<FaStar size={30} className="text-yellow-500" />} /> */}
        </div>

        {/* MEMBERS LIST */}
        <motion.div className="bg-white p-6 rounded-3xl shadow-lg overflow-x-auto">
          <h2 className="font-bold mb-4 text-lg">All Members</h2>
          <table className="min-w-full text-left border border-gray-200 rounded-xl overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border-b">Name</th>
                <th className="p-3 border-b">Email</th>
                <th className="p-3 border-b">Plan</th>
                <th className="p-3 border-b">Points</th>
                <th className="p-3 border-b">Wallet</th>
                <th className="p-3 border-b">Referrals</th>
                <th className="p-3 border-b">Referral Code</th>
                <th className="p-3 border-b">Level</th>
                <th className="p-3 border-b">Actions</th>
                <th className="p-3 border-b">Delete</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="p-3 border-b">{m.name}</td>
                  <td className="p-3 border-b">{m.email}</td>
                  <td className="p-3 border-b">{m.plan}</td>
                  <td className="p-3 border-b">{m.points}</td>
                  <td className="p-3 border-b">${m.wallet?.balance || 0}</td>
                  <td className="p-3 border-b">{m.referrals?.length || 0}</td>
                  <td className="p-3 border-b">{m.referralCode}</td>
                  <td className="p-3 border-b">{getLevel(m.referrals?.length || 0)}</td>
                  <td className="p-3 border-b">
                    <button
                      onClick={() => handleEditMember(m)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-xl hover:bg-blue-600 transition flex items-center gap-1"
                    >
                      <FaEdit /> Edit
                    </button>
                  </td>
                  <td className="p-3 border-b">
                    <button
                      onClick={() => handleDeleteMember(m)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* REFERRAL CHART */}
        <motion.div className="bg-white p-6 rounded-3xl shadow-lg">
          <h2 className="font-bold mb-4 text-lg">Referral Analytics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="referrals" fill="#6366F1" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

      </div>

      {/* EDIT MEMBER MODAL */}
      {editingMember && (
        <EditMemberModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSave={handleSaveMember}
        />
      )}


      <AnimatePresence>
        {showAddModal && (
          <AddMemberModal onClose={() => setShowAddModal(false)} />
        )}
      </AnimatePresence>
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

/* 🔥 EDIT MEMBER MODAL */
function EditMemberModal({ member, onClose, onSave }) {
  const [form, setForm] = useState({
    name: member.name,
    email: member.email,
    plan: member.plan,
    points: member.points || 0,
    walletBalance: member.wallet?.balance || 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...member, ...form });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold mb-6">Edit Member Info</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
            placeholder="Full Name"
            required
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
            placeholder="Email"
            required
          />
          <select
            name="plan"
            value={form.plan}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
          >
            <option value="annual">Annual</option>
            <option value="monthly">Monthly</option>
            <option value="representative">Representative</option>
          </select>
          <input
            name="points"
            type="number"
            value={form.points}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
            placeholder="Points"
          />
          <input
            name="walletBalance"
            type="number"
            value={form.walletBalance}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
            placeholder="Wallet Balance"
          />
          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}


/* 🔥 FULL MEMBERSHIP FORM MODAL */

function AddMemberModal({ onClose }) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    plan: "annual",
    interests: [],
    usage: "",
    referralCodeInput: "",
    agree: true,
  });

  const interestsList = [
    "Storage Buildings",
    "Lofted Cabins",
    "Steel Cabins",
    "Portable Decks",
    "Green Houses",
    "Backyard Kitchens",
    "Moving / Transport Services",
    "Investment Opportunities",
  ];

  const generateReferralCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "interests") {
      setForm((prev) => ({
        ...prev,
        interests: checked
          ? [...prev.interests, value]
          : prev.interests.filter((i) => i !== value),
      }));
    } else {
      setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const memberId =
        "TBM-" + Math.floor(1000 + Math.random() * 9000);
      const myCode = generateReferralCode();

      let referredBy = null;

      if (form.referralCodeInput) {
        const q = query(
          collection(db, "members"),
          where("referralCode", "==", form.referralCodeInput)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          referredBy = snap.docs[0].id;
          await updateDoc(doc(db, "members", referredBy), {
            referrals: arrayUnion(cred.user.uid),
          });
        }
      }

      await setDoc(doc(db, "members", cred.user.uid), {
        ...form,
        memberId,
        referralCode: myCode,
        referredBy,
        referrals: [],
        points: 0,
        wallet: { balance: 0 },
        role: "member",
        createdAt: new Date(),
      });

      Swal.fire("Success", "Member Added!", "success");
      onClose();
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }

    setLoading(false);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-4xl"
      >
        <h2 className="text-3xl font-bold mb-6">Add New Member</h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid md:grid-cols-2 gap-4">
            <Input name="name" placeholder="Full Name" onChange={handleChange} />
            <Input name="email" type="email" placeholder="Email Address" onChange={handleChange} />
            <Input name="password" type="password" placeholder="Password" onChange={handleChange} />
            <Input name="phone" placeholder="Phone Number" onChange={handleChange} />
            <Input name="city" placeholder="City / State" onChange={handleChange} />
            <Input name="referralCodeInput" placeholder="Referral Code" onChange={handleChange} />
          </div>

          <select
            name="plan"
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
          >
            <option value="annual">Annual</option>
            <option value="monthly">Monthly</option>
            <option value="representative">Representative</option>
          </select>

          <div className="grid md:grid-cols-2 gap-2">
            {interestsList.map((item) => (
              <label key={item} className="flex gap-2">
                <input
                  type="checkbox"
                  name="interests"
                  value={item}
                  onChange={handleChange}
                />
                {item}
              </label>
            ))}
          </div>

          <select
            name="usage"
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-xl"
          >
            <option value="">Select Usage</option>
            <option value="personal">Personal</option>
            <option value="rental">Rental</option>
            <option value="business">Business</option>
            <option value="unsure">Not Sure</option>
          </select>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl"
            >
              {loading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      required
      className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
    />
  );
}
