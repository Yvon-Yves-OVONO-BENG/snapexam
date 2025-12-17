import { useState } from "react";
import FormPlan from "./FormPlan";
import ListePlans from "./ListePlans";
import { createPlan, updatePlan } from "../../services/planService";

export default function GestionPlans() {
  const [planToEdit, setPlanToEdit] = useState(null);

  const handleSave = async (planData) => {
    if (planToEdit) {
      await updatePlan(planToEdit.id, planData);
    } else {
      await createPlan(planData);
    }
    setPlanToEdit(null);
    window.location.reload();
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center text-indigo-900 mb-6">
        Gestion des Plans Tarifaires
      </h1>

      <div className="grid md:grid-cols-2 gap-8">
        <FormPlan
          onSave={handleSave}
          planToEdit={planToEdit}
          onCancel={() => setPlanToEdit(null)}
        />
        <ListePlans onEdit={(plan) => setPlanToEdit(plan)} />
      </div>
    </div>
  );
}
