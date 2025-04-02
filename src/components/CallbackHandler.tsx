import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CallbackHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (!code) {
        console.error("Código de autorização não encontrado");
        navigate("/"); // volta para login
        return;
      }

      try {
        const res = await fetch("http://localhost:3001/auth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        const data = await res.json();

        if (data.access_token) {
          localStorage.setItem("clickup_access_token", data.access_token);
          navigate("/"); // redireciona ao painel após login
        } else {
          console.error("Falha ao obter token", data);
          navigate("/");
        }
      } catch (error) {
        console.error("Erro na troca de token:", error);
        navigate("/");
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="h-screen flex items-center justify-center text-sm text-zinc-500">
      Autenticando com ClickUp...
    </div>
  );
}
