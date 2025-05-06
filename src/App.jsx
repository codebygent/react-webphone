import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Phone from './pages/Phone';
import Todo from './pages/Todo';
import History from './pages/History';
import People from './pages/People';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Group all protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Phone />} />
            <Route path="/phone" element={<Phone />} />
            <Route path="/todo" element={<Todo />} />
            <Route path="/history" element={<History />} />
            <Route path="/people" element={<People />} />
          </Route>
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
