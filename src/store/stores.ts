import { authSchema } from "../types/storeTypes/types";
import { z } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
export const useUser = create(
  persist(
    (set) => ({
      user: { fullname: "", email: "", username: "" } as z.infer<
        typeof authSchema
      >,
      setUser: (data: z.infer<typeof authSchema>) =>
        set({
          user: {
            fullname: data.fullname,
            email: data.email,
            username: data.username,
          },
        }),
      removeUser: () =>
        set({ user: { fullname: "", email: "", username: "" } }),
    }),
    { name: "authStore" }
  )
);
