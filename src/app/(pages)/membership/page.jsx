"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Swal from "sweetalert2"; // ✅ SweetAlert import
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function MembershipPage() {
  const router = useRouter();
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
    agree: false,
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "interests") {
      setForm((prev) => ({
        ...prev,
        interests: checked
          ? [...prev.interests, value]
          : prev.interests.filter((i) => i !== value),
      }));
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.agree) {
      MySwal.fire({
        icon: "warning",
        title: "Oops!",
        text: "Please accept membership terms",
      });
      return;
    }

    setLoading(true);

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;

      // Generate unique Member ID
      const memberId = "TBM-" + Math.floor(1000 + Math.random() * 9000);

      // Save member data to Firestore
      await setDoc(doc(db, "members", user.uid), {
        ...form,
        memberId,
        points: 0, // initial points
      });

      // SweetAlert success
      await MySwal.fire({
        icon: "success",
        title: "Membership Activated!",
        html: `Welcome <strong>${form.name}</strong>!<br/>Your Member ID is <strong>${memberId}</strong>.`,
        confirmButtonColor: "#6366F1",
      });

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      MySwal.fire({
        icon: "error",
        title: "Signup Failed",
        text: err.message,
      });
    }

    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Loyalty Membership Benefits
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Members are served first and enjoy exclusive pricing, financing,
            transport discounts, and early access to off-lease buildings.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-2xl rounded-3xl p-8 md:p-12 space-y-10 border border-gray-200"
        >
          {/* Personal Info */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">
              Personal Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                name="name"
                placeholder="Full Name"
                required
                className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm transition"
                onChange={handleChange}
              />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                required
                className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm transition"
                onChange={handleChange}
              />
              <input
                name="password"
                type="password"
                placeholder="Create a Password"
                required
                className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm transition"
                onChange={handleChange}
              />
              <input
                name="phone"
                placeholder="Phone Number"
                className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm transition"
                onChange={handleChange}
              />
              <input
                name="city"
                placeholder="City / State"
                className="p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm transition"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Membership Plan */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">
              Choose Membership Plan
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { value: "annual", label: "$720 / Year (Best Value)" },
                { value: "monthly", label: "$60 / Month" },
                { value: "representative", label: "Ask a Rep (Free Year)" },
              ].map((plan) => (
                <label
                  key={plan.value}
                  className={`cursor-pointer border rounded-2xl p-4 text-center transition transform hover:scale-105 ${
                    form.plan === plan.value
                      ? "border-indigo-500 bg-indigo-50 shadow-lg"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={plan.value}
                    checked={form.plan === plan.value}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="font-medium text-gray-900">{plan.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">
              Your Interests
            </h2>
            <div className="grid md:grid-cols-2 gap-2">
              {interestsList.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 p-3 border rounded-xl cursor-pointer hover:bg-indigo-50 transition"
                >
                  <input
                    type="checkbox"
                    name="interests"
                    value={item}
                    onChange={handleChange}
                    className="w-4 h-4 text-indigo-500 border-gray-300 rounded focus:ring-2 focus:ring-indigo-400"
                  />
                  <span className="text-gray-700 font-medium">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Usage */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">
              Intended Use
            </h2>
            <select
              name="usage"
              className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm transition"
              onChange={handleChange}
              required
            >
              <option value="">Select purpose</option>
              <option value="personal">Personal Use</option>
              <option value="rental">Rental / Investment</option>
              <option value="business">Business</option>
              <option value="unsure">Not Sure Yet</option>
            </select>
          </div>

          {/* Agreement */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              name="agree"
              onChange={handleChange}
              className="w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-indigo-400"
            />
            <p className="text-gray-600 text-sm">
              I understand the Loyalty Membership benefits and agree to the
              terms and conditions.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-2xl shadow-lg hover:from-indigo-600 hover:to-purple-600 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Membership..." : "Activate Membership"}
          </button>

          <p className="text-gray-600 text-sm text-center">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-600 font-medium hover:underline">
              Log in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
