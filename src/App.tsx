import { Routes, Route, Navigate } from 'react-router'
import ScrollManager from '@/components/ScrollManager'
import ReadingList from './pages/ReadingList'

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<ReadingList />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
