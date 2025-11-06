import { Controller, useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import { LoaderCircle } from "lucide-react"
import { toast } from "react-toastify"
import axiosClient from "@/axiosClient"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { useNavigate } from "react-router-dom"

export default function PackForm({ setModal, fetchPacks, modal }) {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
    reset,
    control,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      serviceIds: [],
    },
  })

  const [serverError, setServerError] = useState("")
  const [loadingData, setLoadingData] = useState(false)
  const [services, setServices] = useState([])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axiosClient.get("/services")
        setServices(response.data.data)
      } catch (error) {
        toast.error("Failed to fetch services.")
      }
    }
    fetchServices()
  }, [])

  useEffect(() => {
    setLoadingData(true)
    if (modal.pack) {
      setValue("name", modal.pack.name)
      setValue("price", modal.pack.price.toString())
      setValue("description", modal.pack.description)
      setValue("allowCustomerTechChoice", modal.pack.allowCustomerTechChoice)
      setValue(
        "serviceIds",
        modal.pack.services.map((s) => s.id)
      )
      setLoadingData(false)
    } else {
      reset()
      setLoadingData(false)
    }
  }, [modal.pack, setValue, reset])

  const onSubmit = async (data) => {
    setServerError("")
    try {
      const payload = {
        ...data,
        price: parseFloat(data.price),
        serviceIds: data.serviceIds.map((id) => parseInt(id)),
      }

      if (modal.pack) {
        await axiosClient.patch(`/packs/${modal.pack.id}`, payload)
        toast.success("Pack updated successfully!")
      } else {
        await axiosClient.post("/packs", payload)
        toast.success("Pack added successfully!")
      }

      reset()
      await fetchPacks()
      setModal({ pack: null, open: false })
    } catch (error) {
      if (error.response?.status === 400) {
        const message = error.response.data.message
        if (typeof message === "object") {
          Object.entries(message).forEach(([field, msgs]) => {
            setError(field, { type: "server", message: msgs[0] })
          })
        } else {
          setServerError(message)
        }
      } else {
        toast.error("Something went wrong!")
      }
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoaderCircle className="animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Name
        </label>
        <input
          {...register("name")}
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          placeholder="Enter pack name..."
          required
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="price"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Price
        </label>
        <input
          {...register("price")}
          type="number"
          step="0.01"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          placeholder="Enter pack price..."
          required
        />
        {errors.price && (
          <p className="mt-2 text-sm text-red-600">{errors.price.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Description
        </label>
        <textarea
          {...register("description")}
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 resize-none"
          placeholder="Enter pack description..."
          required
        />
        {errors.description && (
          <p className="mt-2 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Included Services
        </label>
        <div className="grid grid-cols-2 gap-2">
          {services.map((service) => (
            <div key={service.id} className="flex items-center gap-2">
              <Controller
                name="serviceIds"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id={`service-${service.id}`}
                    checked={field.value?.includes(service.id)}
                    onCheckedChange={(checked) => {
                      const newValue = checked
                        ? [...field.value, service.id]
                        : field.value.filter((id) => id !== service.id)
                      field.onChange(newValue)
                    }}
                  />
                )}
              />
              <label
                htmlFor={`service-${service.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {service.name}
              </label>
            </div>
          ))}
        </div>
        {errors.serviceIds && (
          <p className="mt-2 text-sm text-red-600">
            {errors.serviceIds.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="allowCustomerTechChoice"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Allow Technician Choice
        </label>
        <Controller
          name="allowCustomerTechChoice"
          control={control}
          defaultValue={false}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              className="cursor-pointer"
            />
          )}
        />
        {errors.allowCustomerTechChoice && (
          <p className="mt-2 text-sm text-red-600">
            {errors.allowCustomerTechChoice.message}
          </p>
        )}
      </div>
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer w-full text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <LoaderCircle className="animate-spin" />
          ) : modal.pack ? (
            "Update"
          ) : (
            "Save"
          )}
        </button>
        {serverError && (
          <p className="text-sm mt-1 text-red-600">{serverError}</p>
        )}
      </div>
    </form>
  )
}
