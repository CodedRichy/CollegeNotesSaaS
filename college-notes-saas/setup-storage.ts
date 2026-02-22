import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function setup() {
    const { data: buckets, error: getError } = await supabase.storage.listBuckets()
    if (getError) {
        console.error('Error fetching buckets:', getError)
        process.exit(1)
    }

    const notesBucketExists = buckets.some(b => b.name === 'notes')

    if (!notesBucketExists) {
        console.log('Bucket "notes" not found. Creating...')
        const { data, error: createError } = await supabase.storage.createBucket('notes', {
            public: true, // make bucket public
            allowedMimeTypes: ['application/pdf'],
        })

        if (createError) {
            console.error('Failed to create bucket:', createError)
            process.exit(1)
        }

        console.log('Bucket "notes" created successfully!')
    } else {
        console.log('Bucket "notes" already exists.')

        // Attempt to update it to public just in case
        const { data, error: updateError } = await supabase.storage.updateBucket('notes', {
            public: true,
            allowedMimeTypes: ['application/pdf']
        })
        if (updateError) {
            console.error('Failed to make bucket public:', updateError)
        } else {
            console.log('Ensured bucket is public and only allows PDFs.')
        }
    }
}

setup()
