import React, { useState } from 'react'
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useLoaderData, useNavigate } from "react-router-dom";
import axiosClient from "@/axiosClient";
import VehicleSelector from '@/components/VehicleSelector';
import { useEffect } from 'react';
import { toast } from "react-toastify";
import { formatCurrency } from "@/lib/formatter";

export async function loader() {
    const cars = await axiosClient.get("/cars/my-cars");
    const services = await axiosClient.get("/services");
    const technicians = await axiosClient.get("/users/technicians");
    return { cars: cars.data, services: services.data, technicians: technicians.data };
}

export default function BookAService() {
    const { cars, services, technicians } = useLoaderData();
    const [date, setDate] = useState();
    const [selectedCar, setSelectedCar] = useState(null);
    const [carHistory, setCarHistory] = useState([])
    const [historyLoading, setHistoryLoading] = useState(false)
    const [historyError, setHistoryError] = useState("")

    useEffect(() => {
        let mounted = true
        const loadHistory = async () => {
            if (!selectedCar) return
            setHistoryLoading(true)
            setHistoryError("")
            try {
                const res = await axiosClient.get(`/cars/${selectedCar}/history`)
                if (!mounted) return
                setCarHistory(res.data.data || [])
            } catch (err) {
                if (!mounted) return
                setHistoryError(err.response?.data?.message || err.message || "Failed to load history")
                setCarHistory([])
            } finally {
                if (mounted) setHistoryLoading(false)
            }
        }
        loadHistory()
        return () => { mounted = false }
    }, [selectedCar])
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedTechnician, setSelectedTechnician] = useState(null)
    const [time, setTime] = useState("");
    const navigate = useNavigate();

    const handleServiceSelection = (service) => {
        setSelectedServices((prev) =>
            prev.find((s) => s.id === service.id)
                ? prev.filter((s) => s.id !== service.id)
                : [...prev, service]
        );
    };

    const [timeError, setTimeError] = useState("")
    const [bookingMode, setBookingMode] = useState('book') // 'book' or 'consult'

    const validateTime = (dateObj, timeStr) => {
        if (!timeStr) return { ok: false, message: "Please select a time" }
        const [hours, minutes] = timeStr.split(":").map((v) => parseInt(v, 10))
        if (isNaN(hours)) return { ok: false, message: "Invalid time" }
        // check bounds
        if (hours < 8) return { ok: false, message: "Bookings start at 8:00 AM" }
        if (hours > 17) return { ok: false, message: "Bookings must end by 5:00 PM" }
        if (hours === 17 && minutes > 0) return { ok: false, message: "Bookings must end by 5:00 PM" }

        // if date provided, check not in past
        if (dateObj) {
            const sched = new Date(dateObj)
            sched.setHours(hours, minutes, 0, 0)
            if (sched < new Date()) return { ok: false, message: "Cannot book in the past" }
        }
        return { ok: true }
    }

    const total = selectedServices.reduce((acc, service) => {
        const price = Number(service.cost ?? service.price ?? 0)
        return acc + (isNaN(price) ? 0 : price)
    }, 0);

    const isValidSchedule = (scheduledDateTime) => {
        const now = new Date()
        if (scheduledDateTime < now) return { ok: false, message: "Cannot book in the past" }

        const hours = scheduledDateTime.getHours()
        const minutes = scheduledDateTime.getMinutes()

        // Allow bookings from 8:00 up to 17:00 (inclusive only at 17:00:00)
        if (hours < 8) return { ok: false, message: "Bookings start at 8:00 AM" }
        if (hours > 17) return { ok: false, message: "Bookings must end by 5:00 PM" }
        if (hours === 17 && minutes > 0) return { ok: false, message: "Bookings must end by 5:00 PM" }

        return { ok: true }
    }

    const handleBookNow = async (modeParam) => {
        const mode = modeParam ?? bookingMode;
        if (!selectedCar || (selectedServices.length === 0 && mode !== 'consult')) {
            toast.error("Please fill in all required fields and select at least one service.");
            return;
        }

        let scheduledDateTime
        if (mode === 'consult') {
            // immediate consultation - use now
            scheduledDateTime = new Date()
        } else {
            if (!date || !time) {
                toast.error("Please select date and time for booking.");
                return;
            }
            const [hours, minutes] = time.split(':');
            scheduledDateTime = new Date(date);
            scheduledDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

            const validation = isValidSchedule(scheduledDateTime)
            if (!validation.ok) {
                toast.error(validation.message)
                return
            }
        }

        try {
            const canChooseTech = selectedServices.some(s => s.allowCustomerTechChoice)
            const bookingData = {
                carId: parseInt(selectedCar),
                serviceIds: selectedServices.map(s => s.id),
                scheduledAt: scheduledDateTime.toISOString(),
                ...(canChooseTech && selectedTechnician && { technicianId: parseInt(selectedTechnician) }),
                servicePreferences: { bookingMode: mode }
            };
            await axiosClient.post("/bookings", bookingData);
            if (mode === 'consult') {
                toast.success("Consultation created. Admins have been notified.")
                navigate("/customer")
            } else {
                toast.success("Booking created successfully!");
                navigate("/customer");
            }
        } catch (error) {
            toast.error(`Failed to create booking: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <main className="flex-1 p-10 border-t bg-gray-100/50 flex gap-10">
            <div className="w-2/3">
                <h1 className="text-2xl font-bold mb-5">Book a Service</h1>
                <div className="space-y-5">
                    <div>
                        {/* Vehicle selector lists plateNo or VIN (fallback to brand/model) */}
                        <VehicleSelector cars={cars.data} onChange={setSelectedCar} placeholder="Select a car..." />
                    </div>
                    {/* Car service history - compact, read-only summary shown when a vehicle is selected */}
                    {selectedCar && (
                        <div className="mt-4">
                            <h3 className="font-bold mb-2">Recent Services</h3>
                            <div className="space-y-2">
                                {historyLoading && <p className="text-sm text-muted-foreground">Loading history...</p>}
                                {historyError && <p className="text-sm text-red-600">{historyError}</p>}
                                {!historyLoading && carHistory.length === 0 && !historyError && (
                                    <p className="text-sm text-muted-foreground">No recent services found for this vehicle.</p>
                                )}
                                {carHistory.map((b) => (
                                    <div key={b.id} className="p-2 bg-white rounded shadow-sm flex items-start justify-between">
                                        <div>
                                            <div className="text-sm font-medium">{format(new Date(b.scheduledAt || b.createdAt), 'PPP')}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {b.service?.name ?? b.pack?.name ?? 'Service/Package'} — {b.service?.description ? `${b.service.description.substring(0, 60)}${b.service.description.length > 60 ? '…' : ''}` : ''}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Billed to: {b.customer?.name ?? '—'}</div>
                                        </div>
                                        <div className="ml-4">
                                            <span className={`px-2 py-1 text-xs rounded ${b.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {b.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="flex gap-5">
                        <div className="w-1/2">
                            <label className="font-bold">Date</label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                initialFocus
                                                disabled={(d) => {
                                                    const today = new Date()
                                                    today.setHours(0,0,0,0)
                                                    const dd = new Date(d)
                                                    dd.setHours(0,0,0,0)
                                                    return dd < today
                                                }}
                                            />
                                        </PopoverContent>
                            </Popover>
                        </div>
                        <div className="w-1/2">
                            <label className="font-bold">Time</label>
                            <Input type="time" min="08:00" max="17:00" value={time} onChange={(e) => {
                                const val = e.target.value
                                setTime(val)
                                const res = validateTime(date, val)
                                setTimeError(res.ok ? "" : res.message)
                            }} />
                            {timeError && <p className="text-sm text-red-600 mt-1">{timeError}</p>}
                        </div>
                    </div>
                    {bookingMode !== 'consult' ? (
                        <div>
                            <h2 className="text-xl font-bold mt-5">Services</h2>
                            <div className="grid grid-cols-3 gap-4 mt-2">
                                {services.data.map((service) => (
                                    <Card
                                        key={service.id}
                                        onClick={() => handleServiceSelection(service)}
                                        className={`cursor-pointer ${selectedServices.find((s) => s.id === service.id) ? "border-blue-500 border-2" : ""}`}
                                    >
                                        <CardHeader>
                                            <CardTitle>{service.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p>{service.description}</p>
                                            <p className="font-bold">{formatCurrency(Number(service.cost ?? service.price ?? 0))}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            {selectedServices.length > 0 && selectedServices.some(s => s.allowCustomerTechChoice) && (
                                <div className="mt-4">
                                    <label className="block mb-2 text-sm font-medium text-gray-900">Preferred Technician (optional)</label>
                                    <Select onValueChange={(val) => setSelectedTechnician(val)}>
                                        <SelectTrigger className="bg-gray-50 border text-gray-900 rounded-lg w-full">
                                            <SelectValue placeholder="Select Technician..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Technicians</SelectLabel>
                                                {technicians.technicians.map((tech) => (
                                                    <SelectItem key={tech.id} value={tech.id.toString()}>{tech.name}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mt-5 p-4 bg-yellow-50 rounded">
                            <p className="font-medium">Consultation only — services are not required for this booking.</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="w-1/3">
                <Card>
                    <CardHeader>
                        <CardTitle>Booking Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="font-bold">Selected Services/Packages:</h3>
                            {bookingMode === 'consult' ? (
                                <p className="font-medium">Consultation only — no services required.</p>
                            ) : selectedServices.length > 0 ? (
                                <ul>
                                    {selectedServices.map((s) => (
                                        <li key={s.id} className="flex justify-between">
                                                <span>{s.name}</span>
                                                <span>
                                                    {bookingMode === 'consult' ? (
                                                        <em className="text-sm text-muted-foreground">Consult</em>
                                                    ) : (
                                                        formatCurrency(Number(s.cost ?? s.price ?? 0))
                                                    )}
                                                </span>
                                            </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No items selected.</p>
                            )}
                        </div>
                        <Separator />
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="font-bold">Date & Time:</h3>
                                <p>{date ? format(date, "PPP") : "Not set"} @ {time || "Not set"}</p>
                            </div>
                        </div>
                        <Separator />
                        <div>
                            <h3 className="font-bold">Total:</h3>
                            {bookingMode === 'consult' ? (
                                <p className="text-lg font-medium"><em className="text-muted-foreground">Consult</em></p>
                            ) : (
                                <p className="text-2xl font-bold">₱{total.toFixed(2)}</p>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold">Mode:</h3>
                            <div className="flex gap-2 items-center mt-2">
                                <Button
                                    className={cn(
                                        "px-3 py-1 rounded bg-white border text-gray-900 hover:bg-gray-100",
                                        bookingMode === 'book' ? 'ring-2 ring-blue-500' : ''
                                    )}
                                    onClick={() => { setBookingMode('book'); handleBookNow('book'); }}
                                    aria-pressed={bookingMode === 'book'}
                                >
                                    Book now
                                </Button>
                                <Button
                                    className={cn(
                                        "px-3 py-1 rounded bg-white border text-gray-900 hover:bg-gray-100",
                                        bookingMode === 'consult' ? 'ring-2 ring-blue-500' : ''
                                    )}
                                    onClick={() => { setBookingMode('consult'); handleBookNow('consult'); }}
                                    aria-pressed={bookingMode === 'consult'}
                                >
                                    Consult now
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
