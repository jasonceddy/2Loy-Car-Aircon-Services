import { useLoaderData } from "react-router-dom"
import TechnicianJobCard from "./components/TechnicianJobCard"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
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
import TechnicianPagination from "./components/TechnicianPagination"

export async function loader() {
  const res = await axiosClient.get("/jobs")
  return res.data
}

export default function TechnicianDashboard() {
  const initialData = useLoaderData()
  const [data, setData] = useState(initialData) //mapping the data
  const [search, setSearch] = useState("") //search filter
  const [filter, setFilter] = useState("latest") //filters
  const [stageFilter, setStageFilter] = useState(null)
  const [loading, setLoading] = useState(false) //loading state
  const [currentPage, setCurrentPage] = useState(1) //pagination
  const fetchJobs = async (
    searchTerm = "",
    sortBy = "",
    stage = "",
    page = 1
  ) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (sortBy) params.append("sort", sortBy)
      if (stage) params.append("stage", stage)
      params.append("page", page.toString())
      const res = await axiosClient.get(`/jobs?${params.toString()}`)
      setData(res.data)
    } catch (error) {
      console.log(error)
      toast.error(`Error fetching jobs`, error)
    } finally {
      setLoading(false)
    }
  }

  const refreshJobs = () => {
    fetchJobs(search, filter, stageFilter, currentPage)
  }
  //Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs(search, filter, stageFilter, currentPage)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search, filter, stageFilter, currentPage])

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filter, stageFilter])

  const techFilters = [
    { value: "latest", label: "Latest" },
    { value: "oldest", label: "Oldest" },
  ]

  const stageFilters = [
    { value: null, label: "All" },
    { value: "DIAGNOSTIC", label: "Diagnostic" },
    { value: "REPAIR", label: "Repair" },
    { value: "TESTING", label: "Testing" },
    { value: "COMPLETE", label: "Complete" },
  ]

  return (
    <main className="flex-1 p-4 border-t bg-gray-100/50">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Assigned Jobs</h1>
      </div>
      {!data && <h1 className="text-2xl font-bold">No jobs found</h1>}
      <div className="flex items-center gap-5 mb-6">
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
          <label htmlFor="filter">Job Stage:</label>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="py-1 px-2 border-1 border-black rounded-md">
              <SelectValue placeholder="Select a stage..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Filters</SelectLabel>
                {stageFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
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
                {techFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data
          ? data.data.map((d) => (
              <TechnicianJobCard key={d.id} job={d} fetchJobs={refreshJobs} />
            ))
          : "No jobs found"}
      </div>
      <div className="flex items-center justify-between mt-5 w-full">
        <p className="italic">
          Showing {data?.data?.length || 0} of {data?.count || 0} results
        </p>

        {data?.totalPages > 1 && (
          <div>
            <TechnicianPagination
              data={data}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>
        )}
      </div>
    </main>
  )
}