"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      await MySwal.fire({
        icon: "success",
        title: "Login Successful!",
        text: `Welcome back!`,
        confirmButtonColor: "#6366F1",
      });
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      await MySwal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid email or password.",
      });
    }

    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!form.email) {
      return MySwal.fire({
        icon: "info",
        title: "Enter Email",
        text: "Please enter your email to reset password.",
      });
    }

    try {
      await sendPasswordResetEmail(auth, form.email);
      await MySwal.fire({
        icon: "success",
        title: "Email Sent",
        text: "Password reset email sent successfully!",
      });
    } catch (err) {
      console.error(err);
      await MySwal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-50 via-white to-purple-50 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-md space-y-6 border border-gray-200"
      >
        <h1 className="text-3xl font-extrabold text-gray-900 text-center">
          Member Login
        </h1>

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm transition"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          value={form.password}
          onChange={handleChange}
          className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none shadow-sm transition"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-2xl shadow-lg hover:from-indigo-600 hover:to-purple-600 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="flex justify-between items-center text-sm">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-indigo-600 font-medium hover:underline"
          >
            Forgot Password?
          </button>
          <p className="text-gray-600">
            Don't have an account?{" "}
            <a href="/membership" className="text-indigo-600 font-medium hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
