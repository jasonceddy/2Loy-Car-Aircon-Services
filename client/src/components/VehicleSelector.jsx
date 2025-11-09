import React from 'react'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'

// Reusable vehicle selector. Props:
// - cars: array of car objects
// - onChange: function(value) called when selection changes (value is string/id)
// - placeholder: optional placeholder text
export default function VehicleSelector({ cars = [], onChange = () => {}, placeholder = 'Select a vehicle...' }) {
    return (
        <div>
            <label className="font-bold">Select Vehicle</label>
            <Select onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Vehicles</SelectLabel>
                        {cars.map((car) => {
                            const display = car.plateNo ? car.plateNo : (car.vin ? car.vin : `${car.brand ?? ''} ${car.model ?? ''}`)
                            return (
                                <SelectItem key={car.id} value={String(car.id)}>{display}{car.brand && car.model ? ` — ${car.brand} ${car.model}` : ''}</SelectItem>
                            )
                        })}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}
