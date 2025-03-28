import CreateJobForm from '@/components/container/form/CreateJob'
import React from 'react'

const CreateJob = () => {
  return (
    <div className='w-full p-3 sm:p-5 flex'>
      <div className='w-full h-full p-5 bg-white rounded-xl '>
        <h1 className='text-xl sm:text-2xl font-bold'>Create a Job</h1>
        <div className='flex-col flex mt-5'>
          <h1 className='text-base sm:text-xl font-semibold'>New Job Record</h1>
          <h1 className='text-xs sm:text-sm text-zinc-700'>Tell us about your job information.</h1>
        </div>
        <CreateJobForm/>
      </div>
    </div>
  )
}

export default CreateJob