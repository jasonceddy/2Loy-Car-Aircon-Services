import axiosClient from "@/axiosClient"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
import {
  Book,
  CarIcon,
  Edit,
  Loader2,
  MoreVertical,
  Plus,
  Trash,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useLoaderData } from "react-router-dom"
import { toast } from "react-toastify"
import CarPagination from "./components/CarPagination"
import CarModal from "./components/CarModal"

export async function loader() {
  const res = await axiosClient.get("/cars/my-cars")
  return res.data
}

export default function Car() {
  const initialData = useLoaderData()
  const [data, setData] = useState(initialData) //mapping the data
  const [search, setSearch] = useState("") //search filter
  const [filter, setFilter] = useState("id_desc") //filters
  const [loading, setLoading] = useState(false) //loading state
  const [currentPage, setCurrentPage] = useState(1) //pagination
  const [modal, setModal] = useState({
    car: null,
    open: false,
  }) //toggle add modal

  //function to fetch filtered data
  const fetchCars = async (searchTerm = "", sortBy = "", page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (sortBy) params.append("sort", sortBy)
      params.append("page", page.toString())
      const res = await axiosClient.get(`/cars/my-cars?${params.toString()}`)
      setData(res.data)
    } catch (error) {
      toast.error(
        `Error fetching cars: ${error.response?.data?.message || error.message}`
      )
    } finally {
      setLoading(false)
    }
  }

  const deleteCar = async (id) => {
    try {
      await axiosClient.delete(`/cars/${id}`)
      toast.success("Car deleted successfully!")
      fetchCars()
    } catch (error) {
      toast.error(`Error deleting car`, error)
    }
  }

  //Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCars(search, filter, currentPage)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search, filter, currentPage])

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filter])

  const carFilters = [
    { value: "id_desc", label: "Latest" },
    { value: "id_asc", label: "Oldest" },
  ]

  return (
    <>
      <main className="flex-1 p-10 border-t bg-gray-100/50 flex flex-col gap-10">
        <section className="flex items-center justify-between">
          <h1 className="text-xl lg:text-2xl flex items-center gap-2 font-bold">
            <CarIcon />
            Cars
          </h1>
          <button
            onClick={() => setModal((prev) => ({ ...prev, open: true }))}
            className="text-md lg:text-lg flex items-center gap-1 bg-black text-white py-2 px-4 rounded-md cursor-pointer hover:bg-black/70 hover:scale-105 duration-200"
          >
            <Plus />
            Car
          </button>
        </section>
        <section className="flex-1 flex flex-col">
          <div className="flex items-center gap-5">
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
                    {carFilters.map((filter) => (
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
                  <TableHead>Plate No</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead className="max-[1180px]:hidden">Notes</TableHead>
                  <TableHead></TableHead>
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
                        {d.plateNo}
                      </TableCell>
                      <TableCell>{d.brand}</TableCell>
                      <TableCell>{d.model}</TableCell>
                      <TableCell>{d.year}</TableCell>
                      <TableCell className="max-[1180px]:hidden">
                        {d.notes}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <MoreVertical className="cursor-pointer" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setModal((prev) => ({
                                  ...prev,
                                  open: true,
                                  car: d,
                                }))
                              }}
                              className="cursor-pointer"
                            >
                              <Edit />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteCar(d.id)}
                              className="cursor-pointer"
                            >
                              <Trash />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                  <CarPagination
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
      {modal.open && (
        <CarModal setModal={setModal} modal={modal} fetchCars={fetchCars} />
      )}
    </>
  )
}
