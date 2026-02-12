import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Collections from './pages/Collections'
import CollectionDetail from './pages/CollectionDetail'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Success from './pages/Success'
import Contact from './pages/Contact'
import AdminDashboard from './pages/AdminDashboard'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LoadingSpinner from './components/LoadingSpinner'

export default function App() {
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    // Show loading spinner on initial load
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1200)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Show brief loading on route change
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-white text-blue-wardrobe-dark flex flex-col">
      {loading && <LoadingSpinner />}
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:id" element={<CollectionDetail />} />
          <Route path="/designs/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<Success />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/owner" element={<AdminDashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
