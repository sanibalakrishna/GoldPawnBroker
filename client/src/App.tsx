import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ParticularsPage from './pages/ParticularsPage';
import ParticularDetailsPage from './pages/ParticularDetailsPage';
import AddEditParticularPage from './pages/AddEditParticularPage';
import AddEditTransactionPage from './pages/AddEditTransactionPage';

function App() {
  const isAuth = Boolean(localStorage.getItem('token'));

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={isAuth ? <DashboardPage /> : <Navigate to="/login" />} />
        <Route path="/particulars" element={isAuth ? <ParticularsPage /> : <Navigate to="/login" />} />
        <Route path="/particulars/new" element={isAuth ? <AddEditParticularPage /> : <Navigate to="/login" />} />
        <Route path="/particulars/:id" element={isAuth ? <ParticularDetailsPage /> : <Navigate to="/login" />} />
        <Route path="/particulars/:id/edit" element={isAuth ? <AddEditParticularPage /> : <Navigate to="/login" />} />
        <Route path="/particulars/:particularId/transactions/new" element={isAuth ? <AddEditTransactionPage /> : <Navigate to="/login" />} />
        <Route path="/particulars/:particularId/transactions/:id/edit" element={isAuth ? <AddEditTransactionPage /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;