import axiosClient from "@/axiosClient"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Calendar, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useLoaderData } from "react-router-dom"
import { toast } from "react-toastify"

import { formatScheduledDate } from "@/lib/formatter"
import LogPagination from "./components/LogPagination"

export async function loader() {
  const res = await axiosClient.get("/inventory/logs")
  return res.data
}

export default function Logs() {
  const initialData = useLoaderData()
  const [data, setData] = useState(initialData) //mapping the data
  const [search, setSearch] = useState("") //search filter
  const [filter, setFilter] = useState("latest") //filters
  const [typeFilter, setTypeFilter] = useState(null) //filters
  const [loading, setLoading] = useState(false) //loading state
  const [currentPage, setCurrentPage] = useState(1) //pagination

  //function to fetch filtered data
  const fetchLogs = async (
    searchTerm = "",
    sortBy = "",
    type = "",
    page = 1
  ) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (sortBy) params.append("sort", sortBy)
      if (type) params.append("type", type)
      params.append("page", page.toString())
      const res = await axiosClient.get(`/inventory/logs?${params.toString()}`)
      setData(res.data)
    } catch (error) {
      toast.error(`Error fetching logs`, error)
    } finally {
      setLoading(false)
    }
  }
  //Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchLogs(search, filter, typeFilter, currentPage)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search, filter, typeFilter, currentPage])

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filter, typeFilter])

  const partFilters = [
    { value: "latest", label: "Latest" },
    { value: "oldest", label: "Oldest" },
  ]

  const typeFilters = [
    { value: null, label: "All" },
    { value: "IN", label: "Stock In" },
    { value: "OUT", label: "Stock Out" },
  ]

  return (
    <>
      <main className="flex-1 p-10 border-t bg-gray-100/50 flex flex-col gap-10">
        <section className="flex items-center justify-between">
          <h1 className="text-xl lg:text-2xl flex items-center gap-2 font-bold">
            <Calendar />
            Logs
          </h1>
        </section>
        <section className="flex-1 flex flex-col">
          <div className="flex items-center gap-5 max-[500px]:flex-col max-[500px]:items-start">
            <div className="flex flex-col">
              <label htmlFor="search">Search:</label>
              <input
                type="text"
                placeholder="Enter search..."
                className="border-1 border-black rounded-md bg-white py-1 px-2 "
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="filter">Filter:</label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="py-1 px-2 border-1 border-black rounded-md">
                  <SelectValue placeholder="Select a filter..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Filters</SelectLabel>
                    {partFilters.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="filter">Type:</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="py-1 px-2 border-1 border-black rounded-md">
                  <SelectValue placeholder="Select a filter..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Filters</SelectLabel>
                    {typeFilters.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <Table className="mt-5">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="max-[500px]:hidden">Type</TableHead>
                  <TableHead className="max-[420px]:hidden">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      <Loader2 className="animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data?.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium max-w-sm truncate">
                        {" "}
                        {d.part.name}
                      </TableCell>
                      <TableCell>
                        {d.type === "IN" ? (
                          <span className="font-bold text-green-500">
                            + {d.quantity}
                          </span>
                        ) : (
                          <span className="font-bold text-red-500">
                            - {d.quantity}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="max-[500px]:hidden">
                        {d.type === "IN" ? "Stock In" : "Stock Out"}
                      </TableCell>
                      <TableCell className="max-[420px]:hidden">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <div>
                            <div>{formatScheduledDate(d.createdAt)}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(d.createdAt).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-5 w-full">
              <p className="italic">
                Showing {data.data?.length || 0} of {data.count || 0} results
              </p>

              {data.totalPages > 1 && (
                <div>
                  <LogPagination
                    data={data}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}