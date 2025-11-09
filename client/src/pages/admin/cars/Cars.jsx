import React, { useEffect, useState } from "react"
import axiosClient from "@/axiosClient"
import { Button } from "@/components/ui/button"
import TransferModal from "./TransferModal"

export default function Cars() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCar, setSelectedCar] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchCars = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get('/cars')
      setCars(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCars()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cars Management</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Plate</th>
              <th className="px-4 py-2 text-left">Make</th>
              <th className="px-4 py-2 text-left">Model</th>
              <th className="px-4 py-2 text-left">Year</th>
              <th className="px-4 py-2 text-left">Owner</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-2">{c.id}</td>
                <td className="px-4 py-2">{c.plateNo}</td>
                <td className="px-4 py-2">{c.brand}</td>
                <td className="px-4 py-2">{c.model}</td>
                <td className="px-4 py-2">{c.year}</td>
                <td className="px-4 py-2">{c.ownerId}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <Button onClick={() => { setSelectedCar(c); setModalOpen(true) }}>Transfer</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedCar && (
        <TransferModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          car={selectedCar}
          onTransferred={() => fetchCars()}
        />
      )}
    </div>
  )
}
