
import { useState, useEffect } from 'react'
import './App.css'
import { getProducts } from './services/productService'

const API_URL = 'http://localhost:8080/api'

const banners = [
  {
    image: '/images/banner-1.jpg',
    tag: 'BUY SMART. SELL EASY.',
    title: 'A Better Way to Buy and Sell',
    description: 'Discover great deals on products from people in your community.',
    button: 'Explore Products'
  },
  {
    image: '/images/banner-2.jpg',
    tag: 'GREAT DEALS AWAIT',
    title: 'Find Your Next Favourite',
    description: 'Browse electronics, books, furniture and much more.',
    button: 'Shop Now'
  },
  {
    image: '/images/banner-3.jpg',
    tag: 'GIVE ITEMS A SECOND LIFE',
    title: 'Sell What You No Longer Need',
    description: 'Turn your unused items into opportunities.',
    button: 'Start Selling'
  }
]

const categories = [
  { name: 'All', icon: '🛍️' },
  { name: 'Electronics', icon: '💻' },
  { name: 'Mobiles', icon: '📱' },
  { name: 'Furniture', icon: '🪑' },
  { name: 'Books', icon: '📚' },
  { name: 'Vehicles', icon: '🚗' }
]

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  category: 'Electronics',
  condition: 'Good'
}

function App() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [adminOpen, setAdminOpen] = useState(false)
  const [adminSection, setAdminSection] = useState('dashboard')
  const [adminDark, setAdminDark] = useState(() => localStorage.getItem('trustmartAdminTheme') === 'dark')

  const [adminStats, setAdminStats] = useState({ totalUsers: 0, totalProducts: 0 })
  const [adminUsers, setAdminUsers] = useState([])
  const [adminProducts, setAdminProducts] = useState([])
  const [adminUserSearch, setAdminUserSearch] = useState('')
  const [adminProductSearch, setAdminProductSearch] = useState('')

  const [adminError, setAdminError] = useState('')


  const [sellOpen, setSellOpen] = useState(false)
  const [sellLoading, setSellLoading] = useState(false)
  const [sellError, setSellError] = useState('')
  const [sellMessage, setSellMessage] = useState('')
  const [newProduct, setNewProduct] = useState(emptyProduct)

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('trustmartUser')) || null
    } catch {
      return null
    }
  })

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    setLoading(true)
    setError('')

    try {
      const data = await getProducts()
      setProducts(Array.isArray(data) ? data : [])
    } catch {
      setError('Could not load products. Make sure your Spring Boot backend is running.')
    } finally {
      setLoading(false)
    }
  }


  const toggleAdminTheme = () => {
    setAdminDark((previous) => {
      const next = !previous
      localStorage.setItem('trustmartAdminTheme', next ? 'dark' : 'light')
      return next
    })
  }

  const loadAdminDashboard = async () => {
    setAdminError('')
    const token = localStorage.getItem('trustmartToken')


    try {
      const headers = { Authorization: `Bearer ${token}` }

      const [statsResponse, usersResponse, productsResponse] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers }),
        fetch(`${API_URL}/admin/users`, { headers }),
        fetch(`${API_URL}/admin/products`, { headers })
      ])

      if (!statsResponse.ok || !usersResponse.ok || !productsResponse.ok) {
        throw new Error('Could not load dashboard. Check your ADMIN login and backend.')
      }

      setAdminStats(await statsResponse.json())
      setAdminUsers(await usersResponse.json())
      setAdminProducts(await productsResponse.json())
    } catch (err) {
      setAdminError(err.message || 'Something went wrong.')
    }
  }

  const deleteAdminProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return

    setAdminError('')

    try {
      const response = await fetch(`${API_URL}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('trustmartToken')}`
        }
      })

      if (!response.ok) throw new Error('Could not delete product.')

      await loadAdminDashboard()
      await loadProducts()
    } catch (err) {
      setAdminError(err.message || 'Could not delete product.')
    }
  }


  const filteredAdminUsers = adminUsers.filter((adminUser) =>
    `${adminUser.name || ''} ${adminUser.email || ''} ${adminUser.role || ''}`
      .toLowerCase()
      .includes(adminUserSearch.toLowerCase())
  )

  const filteredAdminProducts = adminProducts.filter((product) =>
    `${product.name || ''} ${product.category || ''} ${product.sellerName || ''}`
      .toLowerCase()
      .includes(adminProductSearch.toLowerCase())
  )



  function openAuth(mode = 'login') {
    setAuthMode(mode)
    setAuthError('')
    setAuthMessage('')
    setPassword('')
    setAuthOpen(true)
  }

  function closeAuth() {
    setAuthOpen(false)
    setAuthError('')
    setAuthMessage('')
    setPassword('')
  }

  async function handleAuth(event) {
    event.preventDefault()
    setAuthError('')
    setAuthMessage('')
    setAuthLoading(true)

    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register'

      const requestBody =
        authMode === 'login'
          ? { email: email.trim(), password }
          : { name: name.trim(), email: email.trim(), password }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.detail ||
          data.message ||
          data.error ||
          (response.status === 409
            ? 'An account with this email already exists.'
            : 'Authentication failed. Please check your details.')
        )
      }

      if (!data.token) {
        throw new Error('The server did not return an authentication token.')
      }

      const loggedInUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role
      }

      localStorage.setItem('trustmartToken', data.token)
      localStorage.setItem('trustmartUser', JSON.stringify(loggedInUser))

      setUser(loggedInUser)
      setPassword('')
      setAuthOpen(false)

      if (sellOpen && ['SELLER', 'ADMIN'].includes(
        String(loggedInUser.role || '').toUpperCase()
      )) {
        setSellError('')
      }
    } catch (err) {
      setAuthError(
        err.message || 'Unable to connect to the server. Check your backend.'
      )
    } finally {
      setAuthLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('trustmartToken')
    localStorage.removeItem('trustmartUser')
    setUser(null)
    setAuthMessage('')
    setAuthError('')
    setSellOpen(false)
  }

  function handleSell() {
    if (!user) {
      openAuth('login')
      return
    }

    const role = String(user.role || '').toUpperCase()

    if (!['SELLER', 'ADMIN'].includes(role)) {
      alert('Your account is a buyer account. Seller access is required to list products.')
      return
    }

    setNewProduct(emptyProduct)
    setSellError('')
    setSellMessage('')
    setSellOpen(true)
  }

  function closeSell() {
    if (sellLoading) return
    setSellOpen(false)
    setSellError('')
    setSellMessage('')
  }

  function updateProductField(event) {
    const { name, value } = event.target
    setNewProduct((previous) => ({
      ...previous,
      [name]: value
    }))
  }

  async function handleCreateProduct(event) {
    event.preventDefault()
    setSellError('')
    setSellMessage('')

    const token = localStorage.getItem('trustmartToken')

    if (!token) {
      setSellOpen(false)
      openAuth('login')
      return
    }

    if (!newProduct.name.trim() || !newProduct.description.trim()) {
      setSellError('Please enter the product name and description.')
      return
    }

    const price = Number(newProduct.price)

    if (!Number.isFinite(price) || price < 0) {
      setSellError('Enter a valid price of zero or more.')
      return
    }

    setSellLoading(true)

    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newProduct.name.trim(),
          description: newProduct.description.trim(),
          price,
          category: newProduct.category,
          condition: newProduct.condition,
          sellerName: user.name
        })
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Your login session may have expired. Please log out and log in again.')
        }

        if (response.status === 403) {
          throw new Error('Your account does not have seller permission. Check that you logged in again after changing your role to SELLER.')
        }

        throw new Error(
          data.detail ||
          data.message ||
          data.error ||
          `Could not create the listing (HTTP ${response.status}).`
        )
      }

      setSellMessage('Product listed successfully!')
      setNewProduct(emptyProduct)
      await loadProducts()

      setTimeout(() => {
        setSellOpen(false)
        setSellMessage('')
        document.getElementById('products')?.scrollIntoView({
          behavior: 'smooth'
        })
      }, 700)
    } catch (err) {
      setSellError(
        err.message || 'Unable to create the listing. Check your backend connection.'
      )
    } finally {
      setSellLoading(false)
    }
  }

  function handleProductDetails(product) {
    alert(
      `${product.name}\n\nDescription: ${product.description || 'No description'}\nPrice: ₹${Number(product.price).toLocaleString('en-IN')}\nCategory: ${product.category || 'Other'}\nCondition: ${product.condition || 'Pre-owned'}\nSeller: ${product.sellerName || 'TrustMart seller'}`
    )
  }

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase()

    const matchesSearch =
      (product.name || '').toLowerCase().includes(searchText) ||
      (product.description || '').toLowerCase().includes(searchText) ||
      (product.category || '').toLowerCase().includes(searchText)

    const matchesCategory =
      category === 'All' ||
      (product.category || '').toLowerCase() === category.toLowerCase()

    return matchesSearch && matchesCategory
  })


  return (
    <div className={adminOpen ? 'trustmart admin-mode' : 'trustmart'}>
      {adminOpen && (
        <div className={`admin-dashboard ${adminDark ? 'admin-dark' : 'admin-light'}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h1>TrustMart Admin Dashboard</h1>

            <button className="admin-theme-toggle" onClick={toggleAdminTheme}>
              {adminDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>

            <button className="login-button" onClick={() => setAdminOpen(false)}>
              Back to Home
            </button>
          </div>

          {adminError && (
            <p style={{ color: 'red' }}>{adminError}</p>
          )}

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', margin: '20px 0' }}>
            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', minWidth: '180px' }}>
              <h3>Total Users</h3>
              <h2>{adminStats.totalUsers}</h2>
            </div>

            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', minWidth: '180px' }}>
              <h3>Total Products</h3>
              <h2>{adminStats.totalProducts}</h2>
            </div>
          </div>

          <h2>Registered Users</h2>

          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={adminUserSearch}
              onChange={(e) => setAdminUserSearch(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '420px',
                padding: '12px 15px',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ overflowX: 'auto', marginBottom: '30px' }}>
            <table style={{ width: '100%', background: 'white', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px' }}>ID</th>
                  <th style={{ padding: '12px' }}>Name</th>
                  <th style={{ padding: '12px' }}>Email</th>
                  <th style={{ padding: '12px' }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdminUsers.map((person) => (
                  <tr key={person.id}>
                    <td style={{ padding: '12px' }}>{person.id}</td>
                    <td style={{ padding: '12px' }}>{person.name}</td>
                    <td style={{ padding: '12px' }}>{person.email}</td>
                    <td style={{ padding: '12px' }}>{person.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>


          <h2>Manage Product Listings</h2>

          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Search products by name, category, or seller..."
              value={adminProductSearch}
              onChange={(e) => setAdminProductSearch(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '420px',
                padding: '12px 15px',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>

            <table style={{ width: '100%', background: 'white', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px' }}>ID</th>
                  <th style={{ padding: '12px' }}>Product</th>
                  <th style={{ padding: '12px' }}>Price</th>
                  <th style={{ padding: '12px' }}>Seller</th>
                  <th style={{ padding: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdminProducts.map((product) => (
                  <tr key={product.id}>
                    <td style={{ padding: '12px' }}>{product.id}</td>
                    <td style={{ padding: '12px' }}>{product.name}</td>
                    <td style={{ padding: '12px' }}>₹{product.price}</td>
                    <td style={{ padding: '12px' }}>{product.sellerName}</td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => deleteAdminProduct(product.id)}
                        style={{ background: '#d93025', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <nav className="trust-navbar">

        <div className="container nav-container">
          <a className="brand" href="#home">
            <img
              src="/images/logo.png"
              alt="TrustMart logo"
              onError={(event) => {
                event.currentTarget.style.display = 'none'
              }}
            />
            <span>TrustMart</span>
          </a>

          <form
            className="market-search nav-search"
            onSubmit={(event) => {
              event.preventDefault()
              document.getElementById('products')?.scrollIntoView({
                behavior: 'smooth'
              })
            }}
          >
            <span className="search-icon">⌕</span>
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search products"
            />
            <button type="submit">Search</button>
          </form>

          <div className="nav-actions">
            <a className="nav-explore" href="#products">
              Explore
            </a>


            {user ? (
              <>
                <span className="trustmart-welcome">Hi, {user.name}</span>

                {String(user.role || '').toUpperCase() === 'ADMIN' && (
                  <>
                    <span className="trustmart-role">Admin</span>
                    <button
                      className="login-button"
                      onClick={() => {
                        setAdminOpen(true)
                        loadAdminDashboard()
                      }}
                    >
                      Admin Dashboard
                    </button>
                  </>
                )}

                <button className="login-button" onClick={logout}>
                  Logout
                </button>
              </>

            ) : (
              <button
                className="login-button"
                onClick={() => openAuth('login')}
              >
                Login
              </button>
            )}

            <button className="sell-button" onClick={handleSell}>
              Sell Item
            </button>
          </div>
        </div>
      </nav>

      <main id="home">
        <section className="banner-section">
          <div className="container">
            <div
              id="trustmartCarousel"
              className="carousel slide"
              data-bs-ride="carousel"
              data-bs-interval="4500"
            >
              <div className="carousel-indicators">
                {banners.map((banner, index) => (
                  <button
                    key={banner.image}
                    type="button"
                    data-bs-target="#trustmartCarousel"
                    data-bs-slide-to={index}
                    className={index === 0 ? 'active' : ''}
                    aria-label={`Slide ${index + 1}`}
                    aria-current={index === 0 ? 'true' : undefined}
                  />
                ))}
              </div>

              <div className="carousel-inner">
                {banners.map((banner, index) => (
                  <div
                    className={`carousel-item ${index === 0 ? 'active' : ''}`}
                    key={banner.image}
                  >
                    <img
                      className="banner-image"
                      src={banner.image}
                      alt={banner.title}
                      onError={(event) => {
                        event.currentTarget.style.display = 'none'
                      }}
                    />
                    <div className="banner-overlay" />
                    <div className="banner-content">
                      <span className="banner-tag">{banner.tag}</span>
                      <h1>{banner.title}</h1>
                      <p>{banner.description}</p>
                      <a
                        href={index === 2 ? '#sell-banner' : '#products'}
                        className="banner-button"
                        onClick={index === 2 ? (event) => {
                          event.preventDefault()
                          handleSell()
                        } : undefined}
                      >
                        {banner.button}
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target="#trustmartCarousel"
                data-bs-slide="prev"
                aria-label="Previous banner"
              >
                <span className="carousel-control-prev-icon" />
              </button>

              <button
                className="carousel-control-next"
                type="button"
                data-bs-target="#trustmartCarousel"
                data-bs-slide="next"
                aria-label="Next banner"
              >
                <span className="carousel-control-next-icon" />
              </button>
            </div>
          </div>
        </section>

        <div className="container marketplace-content">
          <section className="category-section">
            <div className="section-heading">
              <div>
                <h2>Browse Categories</h2>
                <p>Find exactly what you are looking for.</p>
              </div>
            </div>

            <div className="category-list">
              {categories.map((item) => (
                <button
                  key={item.name}
                  className={`category-card ${category === item.name ? 'selected' : ''}`}
                  onClick={() => setCategory(item.name)}
                >
                  <span className="category-icon">{item.icon}</span>
                  <span>{item.name === 'All' ? 'All Items' : item.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section id="products" className="products-section">
            <div className="section-heading">
              <div>
                <h2>Fresh Recommendations</h2>
                <p>Explore products available on TrustMart.</p>
              </div>
              <span className="item-count">{filteredProducts.length} items</span>
            </div>

            {loading ? (
              <div className="empty-state">
                <h3>Loading products...</h3>
              </div>
            ) : error ? (
              <div className="empty-state">
                <h3>Unable to load products</h3>
                <p>{error}</p>
                <button className="sell-button" onClick={loadProducts}>
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <h3>No products found</h3>
                <p>Try another search or select a different category.</p>
                <button
                  className="login-button"
                  onClick={() => {
                    setSearch('')
                    setCategory('All')
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {filteredProducts.map((product) => (
                  <div className="col-12 col-sm-6 col-lg-3" key={product.id}>
                    <article className="product-card">
                      <div className="product-image">
                        <div className="product-placeholder">
                          {product.category || 'TrustMart Product'}
                        </div>
                        <span className="condition-tag">
                          {product.condition || 'Pre-owned'}
                        </span>
                      </div>

                      <div className="product-info">
                        <span className="product-category">
                          {product.category || 'Other'}
                        </span>
                        <h3>{product.name}</h3>
                        <div className="product-price">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </div>
                        <button
                          className="product-button"
                          onClick={() => handleProductDetails(product)}
                        >
                          View Details
                        </button>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section id="sell-banner" className="sell-banner">
            <div>
              <span>SELL WITH TRUSTMART</span>
              <h2>Have something to sell?</h2>
              <p>Give your unused items a new home.</p>
            </div>
            <button className="sell-banner-button" onClick={handleSell}>
              Start Selling
            </button>
          </section>
        </div>
      </main>

      <footer className="trust-footer">
        <div className="container">
          <div className="row g-4">
            <div className="col-12 col-md-6 col-lg-6">
              <a className="footer-brand" href="#home">TrustMart</a>
              <p className="footer-description">
                A simple marketplace to discover great deals and give
                pre-owned products a second life.
              </p>
            </div>

            <div className="col-6 col-md-3">
              <h3>Explore</h3>
              <a href="#products">All Products</a>
              <a href="#products">Recommendations</a>
              <a href="#sell-banner">Sell an Item</a>
            </div>

            <div className="col-6 col-md-3">
              <h3>Account</h3>
              {user ? (
                <a
                  href="#home"
                  onClick={(event) => {
                    event.preventDefault()
                    logout()
                  }}
                >
                  Logout
                </a>
              ) : (
                <>
                  <a
                    href="#login"
                    onClick={(event) => {
                      event.preventDefault()
                      openAuth('login')
                    }}
                  >
                    Login
                  </a>
                  <a
                    href="#register"
                    onClick={(event) => {
                      event.preventDefault()
                      openAuth('register')
                    }}
                  >
                    Create Account
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} TrustMart. All rights reserved.</span>
            <span>Buy smart. Sell easy.</span>
          </div>
        </div>
      </footer>

      {authOpen && (
        <div
          className="auth-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeAuth()
          }}
        >
          <section
            className="auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
          >
            <button
              type="button"
              className="auth-close"
              onClick={closeAuth}
              aria-label="Close login window"
            >
              ×
            </button>

            <div className="auth-heading">
              <div className="auth-logo">T</div>
              <h2 id="auth-title">
                {authMode === 'login' ? 'Welcome Back!' : 'Join TrustMart'}
              </h2>
              <p>
                {authMode === 'login'
                  ? 'Log in to continue to TrustMart.'
                  : 'Create your account to get started.'}
              </p>
            </div>

            <form className="auth-form" onSubmit={handleAuth}>
              {authMode === 'register' && (
                <label>
                  Full Name
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                    minLength={2}
                  />
                </label>
              )}

              <label>
                Email Address
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  required
                  minLength={authMode === 'register' ? 8 : undefined}
                />
              </label>

              {authError && <p className="auth-error" role="alert">{authError}</p>}
              {authMessage && <p className="auth-success" role="status">{authMessage}</p>}

              <button className="auth-submit" type="submit" disabled={authLoading}>
                {authLoading
                  ? 'Please wait...'
                  : authMode === 'login' ? 'Login' : 'Create Account'}
              </button>
            </form>

            <p className="auth-switch">
              {authMode === 'login'
                ? "Don't have an account?"
                : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login')
                  setAuthError('')
                  setAuthMessage('')
                  setPassword('')
                }}
              >
                {authMode === 'login' ? 'Register' : 'Login'}
              </button>
            </p>
          </section>
        </div>
      )}

      {sellOpen && (
        <div
          className="sell-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSell()
          }}
        >
          <section
            className="sell-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sell-title"
          >
            <button
              type="button"
              className="sell-modal-close"
              onClick={closeSell}
              disabled={sellLoading}
              aria-label="Close sell item form"
            >
              ×
            </button>

            <div className="sell-modal-heading">
              <span className="sell-modal-icon">🛍️</span>
              <h2 id="sell-title">List an Item</h2>
              <p>Enter your product details to publish it on TrustMart.</p>
            </div>

            <form className="sell-form" onSubmit={handleCreateProduct}>
              <label>
                Product Name
                <input
                  name="name"
                  value={newProduct.name}
                  onChange={updateProductField}
                  placeholder="e.g. Used Laptop"
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Description
                <textarea
                  name="description"
                  value={newProduct.description}
                  onChange={updateProductField}
                  placeholder="Describe the item, its features and condition..."
                  rows={4}
                  maxLength={2000}
                  required
                />
              </label>

              <div className="sell-form-row">
                <label>
                  Price (₹)
                  <input
                    name="price"
                    type="number"
                    value={newProduct.price}
                    onChange={updateProductField}
                    placeholder="Enter price"
                    min="0"
                    step="0.01"
                    required
                  />
                </label>

                <label>
                  Category
                  <select
                    name="category"
                    value={newProduct.category}
                    onChange={updateProductField}
                    required
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Mobiles">Mobiles</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Books">Books</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              </div>

              <label>
                Item Condition
                <select
                  name="condition"
                  value={newProduct.condition}
                  onChange={updateProductField}
                  required
                >
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </label>

              <div className="sell-seller-info">
                Listing as <strong>{user?.name}</strong>
                <span>({user?.role})</span>
              </div>

              {sellError && (
                <p className="sell-form-error" role="alert">{sellError}</p>
              )}

              {sellMessage && (
                <p className="sell-form-success" role="status">{sellMessage}</p>
              )}

              <button
                className="sell-form-submit"
                type="submit"
                disabled={sellLoading}
              >
                {sellLoading ? 'Publishing...' : 'Publish Listing'}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
