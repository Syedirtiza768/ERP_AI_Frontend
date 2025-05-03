// src/lib/api/user-service.js
import { httpClient } from "./http-client";

class UserService {
  async getAll() {
    return httpClient.get("/users");
  }

  async getCount() {
    return httpClient.getCount("users");
  }

  async getById(id) {
    return httpClient.get(`/users/${id}`);
  }

  async getProfile() {
    return httpClient.get("/users/profile");
  }

  async create(userData) {
    return httpClient.post("/users", userData);
  }

  async update(id, userData) {
    return httpClient.patch(`/users/${id}`, userData);
  }

  async delete(id) {
    return httpClient.delete(`/users/${id}`);
  }
}

export const userService = new UserService();
