import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import Phone from './pages/Phone';
import Todo from './pages/Todo';
import History from './pages/History';
import People from './pages/People';
import Login from './pages/Login';
import BusinessNumber from './pages/manage/BusinessNumber';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import usePhoneStore from './store/phone.store';

// Create a separate component for routes that needs navigation
function AppRoutes() {
  const navigate = useNavigate();
  const setNavigate = usePhoneStore((state) => state.setNavigate);

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate, setNavigate]);

  return (
    <Routes>
      <Route element={<Layout showNav={false} showlogo={false} showuser={false} />}>
        <Route path="/login" element={<Login />} />
      </Route>
      {/* Group all protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout showNav={true} showlogo={true} />}>
          <Route path="/" element={<Phone />} />
          <Route path="/phone" element={<Phone />} />
          <Route path="/todo" element={<Todo />} />
          <Route path="/history" element={<History />} />
          <Route path="/people" element={<People />} />
          <Route path="/manage/business-number" element={<BusinessNumber />} />
        </Route>
      </Route>
    </Routes>
  );
}

// Main App component
function App() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Card: {
            fontFamily: 'var(--default-font-family)',
            borderRadius: 0,
          },
        },
      }}
    >
      <Router>
        <AppRoutes />
      </Router>
    </ConfigProvider>
  );
}

export default App;
