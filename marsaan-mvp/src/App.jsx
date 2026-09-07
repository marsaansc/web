import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Catalog from './pages/Catalog.jsx'
import Product from './pages/Product.jsx'
import RFQ from './pages/RFQ.jsx'
import Quality from './pages/Quality.jsx'
import Sourcing from './pages/Sourcing.jsx'
import Traceability from './pages/Traceability.jsx'
import Returns from './pages/Returns.jsx'
import Contact from './pages/Contact.jsx'
import Blueprint from './pages/Blueprint.jsx'
import Admin from './pages/Admin.jsx'

export default function App(){
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:sku" element={<Product />} />
          <Route path="/rfq" element={<RFQ />} />
          <Route path="/quality" element={<Quality />} />
          <Route path="/sourcing" element={<Sourcing />} />
          <Route path="/traceability" element={<Traceability />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blueprint" element={<Blueprint />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
