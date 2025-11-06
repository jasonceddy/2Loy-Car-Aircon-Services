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
import { formatCurrency } from "@/lib/formatter"
import { Check, Loader2, MoreVertical, Pickaxe, Plus, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useLoaderData } from "react-router-dom"
import { toast } from "react-toastify"
import PackPagination from "./components/PackPagination"
import PackModal from "./components/PackModal"

export async function loader() {
  const res = await axiosClient.get("/packs")
  return res.data
}

export default function Pack() {
  const initialData = useLoaderData()
  const [data, setData] = useState(initialData) //mapping the data
  const [search, setSearch] = useState("") //search filter
  const [filter, setFilter] = useState("id_desc") //filters
  const [loading, setLoading] = useState(false) //loading state
  const [currentPage, setCurrentPage] = useState(1) //pagination
  const [modal, setModal] = useState({
    pack: null,
    open: false,
  }) //toggle add modal

  //function to fetch filtered data
  const fetchPacks = async (searchTerm = "", sortBy = "", page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (sortBy) params.append("sort", sortBy)
      params.append("page", page.toString())
      const res = await axiosClient.get(`/packs?${params.toString()}`)
      setData(res.data)
    } catch (error) {
      toast.error(`Error fetching packs`, error)
    } finally {
      setLoading(false)
    }
  }

  const deletePack = async (id) => {
    try {
      await axiosClient.delete(`/packs/${id}`)
      toast.success("Pack deleted successfully!")
      fetchPacks()
    } catch (error) {
      toast.error(`Error deleting pack`, error)
    }
  }

  //Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPacks(search, filter, currentPage)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search, filter, currentPage])

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filter])

  const packFilters = [
    { value: "id_desc", label: "Latest" },
    { value: "id_asc", label: "Oldest" },
    { value: "price_desc", label: "Highest Price" },
    { value: "price_asc", label: "Lowest Price" },
    { value: "name_asc", label: "A-Z" },
    { value: "name_desc", label: "Z-A" },
    { value: "allowed", label: "Allowed to assign Technicians" },
    { value: "not_allowed", label: "Not allowed to assign Technicians" },
  ]

  const unavailablePack = async (id) => {
    try {
      await axiosClient.patch(`/packs/${id}/hide`)
      toast.success("Pack is now unavailable for customers!")
      fetchPacks()
    } catch (error) {
      toast.error("Something went wrong!")
    }
  }

  const availablePack = async (id) => {
    try {
      await axiosClient.patch(`/packs/${id}/unhide`)
      toast.success("Pack is now available for customers!")
      fetchPacks()
    } catch (error) {
      toast.error("Something went wrong!")
    }
  }

  return (
    <>
      <main className="flex-1 p-10 border-t bg-gray-100/50 flex flex-col gap-10">
        <section className="flex items-center justify-between">
          <h1 className="text-xl lg:text-2xl flex items-center gap-2 font-bold">
            <Pickaxe />
            Packs
          </h1>
          <button
            onClick={() => setModal((prev) => ({ ...prev, open: true }))}
            className="text-md lg:text-lg flex items-center gap-1 bg-black text-white py-2 px-4 rounded-md cursor-pointer hover:bg-black/70 hover:scale-105 duration-200"
          >
            <Plus />
            Pack
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
                    {packFilters.map((filter) => (
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
                  <TableHead className="max-[470px]:hidden">Price</TableHead>
                  <TableHead className="max-[1360px]:hidden">
                    Description
                  </TableHead>
                  <TableHead className="max-[700px]:hidden">
                    Allow Technician
                  </TableHead>
                  <TableHead className="max-[400px]:hidden">
                    Available
                  </TableHead>
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
                      <TableCell className="max-[470px]:hidden">
                        {formatCurrency(d.price)}
                      </TableCell>
                      <TableCell className="max-[1360px]:hidden">
                        {d.description}
                      </TableCell>
                      <TableCell className="max-[700px]:hidden">
                        {d.allowCustomerTechChoice ? (
                          <Check className="text-green-500" />
                        ) : (
                          <X className="text-red-500" />
                        )}
                      </TableCell>
                      <TableCell className="max-[400px]:hidden">
                        {!d.hidden ? (
                          <Check className="text-green-500" />
                        ) : (
                          <X className="text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <MoreVertical className="cursor-pointer" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {!d.hidden ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  unavailablePack(d.id)
                                }}
                                className="cursor-pointer"
                              >
                                Hide
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => {
                                  availablePack(d.id)
                                }}
                                className="cursor-pointer"
                              >
                                Unhide
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setModal((prev) => ({
                                  ...prev,
                                  open: true,
                                  pack: d,
                                }))
                              }}
                              className="cursor-pointer"
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deletePack(d.id)}
                              className="cursor-pointer"
                            >
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
                  <PackPagination
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
        <PackModal
          setModal={setModal}
          modal={modal}
          fetchPacks={fetchPacks}
        />
      )}
    </>
  )
}
