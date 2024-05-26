import axios from "axios";
export const instance = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});
