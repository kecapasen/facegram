"use client";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { regsiterSchema } from "../../../types/authTypes/types";
import CardForm from "@/components/molecules/cardForm";
import { FiLock, FiMail, FiPhone, FiUser, FiXOctagon } from "react-icons/fi";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { instance } from "@/utils/axios";
const Login = () => {
  const form = useForm<z.infer<typeof regsiterSchema>>({
    resolver: zodResolver(regsiterSchema),
    defaultValues: {
      fullname: "",
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      phone: "",
    },
  });
  const onSubmit = async (values: z.infer<typeof regsiterSchema>) => {
    try {
      const formData = new FormData();
      formData.append("fullname", values.fullname);
      formData.append("username", values.username);
      formData.append("password", values.password);
      formData.append("email", values.email);
      formData.append("phone", values.phone);
      await instance.post("/auth/register", formData);
    } catch (error: any) {
      toast("Error", {
        description: error.message,
        icon: <FiXOctagon />,
      });
    }
  };
  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-primary-foreground from-60% to-indigo-950">
      <FormProvider {...form}>
        <form
          action={form.handleSubmit(onSubmit) as unknown as undefined}
          autoComplete="off"
        >
          <CardForm
            title={"Buat Akun Baru"}
            description={"Sudah mempunyai akun? klik disini."}
          >
            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem className="w-64">
                  <FormLabel>
                    <div className="flex gap-x-2 items-center">
                      <FiUser />
                      <p>Nama Lengkap</p>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="w-64">
                  <FormLabel>
                    <div className="flex gap-x-2 items-center">
                      <FiMail />
                      <p>Email</p>
                    </div>
                  </FormLabel>
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
                <FormItem className="w-64">
                  <FormLabel>
                    <div className="flex gap-x-2 items-center">
                      <FiLock />
                      <p>Password</p>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="w-64">
                  <FormLabel>
                    <div className="flex gap-x-2 items-center">
                      <FiLock />
                      <p>Konfirmasi Password</p>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="w-64">
                  <FormLabel>
                    <div className="flex gap-x-2 items-center">
                      <FiUser />
                      <p>Username</p>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="w-64">
                  <FormLabel>
                    <div className="flex gap-x-2 items-center">
                      <FiPhone />
                      <p>Nomor Telepon</p>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
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
