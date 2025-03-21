"use client"

import React from 'react'

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import { Calendar } from '@/components/ui/calendar'

import { jobSchema } from '@/schema'
import { useGetClientsQuery, useGetMachineListQuery, useGetRouteQuery } from '@/store/api'
import Loading from '@/components/ui/loading'

import { useCreateJobMutation } from '@/store/api'
import { useToast } from '@/hooks/use-toast'
import { skipToken } from '@reduxjs/toolkit/query'

const CreateJobForm = () => {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      client: "",
      area: "",
      dateSurveyed: new Date(),
      jobNo: "",
      poNo: "",
      woNo: "",
      reportNo: "",
      jobDescription: "",
      method: "",
      inspector: "",
      inspectionRoute: "",
      equipmentUse: "",
      dateRegistered: new Date(),
      yearWeekNo: ""
    },
  })

  const selectedClient = form.watch("client");

  const { data: routeData, isLoading: routeLoading, isFetching: routeFetching } = useGetRouteQuery( selectedClient ? selectedClient : skipToken, {
    refetchOnMountOrArgChange: true,
  });
  const routes = routeData?.routes || []

  const [createJob, { isLoading: createJobLoading }] = useCreateJobMutation()

  const { data: clientData, isLoading: clientLoading} = useGetClientsQuery();
  const clients = clientData?.clients || []

  const { data: areaData, isLoading: areaLoading } = useGetMachineListQuery()
  const areas = areaData?.areas || []
    
    async function onSubmit(values: z.infer<typeof jobSchema>) {
     try {

      const formattedValues = {
        ...values,
        dateSurveyed: new Date(values.dateSurveyed),
        dateRegistered: new Date(values.dateRegistered),
      };

      const response = await createJob(formattedValues).unwrap()
      
      if(!response.success) {
        throw new Error(response.message)
      }
      toast({
        title: "Success",
        description: response.message,
      });
      form.reset()
     } catch (error) {
      const err = error as { data?: { message?: string } };
      toast({
        title: "Error",
        description: err.data?.message || "An unexpected error occurred.",
      });
     }
    }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="gap-3 mt-10 flex flex-col">
        <div className='flex md:flex-row flex-col gap-3 w-full'>
        <FormField
            control={form.control}
            name="client"
            render={({ field }) => (
                <FormItem className='"w-full md:w-1/2'>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ""}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={clientLoading ? 'Loading...' : 'Select a client'} />
                            </SelectTrigger>
                        </FormControl>
                        <FormMessage />
                        <SelectContent>
                          <div className='flex flex-col max-h-[200px] overflow-auto'>
                          {clientLoading ? <div><Loading/></div> : clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                          </div>
                        </SelectContent>
                    </Select>
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="area"
            render={({ field }) => (
                <FormItem className='"w-full md:w-1/2'>
                    <FormLabel>Area</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ""}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={areaLoading ? 'Loading...' : 'Select an Area'} />
                            </SelectTrigger>
                        </FormControl>
                        <FormMessage />
                        <SelectContent>
                        <div className='flex flex-col max-h-[200px] overflow-auto'>
                          {areaLoading ? <div><Loading/></div> : areas.map((area) => (
                            <SelectItem key={area.id} value={area.name}>
                              {area.name}
                            </SelectItem>
                          ))}
                          </div>
                        </SelectContent>
                    </Select>
                </FormItem>
            )}
            />
        </div>
        <div className='flex md:flex-row flex-col gap-3 w-full'>
        <FormField
          control={form.control}
          name="dateSurveyed"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <FormLabel>Date Surveyed</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full md:w-1/2 pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <FormMessage />
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
          />
          <div className='md:flex hidden'></div>
        </div>
        <h1 className='my-5 text-sm text-zinc-700'>Enter the following information</h1>
        <div className='flex md:flex-row flex-col gap-3 w-full'>
        <FormField
          control={form.control}
          name="jobNo"
          render={({ field }) => (
            <FormItem className='w-full md:w-1/2'>
              <FormLabel>Job Number</FormLabel>
              <FormControl>
                <Input className='text-sm' placeholder="Enter your job number..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="poNo"
          render={({ field }) => (
            <FormItem className='w-full md:w-1/2'>
              <FormLabel>PO Number</FormLabel>
              <FormControl>
                <Input className='text-sm' placeholder="Enter your PO number..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <div className='flex md:flex-row flex-col gap-3 w-full'>
        <FormField
          control={form.control}
          name="woNo"
          render={({ field }) => (
            <FormItem className='w-full md:w-1/2'>
              <FormLabel>WO Number</FormLabel>
              <FormControl>
                <Input className='text-sm' placeholder="Enter your WO number..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reportNo"
          render={({ field }) => (
            <FormItem className='w-full md:w-1/2'>
              <FormLabel>Report Number</FormLabel>
              <FormControl>
                <Input className='text-sm' placeholder="Enter your report number..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <div className='flex md:flex-row flex-col gap-3 w-full'>
        <FormField
          control={form.control}
          name="jobDescription"
          render={({ field }) => (
            <FormItem className='w-full'>
              <FormLabel>Job Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter your job description" {...field} className='resize-none text-sm'/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <h1 className='text-sm text-zinc-700 my-5'>Important Information</h1>
        <div className='flex md:flex-row flex-col gap-3 w-full'>
        <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
                <FormItem className='"w-full md:w-1/2'>
                    <FormLabel>Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ""}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                        </FormControl>
                        <FormMessage />
                        <SelectContent>
                            <SelectItem value="client1">Method 1</SelectItem>
                            <SelectItem value="client2">Method 2</SelectItem>
                            <SelectItem value="client3">Method 3</SelectItem>
                        </SelectContent>
                    </Select>
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="inspector"
            render={({ field }) => (
                <FormItem className='"w-full md:w-1/2'>
                    <FormLabel>Inspector</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ""}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an inspector" />
                            </SelectTrigger>
                        </FormControl>
                        <FormMessage />
                        <SelectContent>
                            <SelectItem value="client1">Inspector 1</SelectItem>
                            <SelectItem value="client2">Inspector 2</SelectItem>
                            <SelectItem value="client3">Inspector 3</SelectItem>
                        </SelectContent>
                    </Select>
                </FormItem>
            )}
            />
        </div>
        <div className='flex md:flex-row flex-col gap-3 w-full '>
        <FormField
          control={form.control}
          name="inspectionRoute"
          render={({ field }) => (
            <FormItem className='w-full md:w-1/2'>
              <FormLabel>Inspection Route</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ""} disabled={!form.watch("client")}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={routeLoading || routeFetching ? 'Loading...' : 'Select client first'} />
                            </SelectTrigger>
                        </FormControl>
                        <FormMessage />
                        <SelectContent>
                        <div className='flex flex-col max-h-[200px] overflow-auto'>
                          {routeLoading || routeFetching ? <div><Loading/></div> : 
                          routes.length === 0 ? <div className='w-full py-5'>
                            <h1 className='font-bold text-3xl text-zinc-300 text-center'>No Routes Found</h1>
                          </div> : 
                          routes.map((route) => (
                            <SelectItem key={route.id} value={route.id}>
                              {route.routeName}
                            </SelectItem>
                          ))}
                          </div>
                        </SelectContent>
                    </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="equipmentUse"
            render={({ field }) => (
                <FormItem className='"w-full md:w-1/2'>
                    <FormLabel>Equipment Use</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value || ""}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a route first"/>
                            </SelectTrigger>
                        </FormControl>
                        <FormMessage />
                        <SelectContent>
                            <SelectItem value="client1">Equipment 1</SelectItem>
                            <SelectItem value="client2">Equipment 2</SelectItem>
                            <SelectItem value="client3">Equipment 3</SelectItem>
                        </SelectContent>
                    </Select>
                </FormItem>
            )}
            />
        </div>
        <div className='flex md:flex-row flex-col gap-3 w-full'>
        <FormField
          control={form.control}
          name="dateRegistered"
          render={({ field }) => (
            <FormItem className="flex flex-col w-full">
              <FormLabel className='mt-[10px]'>Date Registered</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                  
                </PopoverTrigger>
                <FormMessage />
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
          />
          <FormField
          control={form.control}
          name="yearWeekNo"
          render={({ field }) => (
            <FormItem className='w-full'>
              <FormLabel>Year and Week Number</FormLabel>
              <FormControl>
                <Input className='text-sm' placeholder="Enter year/week number..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <Button disabled={createJobLoading} className='w-fit bg-main mt-5 hover:bg-follow'>{createJobLoading ? 'Creating...' : 'Submit'}</Button>
        </form>
    </Form>
  )
}

export default CreateJobForm