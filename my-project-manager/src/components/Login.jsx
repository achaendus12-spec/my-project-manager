import React, { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) setMessage(error.message);
    else {
      setMessage("Login berhasil!");
      onLogin(data.user);
    }
  };

  // Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);
    if (error) setMessage(error.message);
    else setMessage("Pendaftaran berhasil! Silakan cek email konfirmasi.");
  };

  // Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin, // link redirect setelah reset
    });
    setLoading(false);
    if (error) setMessage(error.message);
    else setMessage("Link reset password dikirim ke email Anda.");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isReset ? "Reset Password" : isRegister ? "Daftar Akun" : "Login"}
        </h2>

        <form
          onSubmit={
            isReset
              ? handleResetPassword
              : isRegister
              ? handleRegister
              : handleLogin
          }
          className="space-y-4"
        >
          <input
            type="email"
            placeholder="Email"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {!isReset && (
            <input
              type="password"
              placeholder="Password"
              className="w-full border px-3 py-2 rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading
              ? "Memproses..."
              : isReset
              ? "Kirim Link Reset"
              : isRegister
              ? "Daftar"
              : "Login"}
          </button>
        </form>

        {message && (
          <p className="text-sm text-center mt-3 text-red-500">{message}</p>
        )}

        <div className="flex justify-between text-sm mt-4">
          {!isReset && (
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-blue-600 hover:underline"
            >
              {isRegister ? "Sudah punya akun? Login" : "Belum punya akun? Daftar"}
            </button>
          )}
          <button
            onClick={() => {
              setIsReset(!isReset);
              setIsRegister(false);
              setMessage("");
            }}
            className="text-blue-600 hover:underline"
          >
            {isReset ? "Kembali ke Login" : "Lupa Password?"}
          </button>
        </div>
      </div>
    </div>
  );
}
