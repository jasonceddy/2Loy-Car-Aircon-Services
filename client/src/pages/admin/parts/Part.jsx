import axiosClient from "@/axiosClient"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
  FileCheck,
  FileWarning,
  FileX,
  Loader2,
  MinusCircle,
  MoreVertical,
  Plus,
  PlusCircle,
  Wrench,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useLoaderData } from "react-router-dom"
import { toast } from "react-toastify"
import PartPagination from "./components/PartPagination"
import PartModal from "./components/PartModal"
import StockInModal from "./components/StockInModal"
import StockOutModal from "./components/StockOutModal"

export async function loader() {
  const res = await axiosClient.get("/parts")
  return res.data
}

export default function Part() {
  const initialData = useLoaderData()
  const [data, setData] = useState(initialData) //mapping the data
  const [search, setSearch] = useState("") //search filter
  const [filter, setFilter] = useState("id_desc") //filters
  const [loading, setLoading] = useState(false) //loading state
  const [currentPage, setCurrentPage] = useState(1) //pagination
  const [modal, setModal] = useState({
    part: null,
    open: false,
  })
  const [stockInModal, setStockInModal] = useState({ id: null, open: false })
  const [stockOutModal, setStockOutModal] = useState({ id: null, open: false })

  //function to fetch filtered data
  const fetchParts = async (searchTerm = "", sortBy = "", page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (sortBy) params.append("sort", sortBy)
      params.append("page", page.toString())
      const res = await axiosClient.get(`/parts?${params.toString()}`)
      setData(res.data)
    } catch (error) {
      toast.error(`Error fetching parts`, error)
    } finally {
      setLoading(false)
    }
  }
  //Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchParts(search, filter, currentPage)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search, filter, currentPage])

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filter])

  const partFilters = [
    { value: "id_desc", label: "Latest" },
    { value: "id_asc", label: "Oldest" },
  ]

  return (
    <>
      <main className="flex-1 p-10 border-t bg-gray-100/50 flex flex-col gap-10">
        <section className="flex items-center justify-between">
          <h1 className="text-xl lg:text-2xl flex items-center gap-2 font-bold">
            <Wrench />
            Parts
          </h1>
          <button
            onClick={() => setModal((prev) => ({ ...prev, open: true }))}
            className="text-md lg:text-lg flex items-center gap-1 bg-black text-white py-2 px-4 rounded-md cursor-pointer hover:bg-black/70 hover:scale-105 duration-200"
          >
            <Plus />
            Part
          </button>
        </section>
        <section className="flex-1 flex flex-col">
          <div className="flex items-center gap-5 max-[400px]:flex-col max-[400px]:items-start">
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
          </div>
          <div className="flex-1 flex flex-col">
            <Table className="mt-5">
              <TableHeader>
                <TableRow>
                  <TableHead>Price</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="max-[400px]:hidden">Status</TableHead>
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
                        {d.name}
                      </TableCell>
                      <TableCell>
                        {d.price ? `₱${d.price.toFixed(2)}` : "₱0.00"}
                      </TableCell>
                      <TableCell>{d.stock}</TableCell>
                      <TableCell className="max-[400px]:hidden">
                        {d.stock === 0 ? (
                          <span className=" text-red-500  font-bold flex items-center gap-1">
                            <FileX />
                            Out of stock
                          </span>
                        ) : d.stock < d.threshold ? (
                          <span className="text-yellow-700 font-bold flex items-center gap-1">
                            <FileWarning />
                            Low on stock
                          </span>
                        ) : (
                          <span className="text-green-500 font-bold flex items-center gap-1">
                            <FileCheck />
                            In stock
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <MoreVertical className="cursor-pointer" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => {
                                setStockInModal((prev) => ({
                                  ...prev,
                                  open: true,
                                  id: d.id,
                                }))
                              }}
                              className="cursor-pointer flex items-center gap-1"
                            >
                              <PlusCircle />
                              Stock In
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setStockOutModal((prev) => ({
                                  ...prev,
                                  open: true,
                                  id: d.id,
                                }))
                              }}
                              className="cursor-pointer flex items-center gap-1"
                            >
                              <MinusCircle />
                              Stock Out
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setModal((prev) => ({
                                  ...prev,
                                  open: true,
                                  part: d,
                                }))
                              }}
                              className="cursor-pointer flex items-center justify-center"
                            >
                              Edit
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
                  <PartPagination
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
        <PartModal setModal={setModal} fetchParts={fetchParts} modal={modal} />
      )}
      {stockInModal.open && (
        <StockInModal
          setStockInModal={setStockInModal}
          fetchParts={fetchParts}
          stockInModal={stockInModal}
        />
      )}
      {stockOutModal.open && (
        <StockOutModal
          setStockOutModal={setStockOutModal}
          fetchParts={fetchParts}
          stockOutModal={stockOutModal}
        />
      )}
    </>
  )
}