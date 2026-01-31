"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import Swal from "sweetalert2";
import { auth } from "@/lib/firebase";

export default function AuthPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isLogin && form.password !== form.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (isLogin) {
        // LOGIN
        await signInWithEmailAndPassword(auth, form.email, form.password);

        await Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: "Welcome back to The Building Mall",
          timer: 1500,
          showConfirmButton: false,
        });

        router.push("/dashboard");
      } else {
        // SIGNUP
        await createUserWithEmailAndPassword(auth, form.email, form.password);

        await Swal.fire({
          icon: "success",
          title: "Account Created 🎉",
          text: "Your account has been created successfully",
          timer: 1800,
          showConfirmButton: false,
        });

        router.push("/dashboard");
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: err.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-900 via-blue-900 to-[#7f5d2b] p-6">
      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 overflow-hidden">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white">
            {isLogin ? "Welcome" : "Join Us Today"}
          </h1>
          <h3 className="text-2xl font-bold text-white mt-1">
            The Building Mall
          </h3>
          <p className="mt-2 text-white/70">
            {isLogin
              ? "Login to access your premium dashboard"
              : "Create an account and start your journey"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="relative">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Full Name"
                className="peer w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <label className="absolute left-4 -top-2.5 text-white text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/50 transition-all">
                Full Name
              </label>
            </div>
          )}

          <div className="relative">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="Email"
              className="peer w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <label className="absolute left-4 -top-2.5 text-white text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/50 transition-all">
              Email
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Password"
              className="peer w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <label className="absolute left-4 -top-2.5 text-white text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/50 transition-all">
              Password
            </label>
          </div>

          {!isLogin && (
            <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm Password"
                className="peer w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <label className="absolute left-4 -top-2.5 text-white text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-white/50 transition-all">
                Confirm Password
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-lg hover:scale-105 transition disabled:opacity-60"
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-white/70 mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-400 font-semibold hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}
