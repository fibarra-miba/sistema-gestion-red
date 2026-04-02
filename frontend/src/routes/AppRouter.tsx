import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ClientesPage from "../pages/ClientesPage";
import MainLayout from "../layouts/MainLayout";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/clientes" element={<ClientesPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
};