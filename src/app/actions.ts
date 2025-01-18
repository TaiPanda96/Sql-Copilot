"use server"

import { validateActionInput } from '@sql-copilot/lib/components/use-form-action'
import { createContext } from '@sql-copilot/lib/create-context'
import { getQueryResponseIo } from '@sql-copilot/lib/large-language-models/open-ai/get-open-ai-client'
import { put } from '@vercel/blob'
import { z } from 'zod'


const uploadFileSchema = z.object({
    files: z.array(z.instanceof(File)),
    story: z.string(),
})

export async function uploadFileAction(input: z.input<typeof uploadFileSchema>): Promise<{ success: boolean,  suggestion: string }> {
  const ctx = await createContext(['prisma', 'model'])
  const validation = validateActionInput(input, uploadFileSchema)
  if (!validation.success) {
    return { success: false, suggestion: '' }
  }
  const { files, story } = validation.data
  try {
    if (!files || files.length === 0) {
      throw new Error("No files provided")
    }

    if (!story || typeof story !== "string") {
      throw new Error("No story provided")
    }
    // Process each file
    const processedFiles = await Promise.all(files.map(async (file) => {
      try {
        if (typeof file === 'object' && 'type' in file && file.type.startsWith('image/')) {
          // Upload image to Vercel Blob
          const blob = await put(file.name, file, {
            access: 'public',
            addRandomSuffix: true,
          })
          return {
            type: 'image',
            url: blob.url,
            name: file.name
          }
        } else {
          // Process CSV/Excel file
          const text = await file.text()
          // TODO: Add more sophisticated CSV/Excel parsing logic here
          return {
            type: 'data',
            content: text,
            name: file.name
          }
        }
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError)
        throw new Error(`Failed to process file ${file.name}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`)
      }
    }))

    // Generate visualization suggestions using Open AI
    const suggestedVisualizationResponseFile = getQueryResponseIo(ctx, {
      query: story,
      // TODO: this should be "context"
      messageHistory: processedFiles.map(file => file.name)
    })

    // TODO: Implement actual visualization generation logic here
    // This could involve using a library like D3.js or Chart.js

    // TODO: Store the processed data and AI suggestion in a database
    // This is where you'd implement your storage solution

    let suggestion = ''
    for await (const chunk of suggestedVisualizationResponseFile) {
      suggestion += chunk
    }
    
    return { 
      success: true,
      suggestion: suggestion
    }
  } catch (error) {
    console.error('Error processing files:', error)
    return { 
      success: false, 
      suggestion: `Error processing files: ${error instanceof Error ? error.message : 'An unknown error occurred while processing files'}`
    }
  }
}

