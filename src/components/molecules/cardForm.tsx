"use client";
import * as React from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "../ui/separator";
import { ReloadIcon } from "@radix-ui/react-icons";
const CardForm = ({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) => {
  const data = useFormStatus();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <Separator />
      </CardHeader>
      <CardContent>
        <div className="grid grid-rows-4 grid-flow-col gap-y-4 gap-x-8">
          {children}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button disabled={data.pending} type="submit">
          {data.pending ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              <p>Please wait</p>
            </>
          ) : (
            <p>Submit</p>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
export default CardForm;
