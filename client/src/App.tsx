import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import Layout from '@/components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ParticularsPage from './pages/ParticularsPage';
import ParticularDetailsPage from './pages/ParticularDetailsPage';
import AddEditParticularPage from './pages/AddEditParticularPage';
import AddEditTransactionPage from './pages/AddEditTransactionPage';
import SelectParticularPage from './pages/SelectParticularPage';
import TransactionsPage from './pages/TransactionsPage';
import SettingsPage from './pages/SettingsPage';

import { useState, useEffect } from 'react';

function App() {
  const [isAuth, setIsAuth] = useState(Boolean(localStorage.getItem('token')));

  useEffect(() => {
    const onStorage = () => setIsAuth(Boolean(localStorage.getItem('token')));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);



  return (
    <>
 
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          isAuth ? (
            <Layout>
              <DashboardPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/particulars" element={
          isAuth ? (
            <Layout>
              <ParticularsPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/particulars/new" element={
          isAuth ? (
            <Layout>
              <AddEditParticularPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/particulars/:id" element={
          isAuth ? (
            <Layout>
              <ParticularDetailsPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/particulars/:id/edit" element={
          isAuth ? (
            <Layout>
              <AddEditParticularPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/particulars/:particularId/transactions/new" element={
          isAuth ? (
            <Layout>
              <AddEditTransactionPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/particulars/:particularId/transactions/:id/edit" element={
          isAuth ? (
            <Layout>
              <AddEditTransactionPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/select-particular" element={
          isAuth ? (
            <Layout>
              <SelectParticularPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/transactions" element={
          isAuth ? (
            <Layout>
              <TransactionsPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/settings" element={
          isAuth ? (
            <Layout>
              <SettingsPage />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;