import React, { useEffect, useState } from "react";
import axios from "axios";
import countries from "../data/countries.json";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import amex from "../assets/cards/americanExpress.png"
// import amexGray from "../assets/cards/americanExpress_gris.png"
import discover from "../assets/cards/discover.jpeg"
// import discoverGray from "../assets/cards/discover_gris.png"
import masterCard from "../assets/cards/masterCard.png"
// import masterCardGray from "../assets/cards/masterCard_gris.png"
import visa from "../assets/cards/visa.png"
// import visaGray from "../assets/cards/visa_gris.png"
import carteCredit from "../assets/cards/carte-credit.jpg"

const CheckoutCard = ({ months, userId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cardNumber, setCardNumber] = useState("");
  const [cardType, setCardType] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [setLoading] = useState(false);
  const totalPrix = location.state?.totalPrix;
  const nombreDeMois = location.state?.nombreDeMois;
  const { state } = useLocation();
  const plan = state?.plan;

//   const totalPrix = plan.price * months;

  // je vérifie qu'un prix total a été reçu
    useEffect(() => {
        if (!totalPrix) {
            navigate("/checkout");
            return null;
        }
    }, [totalPrix, navigate]);

    // je vérifie que le nombreDeMois a été reçu
    useEffect(() => {
        if (!nombreDeMois) {
            navigate("/checkout");
            return null;
        }
    }, [nombreDeMois, navigate]);
    
    useEffect(() => {
        if (!plan) {
            navigate("/checkout");
            return null;
        }
    }, [plan, navigate]);

    const detectCardType = (number) => {
        const re = {
            amex: /^3[47]/,
            discover: /^6(?:011|5)/,
            masterCard: /^5[1-5]/,
            visa: /^4/,
        };

        if (re.amex.test(number)) return "amex";
        if (re.discover.test(number)) return "discover";
        if (re.masterCard.test(number)) return "masterCard";
        if (re.visa.test(number)) return "visa";
        return "";
    }

    // formatage du numéro de la carte 
    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");//supprime tout sauf les chiffres 

        //Détection du type avant formatage 
        const type = detectCardType(value);
        setCardType(type);

        //longueur max selon le type (Amex = 15 chiffres)
        const maxLength = type === "amex" ? 15 : 16;
        value = value.slice(0, maxLength);

        //formatage automatique par bloc de 4
        let formatted = "";
        for (let i = 0; i < value.length; i += 4) {
            formatted += value.substring(i, i + 4)+" ";
        }

        formatted = formatted.trim(); //retire l'espace final
        setCardNumber(formatted);
        
    };

    //Ajout du "/" et vérification de la date d'expiration
    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g,"").slice(0,4);

        //ajout le "/" automatiquement
        if (value.length > 2) {
            value = value.slice(0,2)+"/"+value.slice(2)
        }

        setExpiry(value);

        // validation quand 4 chiffres sont saisies
        if (value.length === 5) {
            const [month, year] = value.split("/").map(Number);
            const currentYear = new Date().getFullYear()%100;
            const currentMonth = new Date().getMonth()+1;

            if (month < 1 || month > 12) {
                Swal.fire({
                    icon: "error",
                    title: "Mois invalide",
                    text: "Le mois doit être compris entre 01 et 12."
                });
            } else if (year < currentYear||(year === currentYear && month < currentMonth)) {
                Swal.fire({
                    icon: "warning",
                    title: "Carte expirée",
                    text: "Votre carte semble expirée. veuillez vérifier la date."
                });
            }
        }
    };

  // ✅ Simulation du paiement
  const handlePay = async (e) => {
    e.preventDefault();

    if (!cardNumber || !expiry || !cvc || !fullName || !country) {
    //   alert("Veuillez remplir tous les champs.");
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Veuillez remplir tous les champs.",
        });
      return;
    }

    setIsPaying(true);

    try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/subscription/checkout`,
            {
                planId: plan.id,
                paymentMethod: "card",
                durationMonths: nombreDeMois,
            },
            {
                headers : {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
            }
        );

      Swal.fire({
        icon: "success",
        title: "Succès !",
        text: "✅ Paiement effectué avec succès !",
        });
      navigate("/userDashboard");
    } catch (error) {
      console.error("Erreur de paiement :", error);
      Swal.fire({
        icon: "error",
        title: "Erreur !",
        text: "❌ Échec du paiement. Veuillez réessayer."
    });
    } finally {
      setIsPaying(false);
    }
  };

  return (
    
    <div className="min-h-screen flex">
        
        {/* 🌓 Côté gauche sombre */}
        <div className="w-1/2 bg-gray-900 text-white flex flex-col justify-center items-center p-10 rounded-l-2xl">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-lg shadow">
              ⚠️ Cette page de paiement est en cours de développement. 
              Aucune transaction réelle n’est effectuée pour le moment.
            </div>
            <h2 className="text-3xl font-bold mb-4">{plan.nom}</h2>
            <p className="text-gray-300 mb-2">
            Durée d’engagement : <span className="font-semibold">{nombreDeMois} session</span>
            </p>
            <p className="text-gray-300 mb-6">
            Prix mensuel : <span className="font-semibold">{plan.price.toLocaleString()} FCFA</span>
            </p>
            <div className="text-4xl font-bold text-yellow-400 mb-2">
            {totalPrix.toLocaleString()} FCFA
            </div>
            <p className="text-sm text-gray-400 text-center">
            Ce montant sera débité une seule fois pour la période choisie.
            </p>
            
        </div>

      {/* ☀ Côté droit clair */}
      <div className="w-1/2 bg-white flex justify-center items-center rounded-r-2xl p-10 shadow-2xl">
        <form onSubmit={handlePay} className="w-full max-w-md">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                Paiement sécurisé par carte
            </h3>

            <div className="mb-4">
                <label className="block mb-1 text-gray-700">Numéro de carte</label>
                <div className="relative">
                    <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="w-full border rounded-lg px-3 py-2 pr-12 focus:outline-none focus:ting-2 focusg-blue-500"
                    placeholder="0000 0000 0000 0000"
                    maxLength="19"
                    
                    />
                    <img src={
                        cardType === "visa" ? visa
                        : cardType === "masterCard" ? masterCard
                        : cardType === "amex" ? amex
                        : cardType === "discover" ? discover
                        : carteCredit
                    } alt="CardLogo"
                    className="absolute right-3 top-1/2 transition -translate-y-1/2 w-10 h-6 transition-all" />
                
                </div>
            </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block mb-1 text-gray-700">Date d’expiration</label>
              <input
                type="text"
                value={expiry}
                onChange={handleExpiryChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="MM/AA"
                maxLength="5"
              />
            </div>
            <div>
              <label className="block mb-1 text-gray-700">CVC</label>
              <input
                type="text"
                value={cvc}
                onChange={(e) => setCvc(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                placeholder="123"
                maxLength="3"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-gray-700">Nom complet</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
              placeholder="Nom sur la carte"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-1 text-gray-700">Pays</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Sélectionner un pays --</option>
              {countries.map((c, index) => (
                <option key={index} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isPaying}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
          >
            {isPaying ? "Traitement du paiement..." : "Payer maintenant"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutCard;