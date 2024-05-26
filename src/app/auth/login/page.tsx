"use client";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { loginSchema } from "../../../types/authTypes/types";
import CardForm from "@/components/molecules/cardForm";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUser } from "@/store/stores";
import { instance } from "@/utils/axios";
import { FiXOctagon } from "react-icons/fi";
import { toast } from "sonner";
const Login = () => {
  const user = useUser() as any;
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      const formData = new FormData();
      formData.append("email", values.email);
      formData.append("password", values.password);
      const response = await instance.post("/auth/login", formData);
      user.setUser(response.data.user);
    } catch (error: any) {
      toast("Error", {
        description: error.message,
        icon: <FiXOctagon />,
      });
    }
  };
  return (
    <div className="min-h-screen flex justify-center items-center">
      {user.fullname && <p>{user.fullname}</p>}
      <FormProvider {...form}>
        <form
          action={form.handleSubmit(onSubmit) as unknown as undefined}
          autoComplete="off"
        >
          <CardForm
            title={"Login Pengguna"}
            description={"Silahkan login sebelum melanjutkan."}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardForm>
        </form>
      </FormProvider>
    </div>
  );
};

export default Login;
