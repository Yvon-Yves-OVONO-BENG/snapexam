import { useEffect, useState } from "react";
import {
  getPlans,
  deletePlan,
} from "../../services/planService";

export default function ListePlans({ onEdit }) {
  const [plans, setPlans] = useState([]);

  const fetchPlans = async () => {
    const data = await getPlans();
    setPlans(data);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce plan ?")) {
      await deletePlan(id);
      fetchPlans();
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold text-indigo-800 mb-4">
        Liste des plans
      </h2>

      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Nom</th>
            <th className="p-2 border">Prix</th>
            <th className="p-2 border">Description</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((p) => (
            <tr key={p.id}>
              <td className="p-2 border">{p.name}</td>
              <td className="p-2 border">{p.price}</td>
              <td className="p-2 border">{p.description}</td>
              <td className="p-2 border flex gap-2">
                <button
                  onClick={() => onEdit(p)}
                  className="px-3 py-1 bg-yellow-400 rounded"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
