import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const useAutoLogout = (token, logout) => {
  useEffect(() => {
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        // token expiré → déconnexion
        logout();
      } else {
        // temps restant avant expiration
        const timeout = (decoded.exp - currentTime) * 1000;

        const timer = setTimeout(() => {
          logout();
        }, timeout);

        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error("Token invalide :", error);
      logout();
    }
  }, [token, logout]);
};

export default useAutoLogout;
