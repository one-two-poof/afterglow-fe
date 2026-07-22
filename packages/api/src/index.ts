import axios from "axios";
import type { User } from "@afterglow/types";

const client = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
  timeout: 10_000,
});

export async function getUsers(): Promise<User[]> {
  const { data } = await client.get<User[]>("/users");
  return data;
}

export async function getUser(id: number): Promise<User> {
  const { data } = await client.get<User>(`/users/${id}`);
  return data;
}
