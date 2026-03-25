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
import AdminTagsPage from './pages/AdminTagsPage';
import AdminPlaylistsIndexPage from './pages/AdminPlaylistsIndexPage';
import AdminPlaylistPage from './pages/AdminPlaylistPage';

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
          <Route path="/admin/tags" element={<AdminTagsPage />} />
          <Route path="/admin/playlists" element={<AdminPlaylistsIndexPage />} />
          <Route path="/admin/playlists/:tagId" element={<AdminPlaylistPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
