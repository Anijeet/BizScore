import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import HomePage from '@/pages/Home'
import AssessmentPage from '@/pages/Assessment'
import Layer2Page from '@/pages/Layer2'
import Layer3Page from '@/pages/Layer3'
import FinalScorePage from '@/pages/FinalScore'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/assess" element={<AssessmentPage />} />
            <Route path="/assess/layer2" element={<Layer2Page />} />
            <Route path="/assess/layer3" element={<Layer3Page />} />
            <Route path="/assess/score" element={<FinalScorePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
