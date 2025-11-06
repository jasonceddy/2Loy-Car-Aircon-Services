import React, { useEffect, useState } from 'react'
import ChangeRequestsList from '../bookings/components/ChangeRequestsList'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export default function ChangeRequestLog() {
  return (
    <main className="flex-1 p-10 border-t bg-gray-100/50">
      <Card>
        <CardHeader>
          <CardTitle>Change Request Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <ChangeRequestsList />
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
