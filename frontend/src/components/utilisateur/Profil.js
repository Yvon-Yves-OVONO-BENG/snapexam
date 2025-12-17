import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import Footer from "../Footer";
import { Camera } from "lucide-react";
import Swal from "sweetalert2";
import titreDeLaPage from "../TitreDeLaPage";

export default function Profil() {
  titreDeLaPage("Profil - SnapExam"); // ✅ toujours exécuté

  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!username || !email) {
      return Swal.fire({
        icon: "warning",
        title: "Champs obligatoires",
        text: "Veuillez renseigner au minimum le nom et l'email",
      });
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("contact", contact);
    if (avatar) formData.append("avatar", avatar);

    try {
      setLoading(true);
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/auth/profile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Profil mis à jour avec succès !",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (err) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: err.response?.data?.message || "Erreur lors de la mise à jour",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      setUsername(storedUser.username);
      setEmail(storedUser.email);
      setContact(storedUser.contact || "");
      setPreview(
        storedUser.avatar
          ? `${process.env.REACT_APP_API_URL}/avatars/${storedUser.avatar}`
          : null
      );
    }
      
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="pt-24 flex flex-col items-center px-4">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl">
          {/* Avatar + Info */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <img
                src={preview || "https://via.placeholder.com/150"}
                alt=""
                className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-500 transition">
                <Camera size={20} className="text-white" />
                <input
                  type="file"
                  name="avatar"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <h2 className="text-2xl font-bold mt-3">{username}</h2>
            <p className="text-gray-500">{email}</p>
          </div>

          {/* Formulaire */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center"
          >
            {/* Username */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-32 font-medium text-gray-700">Nom</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-32 font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded"
              />
            </div>


            {/* Contact */}
            <div className="flex flex-col md:flex-row md:items-center">
              <label className="w-32 font-medium text-gray-700">Contact</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded"
              />
            </div>

            {/* Bouton */}
            <div className="col-span-1 md:col-span-2 flex justify-center mt-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded transition w-full md:w-auto ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                }`}
              >
                {loading ? "Mise à jour..." : "Mettre à jour le profil"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}