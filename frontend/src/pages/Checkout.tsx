import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { useCart } from '../store/cart'
import { usePayCurrency, type PayCurrency } from '../store/checkoutCurrency'

type CartItem = {
  id: number
  design: {
    id: number
    title: string
  }
  size: number
  quantity: number
  unit_price: number
  subtotal: number
  is_available: boolean
}

type CartData = {
  id: number
  session_id: string
  customer_email: string
  items: CartItem[]
  total_items: number
  total_amount: number
  created_at: string
  updated_at: string
}

type FxSettings = {
  ngn_per_usd: string
  ngn_per_gbp: string
  ngn_per_cad?: string
  local_delivery_fee: string
  international_delivery_fee: string
}

type InternationalRegion = '' | 'US' | 'UK' | 'CA'

const REGION_LABELS: Record<Exclude<InternationalRegion, ''>, string> = {
  US: 'United States',
  UK: 'United Kingdom',
  CA: 'Canada',
}

export default function Checkout() {
  const localItems = useCart((s) => s.items)
  const navigate = useNavigate()

  const [serverCart, setServerCart] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [fx, setFx] = useState<FxSettings | null>(null)
  const { payCurrency, setPayCurrency } = usePayCurrency()
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [isInternationalDelivery, setIsInternationalDelivery] = useState(false)
  const [internationalRegion, setInternationalRegion] = useState<InternationalRegion>('')

  useEffect(() => {
    loadServerCart()
  }, [])

  useEffect(() => {
    api
      .get('/currency-fx/')
      .then((r) => setFx(r.data))
      .catch(() => setFx(null))
  }, [])

  const loadServerCart = async () => {
    try {
      setLoading(true)
      const response = await api.get('/cart/')
      setServerCart(response.data)
    } catch (error) {
      console.error('Failed to load cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const localDisplayItems = localItems.map((it) => ({
    id: it.id,
    design: { id: it.id, title: it.title },
    size: parseInt(it.size),
    quantity: it.qty,
    unit_price: it.price,
    subtotal: it.price * it.qty,
    is_available: true,
  }))

  const useServerCart = !!serverCart && serverCart.total_items > 0
  const displayItems = useServerCart ? serverCart.items : localDisplayItems

  const subtotal = useServerCart
    ? serverCart.total_amount
    : localItems.reduce((s, it) => s + it.price * it.qty, 0)

  const localFee = fx ? parseFloat(fx.local_delivery_fee) || 0 : 0
  const internationalFee = fx ? parseFloat(fx.international_delivery_fee) || 0 : 102000
  const deliveryFeeNgn = isInternationalDelivery ? internationalFee : localFee
  const orderTotalNgn = subtotal + deliveryFeeNgn

  const deliveryLineLabel = isInternationalDelivery
    ? internationalRegion
      ? `International Delivery (${internationalRegion === 'CA' ? 'Canada' : internationalRegion})`
      : 'International Delivery (US/UK/Canada)'
    : 'Delivery (Nigeria)'

  const chargeApprox = useMemo(() => {
    if (!fx || payCurrency === 'NGN') return null
    const npu = parseFloat(fx.ngn_per_usd)
    const npg = parseFloat(fx.ngn_per_gbp)
    if (payCurrency === 'USD' && npu > 0) return (orderTotalNgn / npu).toFixed(2)
    if (payCurrency === 'GBP' && npg > 0) return (orderTotalNgn / npg).toFixed(2)
    return null
  }, [fx, payCurrency, orderTotalNgn])

  const displayApprox = useMemo(() => {
    if (!fx || !isInternationalDelivery) return null
    const npu = parseFloat(fx.ngn_per_usd)
    const npg = parseFloat(fx.ngn_per_gbp)
    const npc = parseFloat(fx.ngn_per_cad || '0')
    return {
      usd: npu > 0 ? (orderTotalNgn / npu).toFixed(2) : null,
      gbp: npg > 0 ? (orderTotalNgn / npg).toFixed(2) : null,
      cad: npc > 0 ? (orderTotalNgn / npc).toFixed(2) : null,
      feeUsd: npu > 0 ? (deliveryFeeNgn / npu).toFixed(2) : null,
      feeGbp: npg > 0 ? (deliveryFeeNgn / npg).toFixed(2) : null,
    }
  }, [fx, isInternationalDelivery, orderTotalNgn, deliveryFeeNgn])

  const onInternationalToggle = (checked: boolean) => {
    setIsInternationalDelivery(checked)
    if (!checked) {
      setInternationalRegion('')
    }
  }

  const onPay = async () => {
    if (!email || !firstName || !lastName || !phone.trim() || !address.trim()) {
      alert('Please fill in all required fields')
      return
    }

    if (isInternationalDelivery && !internationalRegion) {
      alert('Please select whether you are in the US, UK, or Canada.')
      return
    }

    if (isInternationalDelivery && address.trim().length < 20) {
      alert(
        'Please provide your complete international address including street, city, and state/province so we can deliver correctly.'
      )
      return
    }

    if (displayItems.some((item) => !item.is_available)) {
      alert('Some items in your cart are no longer available. Please remove them before proceeding.')
      return
    }

    setProcessing(true)
    try {
      const cartItems = displayItems.map((item) => ({
        id: item.design.id,
        size: item.size,
        qty: item.quantity,
      }))

      const countryLabel = isInternationalDelivery
        ? REGION_LABELS[internationalRegion as Exclude<InternationalRegion, ''>]
        : 'Nigeria'

      const payload = {
        email,
        currency: payCurrency,
        metadata: {
          cart: cartItems,
          customer: {
            firstName,
            lastName,
            phone,
          },
          phone,
          deliveryAddress: address.trim(),
          isInternationalDelivery,
          internationalRegion: isInternationalDelivery ? internationalRegion : '',
          country: countryLabel,
        },
      }

      const path = '/flutterwave/initiate/'
      const resp = await api.post(path, payload)

      const authUrl = resp.data?.data?.link

      if (authUrl) {
        window.location.href = authUrl
      } else {
        alert('Failed to initiate payment. Please try again.')
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      alert(error.response?.data?.detail || 'Failed to initiate payment. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="text-gray-400 text-lg">Loading checkout…</div>
      </div>
    )
  }

  if (displayItems.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-600 text-lg mb-4">Your cart is empty.</p>
        <button
          onClick={() => navigate('/collections')}
          className="inline-block px-6 py-3 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-colors luxury-shadow"
        >
          Continue shopping
        </button>
      </div>
    )
  }

  const payDisabled =
    !firstName ||
    !lastName ||
    !email ||
    !phone.trim() ||
    !address.trim() ||
    processing ||
    displayItems.some((item) => !item.is_available) ||
    (isInternationalDelivery && !internationalRegion)

  return (
    <div className="py-8 md:py-12">
      <h1 className="text-4xl font-serif font-semibold text-blue-wardrobe-dark mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-blue-wardrobe-dark mb-6">Delivery Details</h2>
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              onPay()
            }}
          >
            <div className="rounded-lg border-2 border-blue-wardrobe-light/30 bg-blue-wardrobe-light/5 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInternationalDelivery}
                  onChange={(e) => onInternationalToggle(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-wardrobe-dark focus:ring-blue-wardrobe-light"
                />
                <span>
                  <span className="block text-sm font-semibold text-blue-wardrobe-dark">
                    International delivery (US, UK, or Canada)
                  </span>
                  <span className="block text-xs text-gray-600 mt-1 leading-relaxed">
                    Check this box if your order should be shipped outside Nigeria. You must provide your complete
                    and accurate international address so we can deliver correctly.
                  </span>
                </span>
              </label>

              {isInternationalDelivery && (
                <div className="mt-4 pl-7">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region *</label>
                  <select
                    value={internationalRegion}
                    onChange={(e) => setInternationalRegion(e.target.value as InternationalRegion)}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all"
                    required={isInternationalDelivery}
                  >
                    <option value="">Select US, UK, or Canada</option>
                    <option value="US">United States (US)</option>
                    <option value="UK">United Kingdom (UK)</option>
                    <option value="CA">Canada (CA)</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First name *</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last name *</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone number *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all"
                placeholder={isInternationalDelivery ? 'Include country code (e.g. +1 …)' : 'Your phone number'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isInternationalDelivery ? 'Full international address *' : 'Delivery Address *'}
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light focus:border-blue-wardrobe-light transition-all resize-none"
                rows={4}
                placeholder={
                  isInternationalDelivery
                    ? 'Street address, city, state/province — country is set from your region above'
                    : 'Enter your full delivery address in Nigeria'
                }
                required
              />
              {isInternationalDelivery && internationalRegion && (
                <p className="text-xs text-gray-500 mt-2">
                  Country for this order: <strong>{REGION_LABELS[internationalRegion]}</strong>
                </p>
              )}
            </div>
          </form>
        </div>
        <div>
          <div className="luxury-shadow-lg rounded-lg p-6 bg-white sticky top-24">
            <h3 className="text-xl font-serif font-semibold text-blue-wardrobe-dark mb-6">Order Summary</h3>

            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {displayItems.map((item) => (
                <div key={`${item.design.id}-${item.size}`} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.design.title}</div>
                    <div className="text-gray-500">
                      Size {item.size} × {item.quantity}
                    </div>
                  </div>
                  <div className="font-medium text-gray-900">NGN {item.subtotal.toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">NGN {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>VAT</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              <div className="flex justify-between text-gray-600 gap-4">
                <span>{deliveryLineLabel}</span>
                <span className={`font-semibold shrink-0 ${deliveryFeeNgn === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {deliveryFeeNgn === 0 ? 'FREE' : `NGN ${deliveryFeeNgn.toLocaleString()}`}
                </span>
              </div>
              {isInternationalDelivery && displayApprox && (displayApprox.feeUsd || displayApprox.feeGbp) && (
                <p className="text-xs text-gray-500 text-right">
                  Delivery ≈
                  {displayApprox.feeUsd ? ` $${displayApprox.feeUsd}` : ''}
                  {displayApprox.feeUsd && displayApprox.feeGbp ? ' /' : ''}
                  {displayApprox.feeGbp ? ` £${displayApprox.feeGbp}` : ''}
                  {' '}(approx.)
                </p>
              )}
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between text-lg font-bold text-blue-wardrobe-dark">
                  <span>Total</span>
                  <div className="text-right">
                    <div>NGN {orderTotalNgn.toLocaleString()}</div>
                    {payCurrency !== 'NGN' && chargeApprox != null && (
                      <div className="text-sm font-semibold text-gray-700 mt-1">
                        ≈ {payCurrency} {Number(chargeApprox).toLocaleString()}
                      </div>
                    )}
                    {isInternationalDelivery && payCurrency === 'NGN' && displayApprox && (
                      <div className="text-xs font-normal text-gray-500 mt-1 space-y-0.5">
                        {displayApprox.usd && <div>≈ USD {Number(displayApprox.usd).toLocaleString()}</div>}
                        {displayApprox.gbp && <div>≈ GBP {Number(displayApprox.gbp).toLocaleString()}</div>}
                        {internationalRegion === 'CA' && displayApprox.cad && (
                          <div>≈ CAD {Number(displayApprox.cad).toLocaleString()}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {displayItems.some((item) => !item.is_available) && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">
                  Some items are no longer available. Please remove them before proceeding.
                </p>
              </div>
            )}

            <div className="mb-4 mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment currency</label>
              <select
                value={payCurrency}
                onChange={(e) => setPayCurrency(e.target.value as PayCurrency)}
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-wardrobe-light"
              >
                <option value="NGN">Nigerian Naira (NGN)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="GBP">British Pound (GBP)</option>
              </select>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Catalogue and delivery fees are in NGN. We convert at checkout using the store&apos;s FX settings. Your
                card is charged in the currency you choose (where Flutterwave supports it).
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Payment method</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium border-blue-wardrobe-dark bg-blue-wardrobe-dark/5 text-blue-wardrobe-dark"
                >
                  Flutterwave
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={onPay}
                disabled={payDisabled}
                className="w-full px-6 py-4 bg-blue-wardrobe-dark text-white rounded-full hover:bg-blue-wardrobe-light transition-all duration-300 font-medium luxury-shadow hover:luxury-shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {processing ? 'Processing...' : 'Pay with Flutterwave'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:border-gray-400 transition-colors"
              >
                Back to Cart
              </button>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center mb-2">
                <strong>Secure payment via Flutterwave</strong>
              </p>
              <p className="text-xs text-gray-500 text-center">
                You will be redirected to complete your purchase on the provider&apos;s secure page.
              </p>
              <p className="text-xs text-gray-500 text-center mt-1">All transactions are encrypted and secure.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
