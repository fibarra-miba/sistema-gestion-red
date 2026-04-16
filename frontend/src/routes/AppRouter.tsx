// frontend/src/routes/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ClientesPage from "../pages/ClientesPage";
import PlanesPage from "../pages/PlanesPage";
import MainLayout from "../layouts/MainLayout";
import ContratosPage from "../pages/ContratosPage";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/planes" element={<PlanesPage />} />
          <Route path="/contratos" element={<ContratosPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};