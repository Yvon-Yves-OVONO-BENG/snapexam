// src/pages/AdminDashboard.js
import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Navbar from "./Navbar";
import Footer from "./Footer";
import titreDeLaPage from "./TitreDeLaPage";

export default function AdminDashboard() {
  titreDeLaPage("Tableau de bord");

  const [stats, setStats] = useState([]); // initialisé à un tableau vide
  const [loading, setLoading] = useState(true); // pour gérer le chargement

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/plans/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setStats(res.data.byPlan || []); // fallback à [] si undefined
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setStats([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Tableau de bord admin</h1>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="mb-4">Utilisateurs par plan (revenu)</h2>

          {loading ? (
            <p>Chargement des données...</p>
          ) : stats.length === 0 ? (
            <p>Aucune donnée disponible.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats}>
                <XAxis dataKey="planName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
