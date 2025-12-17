// src/components/PayPalButton.jsx
import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PayPalButton = ({ amount }) => {
  return (
    <PayPalScriptProvider options={{ "client-id": "test" }}>
      <div className="flex flex-col items-center bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          Paiement PayPal sécurisé
        </h2>
        <PayPalButtons
          style={{ layout: "vertical" }}
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: amount,
                  },
                },
              ],
            });
          }}
          onApprove={(data, actions) => {
            return actions.order.capture().then((details) => {
              alert(`Paiement réussi par ${details.payer.name.given_name}`);
            });
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
