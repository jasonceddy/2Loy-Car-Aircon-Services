import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { formatCurrency } from '@/lib/formatter';
import { useLoaderData, useNavigate } from "react-router-dom";
import axiosClient from "@/axiosClient";
import { toast } from "react-toastify";

export async function loader() {
    const cars = await axiosClient.get("/cars/my-cars");
    const packages = await axiosClient.get("/packs");
    const technicians = await axiosClient.get("/users/technicians");
    return { cars: cars.data, packages: packages.data, technicians: technicians.data };
}

export default function BookAPackage() {
    const { cars, packages, technicians } = useLoaderData();
    const [date, setDate] = useState();
    const [selectedCar, setSelectedCar] = useState(null);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [selectedTechnician, setSelectedTechnician] = useState(null)
    const [time, setTime] = useState("");
    const navigate = useNavigate();

    const [timeError, setTimeError] = useState("")
    const [bookingMode, setBookingMode] = useState('book') // 'book' or 'consult'

    const validateTime = (dateObj, timeStr) => {
        if (!timeStr) return { ok: false, message: "Please select a time" }
        const [hours, minutes] = timeStr.split(":").map((v) => parseInt(v, 10))
        if (isNaN(hours)) return { ok: false, message: "Invalid time" }
        if (hours < 8) return { ok: false, message: "Bookings start at 8:00 AM" }
        if (hours > 17) return { ok: false, message: "Bookings must end by 5:00 PM" }
        if (hours === 17 && minutes > 0) return { ok: false, message: "Bookings must end by 5:00 PM" }
        if (dateObj) {
            const sched = new Date(dateObj)
            sched.setHours(hours, minutes, 0, 0)
            if (sched < new Date()) return { ok: false, message: "Cannot book in the past" }
        }
        return { ok: true }
    }

    const total = selectedPackage
        ? (() => {
              const pkgPrice = Number(selectedPackage.price ?? selectedPackage.cost ?? 0);
              if (!isNaN(pkgPrice) && pkgPrice > 0) return pkgPrice;
              const servicesList = Array.isArray(selectedPackage.services) ? selectedPackage.services : [];
              return (
                  servicesList.reduce((acc, s) => {
                      const p = Number(s.price ?? s.cost ?? 0);
                      return acc + (isNaN(p) ? 0 : p);
                  }, 0) ?? 0
              );
          })()
        : 0;

    const isValidSchedule = (scheduledDateTime) => {
        const now = new Date()
        if (scheduledDateTime < now) return { ok: false, message: "Cannot book in the past" }

        const hours = scheduledDateTime.getHours()
        const minutes = scheduledDateTime.getMinutes()

        if (hours < 8) return { ok: false, message: "Bookings start at 8:00 AM" }
        if (hours > 17) return { ok: false, message: "Bookings must end by 5:00 PM" }
        if (hours === 17 && minutes > 0) return { ok: false, message: "Bookings must end by 5:00 PM" }

        return { ok: true }
    }

    const handleBookNow = async (modeParam) => {
        const mode = modeParam ?? bookingMode;
        if (!selectedCar || (mode !== 'consult' && !selectedPackage)) {
            toast.error("Please fill in all required fields and select a package.");
            return;
        }

        let scheduledDateTime
        if (mode === 'consult') {
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
            const bookingData = {
                carId: parseInt(selectedCar),
                ...(selectedPackage ? { packIds: [selectedPackage.id] } : {}),
                ...(selectedPackage && selectedPackage.services && selectedPackage.services.some(s => s.allowCustomerTechChoice) && selectedTechnician && { technicianId: parseInt(selectedTechnician) }),
                scheduledAt: scheduledDateTime.toISOString(),
                servicePreferences: { bookingMode: mode }
            };
            console.log("Sending bookingData:", bookingData);
            const res = await axiosClient.post("/bookings", bookingData);
            console.log("Booking response:", res.data);

            if (mode === 'consult') {
                toast.success("Consultation created. Admins have been notified.")
                navigate("/customer")
            } else {
                toast.success("Booking created successfully!");
                navigate("/admin/bookings");
            }
        } catch (error) {
            console.error("Booking error:", error.response || error.message || error);
            toast.error(`Failed to create booking: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <main className="flex-1 p-10 border-t bg-gray-100/50 flex gap-10">
            <div className="w-2/3">
                <h1 className="text-2xl font-bold mb-5">Package Booking</h1>
                <div className="space-y-5">
                    <div>
                        <label className="font-bold">Select Your Vehicle</label>
                        <Select onValueChange={setSelectedCar}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select your vehicle..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Your Cars</SelectLabel>
                                    {cars.data.map((car) => (
                                        <SelectItem key={car.id} value={car.id.toString()}>
                                            {car.brand} {car.model} ({car.plateNo})
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
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
                            <h2 className="text-xl font-bold mt-5">Packages</h2>
                            <div className="grid grid-cols-3 gap-4 mt-2">
                                {packages.data.map((pack) => (
                                    <Card
                                        key={pack.id}
                                        onClick={() => setSelectedPackage(pack)}
                                        className={`cursor-pointer ${selectedPackage?.id === pack.id ? "border-blue-500 border-2" : ""}`}
                                    >
                                        <CardHeader>
                                            <CardTitle>{pack.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p>{pack.description}</p>
                                            <p className="font-bold">₱{pack.price}</p>
                                            {pack.services.length > 0 && (
                                                <div className="mt-2">
                                                    <h4 className="font-bold">Inclusions:</h4>
                                                    <ul>
                                                        {pack.services.map(service => (
                                                            <li key={service.id}>{service.name}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            {/* Technician selector if package contains services that allow choosing technician */}
                            {selectedPackage && selectedPackage.services && selectedPackage.services.some(s => s.allowCustomerTechChoice) && (
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
                            <p className="font-medium">Consultation only — packages are not required for this booking.</p>
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
                            <h3 className="font-bold">Selected Package:</h3>
                            {bookingMode === 'consult' ? (
                                <p className="font-medium">Consultation only — no package required.</p>
                            ) : selectedPackage ? (
                                <div>
                                    <p>{selectedPackage.name}</p>
                                    {selectedPackage.services && selectedPackage.services.length > 0 && (
                                        <ul className="mt-2">
                                            {selectedPackage.services.map((s) => (
                                                <li key={s.id} className="flex justify-between">
                                                    <span>{s.name}</span>
                                                    <span>
                                                        {bookingMode === 'consult' ? (
                                                            <em className="text-sm text-muted-foreground">Consult</em>
                                                        ) : (
                                                            formatCurrency(Number(s.price ?? s.cost ?? 0))
                                                        )}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ) : (
                                <p>No package selected.</p>
                            )}
                        </div>
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
