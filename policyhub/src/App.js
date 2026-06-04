import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Policies from './pages/policies/Policies';
import Users from './pages/users/Users';
import Assignments from './pages/admin/Assignments';
import Categories from './pages/admin/Categories';
import History from './pages/history/History';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './routes/ProtectedRoute';
import ROUTES from './routes/paths';
import './assets/styles/App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.login} element={<Login />} />
        <Route path={ROUTES.unauthorized} element={<Unauthorized />} />

        <Route element={<MainLayout />}>
          <Route
            path={ROUTES.home}
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.dashboard}
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.policies}
            element={
              <ProtectedRoute>
                <Policies />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.assignments}
            element={
              <ProtectedRoute requiredRoles={["HRAdmin", "SuperAdmin"]}>
                <Assignments />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.categories}
            element={
              <ProtectedRoute requiredRoles={["HRAdmin", "SuperAdmin"]}>
                <Categories />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.history}
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.users}
            element={
              <ProtectedRoute requiredRoles={["HRAdmin", "SuperAdmin"]}>
                <Users />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;