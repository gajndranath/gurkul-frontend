import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "../../../components/ui/skeleton";
import { fetchLibraryProfile, updateLibraryProfile } from "./api/libraryApi";

import { useToast } from "../../../hooks/useToast";
import { Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Separator } from "../../../components/ui/separator";

// Validation Schema
const librarySchema = z.object({
  name: z.string().min(3, "Library name must be at least 3 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  logoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  gracePeriodDays: z.coerce.number().min(0, "Must be positive"),
  lateFeePerDay: z.coerce.number().min(0, "Must be positive"),
});

type LibraryFormValues = z.infer<typeof librarySchema>;

const LibrarySettingsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();

  // Fetch Data
  const { data: library, isLoading } = useQuery({
    queryKey: ["libraryProfile"],
    queryFn: fetchLibraryProfile,
  });

  // Form Setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LibraryFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(librarySchema) as any,
  });

  // Populate Form
  useEffect(() => {
    if (library) {
      reset({
        name: library.name,
        email: library.email || "",
        phone: library.phone || "",
        address: library.address || "",
        website: library.website || "",
        logoUrl: library.logoUrl || "",
        gracePeriodDays: library.settings?.gracePeriodDays || 0,
        lateFeePerDay: library.settings?.lateFeePerDay || 0,
      });
    }
  }, [library, reset]);

  // Mutation
  const mutation = useMutation({
    mutationFn: (values: LibraryFormValues) => {
      // Structure nested settings for API
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiPayload: any = { ...values };
      delete apiPayload.gracePeriodDays;
      delete apiPayload.lateFeePerDay;
      apiPayload.settings = {
        gracePeriodDays: Number(values.gracePeriodDays),
        lateFeePerDay: Number(values.lateFeePerDay),
      };
      return updateLibraryProfile(apiPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["libraryProfile"] });
      success("Settings Updated", "Library profile has been updated successfully.");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toastError("Error", err.response?.data?.message || "Failed to update settings");
    },
  });

  const onSubmit = (data: LibraryFormValues) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
        <Separator />
        <div className="space-y-4">
           <Skeleton className="h-[40px] w-[300px]" />
           <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Library Settings</h2>
          <p className="text-muted-foreground">
            Manage your library identity and business rules.
          </p>
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General Info</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="rules">Business Rules</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Global Information</CardTitle>
                <CardDescription>
                  Basic details about your library visible to students.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Library Name</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input id="email" {...register("email")} />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input id="phone" {...register("phone")} />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" {...register("address")} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Branding & Identity</CardTitle>
                <CardDescription>
                  Customize how your library looks to users.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input id="logoUrl" placeholder="https://..." {...register("logoUrl")} />
                  {errors.logoUrl && (
                    <p className="text-sm text-red-500">{errors.logoUrl.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Link to your hosted logo image.
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input id="website" placeholder="https://..." {...register("website")} />
                  {errors.website && (
                    <p className="text-sm text-red-500">{errors.website.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Business Rules</CardTitle>
                <CardDescription>
                  Configure automated fees and limits.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="gracePeriodDays">Grace Period (Days)</Label>
                    <Input 
                      id="gracePeriodDays" 
                      type="number" 
                      {...register("gracePeriodDays")} 
                    />
                    <p className="text-xs text-muted-foreground">
                      Days after due date before late fee applies.
                    </p>
                    {errors.gracePeriodDays && (
                      <p className="text-sm text-red-500">{errors.gracePeriodDays.message}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="lateFeePerDay">Late Fee (₹ per Day)</Label>
                    <Input 
                      id="lateFeePerDay" 
                      type="number" 
                      {...register("lateFeePerDay")} 
                    />
                    {errors.lateFeePerDay && (
                      <p className="text-sm text-red-500">{errors.lateFeePerDay.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end mt-6">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
};

export default LibrarySettingsPage;
