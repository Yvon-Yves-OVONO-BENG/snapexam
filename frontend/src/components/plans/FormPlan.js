import { useState, useEffect } from "react";

export default function FormPlan({ onSave, planToEdit, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    features: "",
    color: "",
  });

  useEffect(() => {
    if (planToEdit) {
      setForm({
        ...planToEdit,
        features: planToEdit.features.join(", "),
      });
    }
  }, [planToEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedData = {
      ...form,
      features: form.features.split(",").map((f) => f.trim()),
    };
    onSave(formattedData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-md space-y-4"
    >
      <h2 className="text-xl font-bold text-indigo-800">
        {planToEdit ? "Modifier un plan" : "Créer un plan"}
      </h2>

      <input
        type="text"
        name="name"
        placeholder="Nom du plan"
        value={form.name}
        onChange={handleChange}
        className="w-full border rounded p-2"
      />

      <input
        type="text"
        name="price"
        placeholder="Prix"
        value={form.price}
        onChange={handleChange}
        className="w-full border rounded p-2"
      />

      <textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
        className="w-full border rounded p-2"
      />

      <input
        type="text"
        name="features"
        placeholder="Fonctionnalités séparées par virgule"
        value={form.features}
        onChange={handleChange}
        className="w-full border rounded p-2"
      />

      <input
        type="text"
        name="color"
        placeholder="Dégradé (ex: from-indigo-500 to-purple-500)"
        value={form.color}
        onChange={handleChange}
        className="w-full border rounded p-2"
      />

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Enregistrer
        </button>
      </div>
    </form>
  );
}
