import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from "./Dashboard/Dashboard.jsx"
import mixpanel from 'mixpanel-browser';
import Questionaire from "./Questionaire/Questionaire.jsx"
import PrivacyPolicy from "./PrivacyPolicy/PrivacyPolicy.jsx"
import './assets/base.css'

function App() {
  mixpanel.init('0e17fc0146b24ead1c281493c0fa07bd', { debug: true });
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/questionnaire" replace />} />
        <Route path="/questionnaire" element={<Questionaire />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/*<Route path="/login" element={<Login />} />*/}
        {/*<Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />*/}
      </Routes>
    </Router>
  );
}

export default App;
