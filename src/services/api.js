import axios from "axios";

const API_URL = "http://localhost:5000/api/admin"; // Sesuaikan dengan backend

export const loginAdmin = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: "Terjadi kesalahan" };
  }
};
