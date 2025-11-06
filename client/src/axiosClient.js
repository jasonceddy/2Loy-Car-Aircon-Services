import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api", // your backend API URL
  withCredentials: true, // <-- this ensures cookies (JWT) are sent
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
