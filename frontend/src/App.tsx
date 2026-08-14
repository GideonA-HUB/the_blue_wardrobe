import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom'
import Home from './pages/Home'
import Designs from './pages/Designs'
import Collections from './pages/Collections'
import CollectionDetail from './pages/CollectionDetail'
import Product from './pages/Product'
import About from './pages/About'
import Blog from './pages/Blog'
import BlogPostDetail from './pages/BlogPostDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Success from './pages/Success'
import Contact from './pages/Contact'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import ShippingReturns from './pages/ShippingReturns'
import AdminDashboard from './pages/AdminDashboard'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LoadingSpinner from './components/LoadingSpinner'
import ScrollToTop from './components/ScrollToTop'
import ScrollControls from './components/ScrollControls'

export default function App() {
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const navType = useNavigationType()
  const isFirstLoad = React.useRef(true)

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false
      setLoading(true)
      const timer = setTimeout(() => setLoading(false), 1200)
      return () => clearTimeout(timer)
    }

    // Back/forward should not flash a full-page spinner (it resets scroll).
    if (navType === 'POP') {
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [location.pathname, navType])

  return (
    <div className="min-h-screen flex flex-col bg-[var(--tbw-bg)] text-[var(--tbw-text)] transition-colors duration-300">
      <ScrollToTop />
      {loading && <LoadingSpinner />}
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPostDetail />} />
          <Route path="/designs" element={<Designs />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:id" element={<CollectionDetail />} />
          <Route path="/designs/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<Success />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shipping-returns" element={<ShippingReturns />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/owner" element={<AdminDashboard />} />
        </Routes>
      </main>
      <Footer />
      <ScrollControls />
    </div>
  )
}
