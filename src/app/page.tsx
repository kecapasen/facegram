"use client";
import React from "react";
import { useUser } from "@/store/stores";
const TableDemo = () => {
  const user = useUser() as any;
  return <p>Hello {user.user?.fullname}</p>;
};
export default TableDemo;
