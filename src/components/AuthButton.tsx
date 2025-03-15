
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const AuthButton = () => {
  const { session, signOut, loading } = useAuth();

  if (loading) {
    return <Button variant="ghost" size="sm" disabled>Cargando...</Button>;
  }

  if (session) {
    return (
      <Button variant="ghost" size="sm" onClick={signOut}>
        Cerrar Sesión
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="sm" asChild>
      <Link to="/auth">Iniciar Sesión</Link>
    </Button>
  );
};

export default AuthButton;
