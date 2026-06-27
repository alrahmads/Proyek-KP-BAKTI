import { useState } from "react";
import * as XLSX from "xlsx";
import { useNavigate, Navigate } from "react-router-dom";
import baktiLogo from "@/assets/bakti-komdigi-logo.png";

interface User {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Jika sudah login, langsung ke dashboard
  if (localStorage.getItem("isLoggedIn")) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async () => {
    try {
      setLoading(true);

      const response = await fetch("/data/authData.xlsx");

      if (!response.ok) {
        throw new Error("File users_login.xlsx tidak ditemukan");
      }

      const buffer = await response.arrayBuffer();

      const workbook = XLSX.read(buffer, {
        type: "array",
      });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const users = XLSX.utils.sheet_to_json<User>(sheet);

      const foundUser = users.find(
        (u) =>
          u.username === username.trim() &&
          u.password === password.trim()
      );

      if (foundUser) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", foundUser.username);

        navigate("/");
      } else {
        alert("Username atau password salah");
      }
    } catch (error) {
      console.error(error);
      alert("Gagal membaca file login");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

    return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm border">
        <div className="flex justify-center mb-5">
            <img
            src={baktiLogo}
            alt="BAKTI KOMDIGI"
            className="h-20 object-contain"
            />
        </div>

        <h1 className="text-2xl font-bold text-center mb-1">
            Dashboard Monitoring
        </h1>

        <p className="text-center text-gray-500 text-sm mb-6">
            Wilayah Kerja IV Surabaya
        </p>

        <div className="space-y-4">
            <input
            type="text"
            placeholder="Username"
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyPress}
            />

            <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyPress}
            />

            <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 font-medium transition disabled:opacity-50"
            >
            {loading ? "Memproses..." : "Login"}
            </button>
        </div>
        </div>
    </div>
    );
}