import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import axiosClient from "@/axiosClient"
import { toast } from "react-toastify"

export default function EditBookingModal({ booking, open, onClose, onSaved }) {
  const [notes, setNotes] = useState(booking?.customerNotes || "")
  const initialPrefsObj = booking?.servicePreferences || {}
  const [prefsObj, setPrefsObj] = useState({
    preferredTechnicianId: initialPrefsObj.preferredTechnicianId || null,
    needExtraFilter: initialPrefsObj.needExtraFilter || false,
    notesForTech: initialPrefsObj.notesForTech || "",
  })
  const [techs, setTechs] = useState([])
  useEffect(() => {
    const loadTechs = async () => {
      try {
        const res = await axiosClient.get('/users/all-technicians')
        setTechs(res.data.data || res.data || [])
      } catch (err) {
        console.error('Failed to load technicians', err)
      }
    }
    loadTechs()
  }, [])
  const [saving, setSaving] = useState(false)

  if (!open) return null

  const save = async () => {
    const parsedPrefs = prefsObj
    setSaving(true)
    try {
  await axiosClient.patch(`/bookings/${booking.id}`, { customerNotes: notes, servicePreferences: parsedPrefs })
      toast.success("Saved")
      onSaved && onSaved()
      onClose && onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Edit Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="block mb-2">Customer Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-2 border rounded mb-4" rows={4} />

          <label className="block mb-2">Service Preferences</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm mb-1">Preferred Technician</label>
              <select value={prefsObj.preferredTechnicianId ?? ""} onChange={(e) => setPrefsObj(prev => ({ ...prev, preferredTechnicianId: e.target.value ? parseInt(e.target.value) : null }))} className="w-full p-2 border rounded">
                <option value="">-- No preference --</option>
                {techs.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 mt-6">
                <input type="checkbox" checked={prefsObj.needExtraFilter} onChange={(e) => setPrefsObj(prev => ({ ...prev, needExtraFilter: e.target.checked }))} />
                <span className="text-sm">Need extra filter</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Notes for Technician</label>
              <input type="text" value={prefsObj.notesForTech} onChange={(e) => setPrefsObj(prev => ({ ...prev, notesForTech: e.target.value }))} className="w-full p-2 border rounded" />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
