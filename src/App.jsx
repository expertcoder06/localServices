import { Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Chatbot from './components/Chatbot'
import LandingPage from './pages/LandingPage'
import OnboardingPage from './pages/OnboardingPage'
import CustomerDashboard from './pages/CustomerDashboard'
import ProviderDashboard from './pages/ProviderDashboard'

function App() {
  const location = useLocation()
  const noNavFooterRoutes = ['/onboarding', '/dashboard', '/provider-dashboard']
  const showNavFooter = !noNavFooterRoutes.includes(location.pathname)

  return (
    <>
      {showNavFooter && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/provider-dashboard" element={<ProviderDashboard />} />
      </Routes>
      {showNavFooter && <Footer />}
      <Chatbot />
    </>
  )
}

export default App
