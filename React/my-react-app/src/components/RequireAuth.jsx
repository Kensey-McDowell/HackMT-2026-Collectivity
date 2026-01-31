import { Navigate, Outlet } from "react-router-dom";
import pb from "../lib/pocketbase";

export default function RequireAuth() {
  if (!pb.authStore.isValid) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
