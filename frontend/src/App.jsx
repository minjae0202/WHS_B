import { Routes, Route } from 'react-router-dom'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'
import SocialSignupPage from './pages/SocialSignupPage'
import PasswordChangePage from './pages/PasswordChangePage'
import WithdrawPage from './pages/WithdrawPage'
import AccountPage from './pages/AccountPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import MyProductsPage from './pages/MyProductsPage'
import InvestmentsPage from './pages/InvestmentsPage'
import ProtectedRoute from './components/ProtectedRoute'


function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage />}
      />

      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/signup"
        element={<SignupPage />}
      />

      <Route
        path="/oauth/google/callback"
        element={
          <OAuthCallbackPage provider="google" />
        }
      />

      <Route
        path="/oauth/kakao/callback"
        element={
          <OAuthCallbackPage provider="kakao" />
        }
      />

      <Route
        path="/social-signup"
        element={<SocialSignupPage />}
      />

      <Route
        path="/password"
        element={<PasswordChangePage />}
      />

      <Route
        path="/withdraw"
        element={<WithdrawPage />}
      />

      <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:productId" element={<ProductDetailPage />} />
      <Route path="/my-products" element={<ProtectedRoute><MyProductsPage /></ProtectedRoute>} />
      <Route path="/investments" element={<ProtectedRoute><InvestmentsPage /></ProtectedRoute>} />
    </Routes>
  )
}


export default App
