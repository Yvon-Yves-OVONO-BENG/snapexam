import { useState, useEffect } from "react";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { CheckCircle, Edit, Trash2, PlusCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import titreDeLaPage from "../TitreDeLaPage";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function Plans() {
  // titre de la page
  titreDeLaPage("Plans tarifaires - SnapExam");

  const [user, setUser] = useState(() => {
  const storedUser = localStorage.getItem("user");
  return storedUser ? JSON.parse(storedUser) : null;
  });
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [setIsAdmin] = useState(false); // simulation du rôle
  const [formVisible, setFormVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: "",
    description: "",
    features: "",
    color: "",
    highlight: false,
  });
  const token = localStorage.getItem("token");

  // Checkout
  const handleChoose = (plan) => {
    // const token = localStorage.getItem("token");
    // if (!token) {
    //   navigate("/login");
    //   return;
    // }

    //redirige vers la page de checkout en passant getPlanId 
    navigate("/checkout", {state: { plan }});
  }

  useEffect(() => {
      const handleStorageChange = () => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      };
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

  // Charger les plans depuis le backend
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/plans`)
      .then((res) => res.json())
      .then((data) => setPlans(data))
      .catch((err) => console.error(err));

    // 🔐 Vérifier rôle (simulation)
    const role = localStorage.getItem("role"); // exemple : "admin"
    if (role === "admin") setIsAdmin(true);
  }, []);

  // Gérer le changement des champs du formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPlan({ ...newPlan, [name]: type === "checkbox" ? checked : value });
  };

  // Ajouter ou modifier un plan
  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = editingPlan ? "PUT" : "POST";
    const url = editingPlan
      ? `${process.env.REACT_APP_API_URL}/api/plans/${editingPlan.id}`
      : `${process.env.REACT_APP_API_URL}/api/plans`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newPlan,
          features: newPlan.features
            .split(",")
            .map((f) => f.trim())
            .filter((f) => f !== "")
            .join(","),
        }),
      });

      if (response.ok) {
        setFormVisible(false);
        setEditingPlan(null);
        setNewPlan({
          name: "",
          price: "",
          description: "",
          features: "",
          color: "",
          highlight: false,
        });
        toast.success("Plan ajouté/modifié avec succès !");

        // Recharger les plans
        const updated = await fetch(`${process.env.REACT_APP_API_URL}/api/plans`).then((r) =>
          r.json()
        );
        setPlans(updated);
      }
    } catch (err) {
      console.error("Erreur ajout/modif plan :", err);
    }
  };

  // Supprimer un plan
  const handleDelete = async (id) => {
    const confirmation = await Swal.fire({
      title: "Supprimer ce plan ?",
      text: "Cette action est irréversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e3342f",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    });

    if (!confirmation.isConfirmed) return;

    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/plans/${id}`, { 
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setPlans(plans.filter((p) => p.id !== id));
      // Swal.fire("Supprimé !", "Le plan a bien été supprimé.", "success");
      toast.success("Le plan a bien été supprimé avec succès");
    } catch (err) {
      console.error("Erreur suppression :", err);
      Swal.fire("Erreur", "Impossible de supprimer ce plan.", "error");
    }
  };

  // Éditer un plan
  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setNewPlan({
      name: plan.name,
      price: plan.price,
      description: plan.description,
      features: Array.isArray(plan.features)
        ? plan.features.join(", ")
        : plan.features,
      color: plan.color,
      highlight: plan.highlight,
    });
    setFormVisible(true);
  };

  

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <ToastContainer position="top-right" />
      <main className="flex-1 pt-24 px-6 lg:px-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-indigo-900">
            💎 Plans tarifaires — Gestion des photos des candidats
          </h1>

          {isAuthenticated && user?.role === "admin" &&  (
            <button
              onClick={() => {
                setFormVisible(true);
                setIsModalOpen(true);
                setEditingPlan(null);
              }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <PlusCircle size={20} />
              Nouveau plan
            </button>
          )}
        </div>

        {/* Formulaire d’ajout/modification */}
        <AnimatePresence>
          
          {isModalOpen && formVisible && (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-white shadow-md rounded-2xl p-6 mb-10 border border-gray-200"
            >
              <h2 className="text-xl font-semibold mb-4">
                {editingPlan ? "Modifier le plan" : "Ajouter un plan"}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Nom du plan"
                  value={newPlan.name}
                  onChange={handleChange}
                  className="border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  name="price"
                  placeholder="Prix"
                  value={newPlan.price}
                  onChange={handleChange}
                  className="border p-2 rounded"
                  required
                />
                <input
                  type="text"
                  name="color"
                  placeholder="Dégradé (ex: from-indigo-500 to-purple-500)"
                  value={newPlan.color}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="highlight"
                    checked={newPlan.highlight}
                    onChange={handleChange}
                  />
                  Mettre en avant ?
                </label>
              </div>

              <textarea
                name="description"
                placeholder="Description"
                value={newPlan.description}
                onChange={handleChange}
                className="border p-2 rounded w-full mt-3"
              ></textarea>

              <textarea
                name="features"
                placeholder="Fonctionnalités séparées par des virgules"
                value={newPlan.features}
                onChange={handleChange}
                className="border p-2 rounded w-full mt-3"
              ></textarea>

              <div className="mt-4 flex gap-3">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  {editingPlan ? "Mettre à jour" : "Ajouter"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormVisible(false);
                    setEditingPlan(null);
                  }}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>


        {/* Affichage des plans */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl shadow-lg p-8 bg-white border ${
                plan.highlight ? "border-yellow-400" : "border-gray-200"
              } hover:shadow-2xl transform transition`}
            >
              <h2
                className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${plan.color}`}
              >
                {plan.name}
              </h2>
              <p className="text-2xl font-extrabold text-indigo-900 mt-4">
                {plan.price} FCFA / session
              </p>
              <p className="text-gray-600 mt-2">{plan.description}</p>

              <ul className="mt-6 space-y-3">
                {Array.isArray(plan.features)
                  ? plan.features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <CheckCircle className="text-green-500" size={20} />
                        {f}
                      </li>
                    ))
                  : plan.features.split(",").map((f, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <CheckCircle className="text-green-500" size={20} />
                        {f.trim()}
                      </li>
                    ))}
              </ul>

              {/* Boutons */}
              <div className="mt-8 space-y-2">
                <button onClick={() => handleChoose(plan)}
                  className={`w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r ${plan.color}`}
                >
                  S’abonner à {plan.name}
                </button>

                {isAuthenticated && user?.role === "admin" && (
                  <div className="flex justify-between mt-3">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="flex items-center gap-1 px-3 py-2 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                    >
                      <Edit size={16} /> Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <Trash2 size={16} /> Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
