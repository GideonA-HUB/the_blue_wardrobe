import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { 
  FaChartLine, FaShoppingCart, FaUsers, FaEnvelope, FaVideo, FaImages, 
  FaBox, FaEdit, FaTrash, FaPlus, FaSignOutAlt, FaSpinner, FaCheckCircle,
  FaTimesCircle, FaEye, FaArrowUp, FaArrowDown, FaTshirt, FaUser
} from 'react-icons/fa'
import api from '../lib/api'
import { useLoading } from '../hooks/useLoading'

type Metrics = {
  total_sales: number
  total_orders: number
  daily_sales: number
  weekly_sales: number
  monthly_sales: number
  daily_sales_chart: Array<{ date: string; day: string; sales: number }>
  monthly_sales_chart: Array<{ month: string; sales: number }>
  order_status_chart: Array<{ status: string; count: number }>
  total_customers: number
  total_subscribers: number
  total_contact_messages: number
  total_collections: number
  total_designs: number
}

type Collection = {
  id: number
  code: string
  title: string
  story: string
  featured_image?: string
}

type Video = {
  id: number
  title: string
  description: string
  video_url: string
  thumbnail?: string
  order: number
  is_featured: boolean
  video_type: string
}

type InfoCard = {
  id: number
  title: string
  description: string
  color: string
  order: number
  is_active: boolean
}

type Order = {
  id: number
  total_amount: number
  status: string
  created_at: string
  customer?: { email: string; first_name: string; last_name: string }
}

type ContactMessage = {
  id: number
  name: string
  email: string
  message: string
  created_at: string
}

type Subscriber = {
  id: number
  email: string
  subscribed_at: string
}

type Design = {
  id: number
  sku: string
  title: string
  description: string
  price: number
  sizes: string[]
  images: string[]
  stock: number
  collection_id: number
  collection?: string
}

type Customer = {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string
  created_at: string
}

type Material = {
  id: number
  name: string
  description: string
}

const COLORS = ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe']

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken'))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [infoCards, setInfoCards] = useState<InfoCard[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [designs, setDesigns] = useState<Design[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'collections' | 'designs' | 'videos' | 'info-cards' | 'orders' | 'messages' | 'subscribers' | 'customers'>('overview')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState<{ type: string; item?: any } | null>(null)
  const { setLoading: setGlobalLoading } = useLoading()

  useEffect(() => {
    document.title = 'Owner Dashboard — THE BLUE WARDROBE'
    if (token) {
      fetchAllData()
      const interval = setInterval(fetchAllData, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [token])

  const fetchAllData = async () => {
    if (!token) return
    setLoading(true)
    setGlobalLoading(true)
    try {
      const headers = { Authorization: `Token ${token}` }
      
      const [metricsRes, collectionsRes, videosRes, infoCardsRes, ordersRes, messagesRes, subscribersRes, designsRes, customersRes, materialsRes] = await Promise.all([
        api.get('/admin/metrics/', { headers }),
        api.get('/admin/collections/', { headers }),
        api.get('/admin/videos/', { headers }),
        api.get('/admin/info-cards/', { headers }),
        api.get('/admin/orders/', { headers }),
        api.get('/admin/contact-messages/', { headers }),
        api.get('/admin/subscribers/', { headers }),
        api.get('/admin/designs/', { headers }),
        api.get('/admin/customers/', { headers }),
        api.get('/admin/materials/', { headers }).catch(() => ({ data: [] })),
      ])
      
      setMetrics(metricsRes.data)
      setCollections(collectionsRes.data)
      setVideos(videosRes.data)
      setInfoCards(infoCardsRes.data)
      setOrders(ordersRes.data)
      setContactMessages(messagesRes.data)
      setSubscribers(subscribersRes.data)
      setDesigns(designsRes.data)
      setCustomers(customersRes.data)
      setMaterials(materialsRes.data)
      setError(null)
    } catch (err: any) {
      setError('Failed to fetch data. Please check your credentials.')
      if (err.response?.status === 401) {
        handleLogout()
      }
    } finally {
      setLoading(false)
      setGlobalLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const response = await api.post('/auth/token/', { username, password })
      const newToken = response.data.token
      localStorage.setItem('adminToken', newToken)
      setToken(newToken)
      await fetchAllData()
    } catch (err) {
      setError('Login failed. Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    setToken(null)
    setMetrics(null)
    setCollections([])
    setVideos([])
    setInfoCards([])
    setOrders([])
    setContactMessages([])
    setSubscribers([])
  }

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    if (!token) return
    try {
      await api.patch(`/admin/orders/${orderId}/`, { status: newStatus }, {
        headers: { Authorization: `Token ${token}` }
      })
      await fetchAllData()
    } catch (err) {
      setError('Failed to update order status')
    }
  }

  const handleDelete = async (type: string, id: number) => {
    if (!token || !window.confirm(`Are you sure you want to delete this ${type}?`)) return
    try {
      await api.delete(`/admin/${type}/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      })
      await fetchAllData()
      setShowModal(null)
    } catch (err) {
      setError(`Failed to delete ${type}`)
    }
  }

  const handleSave = async (type: string, data: any, id?: number) => {
    if (!token) return
    try {
      const headers = { Authorization: `Token ${token}` }
      if (id) {
        await api.patch(`/admin/${type}/${id}/`, data, { headers })
      } else {
        await api.post(`/admin/${type}/`, data, { headers })
      }
      await fetchAllData()
      setShowModal(null)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to save ${type}`)
    }
  }

  if (!token) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-wardrobe-light/10 via-white to-blue-wardrobe-light/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl border border-blue-wardrobe-light/20 max-w-md w-full mx-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-semibold text-blue-wardrobe-dark mb-2">
              Owner Dashboard
            </h1>
            <p className="text-gray-600">Sign in to manage THE BLUE WARDROBE</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all"
                required
              />
            </div>
            {error && (
              <motion.p
                className="text-red-600 text-sm text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin" /> Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-wardrobe-light/5 via-white to-blue-wardrobe-light/10">
      {/* Parallax Header */}
      <motion.header
        className="relative bg-gradient-to-br from-blue-wardrobe-dark via-blue-wardrobe-light to-blue-wardrobe-dark border-b border-blue-wardrobe-light/10 shadow-lg sticky top-0 z-50 overflow-hidden"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 80%, white 0%, transparent 50%)',
            backgroundSize: '200% 200%',
          }}
        />
        <div className="relative container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-serif font-semibold text-white drop-shadow-lg">
            Owner Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </motion.header>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: FaChartLine },
            { id: 'collections', label: 'Collections', icon: FaImages },
            { id: 'designs', label: 'Designs', icon: FaTshirt },
            { id: 'videos', label: 'Videos', icon: FaVideo },
            { id: 'info-cards', label: 'Info Cards', icon: FaBox },
            { id: 'orders', label: 'Orders', icon: FaShoppingCart },
            { id: 'messages', label: 'Messages', icon: FaEnvelope },
            { id: 'subscribers', label: 'Subscribers', icon: FaUsers },
            { id: 'customers', label: 'Customers', icon: FaUser },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-wardrobe-dark text-white shadow-lg'
                    : 'bg-white text-blue-wardrobe-dark hover:bg-blue-wardrobe-light/10 border border-blue-wardrobe-light/20'
                }`}
              >
                <Icon /> {tab.label}
              </button>
            )
          })}
        </div>

        {error && (
          <motion.div
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* Content */}
        {activeTab === 'overview' && metrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Sales', value: `NGN ${metrics.total_sales.toLocaleString()}`, icon: FaChartLine, color: 'blue' },
                { label: 'Total Orders', value: metrics.total_orders.toString(), icon: FaShoppingCart, color: 'blue' },
                { label: 'Today\'s Sales', value: `NGN ${metrics.daily_sales.toLocaleString()}`, icon: FaArrowUp, color: 'green' },
                { label: 'This Week', value: `NGN ${metrics.weekly_sales.toLocaleString()}`, icon: FaChartLine, color: 'blue' },
                { label: 'This Month', value: `NGN ${metrics.monthly_sales.toLocaleString()}`, icon: FaChartLine, color: 'blue' },
                { label: 'Customers', value: metrics.total_customers.toString(), icon: FaUsers, color: 'blue' },
                { label: 'Subscribers', value: metrics.total_subscribers.toString(), icon: FaUsers, color: 'blue' },
                { label: 'Collections', value: metrics.total_collections.toString(), icon: FaImages, color: 'blue' },
              ].map((metric, index) => {
                const Icon = metric.icon
                return (
                  <motion.div
                    key={metric.label}
                    className="bg-white p-6 rounded-xl shadow-md border border-blue-wardrobe-light/10 hover:shadow-lg transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`text-2xl text-blue-wardrobe-light`} />
                      <span className="text-xs uppercase tracking-wider text-gray-500">{metric.label}</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-wardrobe-dark">{metric.value}</div>
                  </motion.div>
                )
              })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Daily Sales Chart */}
              <motion.div
                className="bg-white p-6 rounded-xl shadow-md border border-blue-wardrobe-light/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-xl font-semibold text-blue-wardrobe-dark mb-4">Daily Sales (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.daily_sales_chart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" stroke="#1e3a8a" />
                    <YAxis stroke="#1e3a8a" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #1e40af', borderRadius: '8px' }}
                      formatter={(value: any) => `NGN ${value.toLocaleString()}`}
                    />
                    <Bar dataKey="sales" fill="#1e40af" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Order Status Pie Chart */}
              <motion.div
                className="bg-white p-6 rounded-xl shadow-md border border-blue-wardrobe-light/10"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-xl font-semibold text-blue-wardrobe-dark mb-4">Order Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics.order_status_chart}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {metrics.order_status_chart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Monthly Sales Chart */}
            <motion.div
              className="bg-white p-6 rounded-xl shadow-md border border-blue-wardrobe-light/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-xl font-semibold text-blue-wardrobe-dark mb-4">Monthly Sales (Last 6 Months)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.monthly_sales_chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#1e3a8a" />
                  <YAxis stroke="#1e3a8a" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #1e40af', borderRadius: '8px' }}
                    formatter={(value: any) => `NGN ${value.toLocaleString()}`}
                  />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </motion.div>
        )}

        {/* Collections Tab */}
        {activeTab === 'collections' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md border border-blue-wardrobe-light/10 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-blue-wardrobe-dark">Collections</h2>
              <button 
                onClick={() => setShowModal({ type: 'collection' })}
                className="flex items-center gap-2 px-4 py-2 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-colors shadow-lg hover:shadow-xl"
              >
                <FaPlus /> Add Collection
              </button>
            </div>
            {collections.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-blue-wardrobe-light/30 rounded-lg">
                <FaImages className="mx-auto text-4xl text-blue-wardrobe-light/50 mb-4" />
                <p className="text-gray-600">No collections yet. Create your first Dress Diary collection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.map((collection) => (
                  <motion.div
                    key={collection.id}
                    className="border border-blue-wardrobe-light/20 rounded-lg p-4 hover:shadow-md transition-all duration-300 bg-white"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="font-semibold text-blue-wardrobe-dark">{collection.code} — {collection.title}</div>
                    <div className="text-sm text-gray-600 mt-2 line-clamp-2">{collection.story}</div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setShowModal({ type: 'collection', item: collection })}
                        className="text-blue-wardrobe-light hover:text-blue-wardrobe-dark transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete('collections', collection.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Designs Tab */}
        {activeTab === 'designs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md border border-blue-wardrobe-light/10 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-blue-wardrobe-dark">Designs</h2>
              <button
                onClick={() => setShowModal({ type: 'design' })}
                className="flex items-center gap-2 px-4 py-2 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-colors shadow-lg hover:shadow-xl"
              >
                <FaPlus /> Add Design
              </button>
            </div>
            {designs.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-blue-wardrobe-light/30 rounded-lg">
                <FaTshirt className="mx-auto text-4xl text-blue-wardrobe-light/50 mb-4" />
                <p className="text-gray-600">No designs yet. Add designs to your collections.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-blue-wardrobe-light/20">
                      <th className="text-left py-3 px-4 text-blue-wardrobe-dark">SKU</th>
                      <th className="text-left py-3 px-4 text-blue-wardrobe-dark">Title</th>
                      <th className="text-left py-3 px-4 text-blue-wardrobe-dark">Collection</th>
                      <th className="text-left py-3 px-4 text-blue-wardrobe-dark">Price</th>
                      <th className="text-left py-3 px-4 text-blue-wardrobe-dark">Stock</th>
                      <th className="text-left py-3 px-4 text-blue-wardrobe-dark">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {designs.map((design) => (
                      <tr key={design.id} className="border-b border-blue-wardrobe-light/10 hover:bg-blue-wardrobe-light/5 transition-colors">
                        <td className="py-3 px-4 font-mono text-sm">{design.sku}</td>
                        <td className="py-3 px-4 font-semibold text-blue-wardrobe-dark">{design.title}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{design.collection || 'N/A'}</td>
                        <td className="py-3 px-4 font-semibold">NGN {design.price.toLocaleString()}</td>
                        <td className="py-3 px-4">{design.stock}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowModal({ type: 'design', item: design })}
                              className="text-blue-wardrobe-light hover:text-blue-wardrobe-dark transition-colors"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete('designs', design.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md border border-blue-wardrobe-light/10 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-blue-wardrobe-dark">Videos</h2>
              <button
                onClick={() => setShowModal({ type: 'video' })}
                className="flex items-center gap-2 px-4 py-2 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-colors shadow-lg hover:shadow-xl"
              >
                <FaPlus /> Add Video
              </button>
            </div>
            {videos.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-blue-wardrobe-light/30 rounded-lg">
                <FaVideo className="mx-auto text-4xl text-blue-wardrobe-light/50 mb-4" />
                <p className="text-gray-600">No videos yet. Add promotional or product videos.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {videos.map((video) => (
                  <motion.div
                    key={video.id}
                    className="border border-blue-wardrobe-light/20 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-all duration-300 bg-white"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-blue-wardrobe-dark">{video.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{video.description}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        Type: {video.video_type} | Order: {video.order} | {video.is_featured ? 'Featured' : 'Regular'}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setShowModal({ type: 'video', item: video })}
                        className="text-blue-wardrobe-light hover:text-blue-wardrobe-dark transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete('videos', video.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Info Cards Tab */}
        {activeTab === 'info-cards' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md border border-blue-wardrobe-light/10 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-blue-wardrobe-dark">Info Cards</h2>
              <button
                onClick={() => setShowModal({ type: 'info-card' })}
                className="flex items-center gap-2 px-4 py-2 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-colors shadow-lg hover:shadow-xl"
              >
                <FaPlus /> Add Info Card
              </button>
            </div>
            {infoCards.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-blue-wardrobe-light/30 rounded-lg">
                <FaBox className="mx-auto text-4xl text-blue-wardrobe-light/50 mb-4" />
                <p className="text-gray-600">No info cards yet. Create beautiful business information cards.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {infoCards.map((card) => (
                  <motion.div
                    key={card.id}
                    className="border border-blue-wardrobe-light/20 rounded-lg p-4 hover:shadow-md transition-all duration-300 bg-white"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="font-semibold text-blue-wardrobe-dark">{card.title}</div>
                    <div className="text-sm text-gray-600 mt-2">{card.description}</div>
                    <div className="text-xs text-gray-500 mt-2">Color: {card.color} | Order: {card.order} | {card.is_active ? 'Active' : 'Inactive'}</div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setShowModal({ type: 'info-card', item: card })}
                        className="text-blue-wardrobe-light hover:text-blue-wardrobe-dark transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete('info-cards', card.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md border border-blue-wardrobe-light/10 p-6"
          >
            <h2 className="text-2xl font-semibold text-blue-wardrobe-dark mb-6">Orders</h2>
            {orders.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-blue-wardrobe-light/30 rounded-lg">
                <FaShoppingCart className="mx-auto text-4xl text-blue-wardrobe-light/50 mb-4" />
                <p className="text-gray-600">No orders yet. Orders will appear here once customers make purchases.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-blue-wardrobe-light/20">
                      <th className="text-left py-3 px-4 text-blue-wardrobe-dark">Order ID</th>
                      <th className="text-left py-3 px-4 text-blue-wardrobe-dark">Customer</th>
                      <th className="text-left py-3 px-4 text-blue-wardrobe-dark">Amount</th>
                      <th className="text-left py-3 px-4 text-blue-wardrobe-dark">Status</th>
                      <th className="text-left py-3 px-4 text-blue-wardrobe-dark">Date</th>
                      <th className="text-left py-3 px-4 text-blue-wardrobe-dark">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <motion.tr
                        key={order.id}
                        className="border-b border-blue-wardrobe-light/10 hover:bg-blue-wardrobe-light/5 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="py-3 px-4 font-semibold">#{order.id}</td>
                        <td className="py-3 px-4">{order.customer?.email || 'N/A'}</td>
                        <td className="py-3 px-4 font-semibold text-blue-wardrobe-dark">NGN {order.total_amount.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="border border-blue-wardrobe-light/20 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light transition-all"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <button className="text-blue-wardrobe-light hover:text-blue-wardrobe-dark transition-colors">
                            <FaEye />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md border border-blue-wardrobe-light/10 p-6"
          >
            <h2 className="text-2xl font-semibold text-blue-wardrobe-dark mb-6">Contact Messages</h2>
            {contactMessages.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-blue-wardrobe-light/30 rounded-lg">
                <FaEnvelope className="mx-auto text-4xl text-blue-wardrobe-light/50 mb-4" />
                <p className="text-gray-600">No messages yet. Customer inquiries will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {contactMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    className="border border-blue-wardrobe-light/20 rounded-lg p-4 hover:shadow-md transition-all duration-300 bg-white"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-blue-wardrobe-dark">{message.name}</div>
                        <div className="text-sm text-gray-600">{message.email}</div>
                      </div>
                      <div className="text-xs text-gray-500">{new Date(message.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="text-gray-700 mt-2 leading-relaxed">{message.message}</div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Subscribers Tab */}
        {activeTab === 'subscribers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md border border-blue-wardrobe-light/10 p-6"
          >
            <h2 className="text-2xl font-semibold text-blue-wardrobe-dark mb-6">Newsletter Subscribers</h2>
            {subscribers.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-blue-wardrobe-light/30 rounded-lg">
                <FaUsers className="mx-auto text-4xl text-blue-wardrobe-light/50 mb-4" />
                <p className="text-gray-600">No subscribers yet. Newsletter signups will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-blue-wardrobe-light/20">
                      <th className="text-left py-3 px-4 text-blue-wardrobe-dark">Email</th>
                      <th className="text-left py-3 px-4 text-blue-wardrobe-dark">Subscribed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((subscriber) => (
                      <motion.tr
                        key={subscriber.id}
                        className="border-b border-blue-wardrobe-light/10 hover:bg-blue-wardrobe-light/5 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="py-3 px-4">{subscriber.email}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{new Date(subscriber.subscribed_at).toLocaleDateString()}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md border border-blue-wardrobe-light/10 p-6"
          >
            <h2 className="text-2xl font-semibold text-blue-wardrobe-dark mb-6">Customers</h2>
            {customers.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-blue-wardrobe-light/30 rounded-lg">
                <FaUser className="mx-auto text-4xl text-blue-wardrobe-light/50 mb-4" />
                <p className="text-gray-600">No customers yet. Customer information will appear here after orders.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-blue-wardrobe-light/20">
                      <th className="text-left py-3 px-4 text-blue-wardrobe-dark">Email</th>
                      <th className="text-left py-3 px-4 text-blue-wardrobe-dark">Name</th>
                      <th className="text-left py-3 px-4 text-blue-wardrobe-dark">Phone</th>
                      <th className="text-left py-3 px-4 text-blue-wardrobe-dark">Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <motion.tr
                        key={customer.id}
                        className="border-b border-blue-wardrobe-light/10 hover:bg-blue-wardrobe-light/5 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td className="py-3 px-4">{customer.email}</td>
                        <td className="py-3 px-4">{customer.first_name} {customer.last_name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{customer.phone || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{new Date(customer.created_at).toLocaleDateString()}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Modals for Add/Edit */}
        {showModal && (
          <Modal
            type={showModal.type}
            item={showModal.item}
            collections={collections}
            materials={materials}
            onClose={() => setShowModal(null)}
            onSave={(data) => {
              const apiType = showModal.type === 'info-card' ? 'info-cards' : showModal.type === 'collection' ? 'collections' : showModal.type === 'design' ? 'designs' : showModal.type === 'video' ? 'videos' : showModal.type
              handleSave(apiType, data, showModal.item?.id)
            }}
          />
        )}
      </div>
    </div>
  )
}

// Modal Component for Add/Edit Forms
function Modal({ type, item, collections, materials, onClose, onSave }: {
  type: string
  item?: any
  collections: Collection[]
  materials: Material[]
  onClose: () => void
  onSave: (data: any) => void
}) {
  const [formData, setFormData] = useState<any>(item || getDefaultData(type))
  const [saving, setSaving] = useState(false)

  function getDefaultData(type: string) {
    switch (type) {
      case 'collection':
        return { code: '', title: '', story: '', material_ids: [] }
      case 'design':
        return { sku: '', title: '', description: '', price: '', sizes: [], stock: 0, collection_id: '', images: [] }
      case 'video':
        return { title: '', description: '', video_url: '', video_type: 'promotional', order: 0, is_featured: false }
      case 'info-card':
        return { title: '', description: '', color: 'blue', order: 0, is_active: true, icon: '', link_url: '', link_text: '' }
      default:
        return {}
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(formData)
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-blue-wardrobe-light/10 flex items-center justify-between">
          <h3 className="text-2xl font-serif font-semibold text-blue-wardrobe-dark">
            {item ? 'Edit' : 'Add'} {type === 'info-card' ? 'Info Card' : type.charAt(0).toUpperCase() + type.slice(1)}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimesCircle size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {type === 'collection' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code (e.g., DDC 001)</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Story</label>
                <textarea
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  rows={4}
                  className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                />
              </div>
            </>
          )}

          {type === 'design' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Collection</label>
                  <select
                    value={formData.collection_id}
                    onChange={(e) => setFormData({ ...formData, collection_id: Number(e.target.value) })}
                    className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                    required
                  >
                    <option value="">Select Collection</option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (NGN)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sizes (comma-separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(formData.sizes) ? formData.sizes.join(', ') : formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                    placeholder="S, M, L, XL"
                    className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                  />
                </div>
              </div>
            </>
          )}

          {type === 'video' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                <input
                  type="url"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={formData.video_type}
                    onChange={(e) => setFormData({ ...formData, video_type: e.target.value })}
                    className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                  >
                    <option value="promotional">Promotional</option>
                    <option value="product">Product</option>
                    <option value="collection">Collection</option>
                    <option value="design">Design</option>
                    <option value="behind_scenes">Behind the Scenes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4 text-blue-wardrobe-light rounded focus:ring-blue-wardrobe-light"
                    />
                    <span className="text-sm text-gray-700">Featured</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {type === 'info-card' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color Theme</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                  >
                    <option value="blue">Blue</option>
                    <option value="white">White</option>
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="navy">Navy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-blue-wardrobe-light rounded focus:ring-blue-wardrobe-light"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link Text (Optional)</label>
                  <input
                    type="text"
                    value={formData.link_text}
                    onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                    className="w-full border-2 border-blue-wardrobe-light/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex gap-4 pt-4 border-t border-blue-wardrobe-light/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-blue-wardrobe-light/30 text-blue-wardrobe-dark rounded-full hover:bg-blue-wardrobe-light/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <FaSpinner className="animate-spin" /> Saving...
                </span>
              ) : (
                item ? 'Update' : 'Create'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
