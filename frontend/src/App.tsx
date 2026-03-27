import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ActivateAccountPage from './pages/ActivateAccountPage';
import AddSongPage from './pages/AddSongPage';
import EditSongPage from './pages/EditSongPage';
import AdminPlaylistsManagePage from './pages/AdminPlaylistsManagePage';
import AdminPlaylistPage from './pages/AdminPlaylistPage';
import AdminUsersPage from './pages/AdminUsersPage/AdminUsersPage';
import AdminRoute from './components/AdminRoute/AdminRoute';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/activate/:token" element={<ActivateAccountPage />} />
          <Route path="/songs/add" element={<AddSongPage />} />
          <Route path="/songs/:id/edit" element={<EditSongPage />} />
          <Route path="/admin/playlists" element={<AdminPlaylistsManagePage />} />
          <Route path="/admin/playlists/:playlistName" element={<AdminPlaylistPage />} />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
