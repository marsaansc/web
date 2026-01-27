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
import Compliance from './pages/Compliance.jsx'
import Shipping from './pages/Shipping.jsx'
import Manufacturers from './pages/Manufacturers.jsx'
import Distributors from './pages/Distributors.jsx'
import ReferenceDesigns from './pages/ReferenceDesigns.jsx'
import ApplicationNotes from './pages/ApplicationNotes.jsx'
import EngineeringSupport from './pages/EngineeringSupport.jsx'
import VendorDocuments from './pages/VendorDocuments.jsx'
import ContractPricing from './pages/ContractPricing.jsx'
import ApprovedVendor from './pages/ApprovedVendor.jsx'
import TrackRFQ from './pages/TrackRFQ.jsx'
import Portal from './pages/Portal.jsx'

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
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/manufacturers" element={<Manufacturers />} />
          <Route path="/distributors" element={<Distributors />} />
          <Route path="/reference-designs" element={<ReferenceDesigns />} />
          <Route path="/application-notes" element={<ApplicationNotes />} />
          <Route path="/engineering-support" element={<EngineeringSupport />} />
          <Route path="/vendor-documents" element={<VendorDocuments />} />
          <Route path="/contract-pricing" element={<ContractPricing />} />
          <Route path="/approved-vendor" element={<ApprovedVendor />} />
          <Route path="/track-rfq" element={<TrackRFQ />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/blueprint" element={<Blueprint />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
