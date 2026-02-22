"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Initialize the client component
    const supabase = createClient();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            console.error("No file selected.");
            return;
        }

        setIsUploading(true);

        try {
            const timestamp = new Date().getTime();
            const filename = `dbms/${timestamp}_${file.name}`;

            const { data, error } = await supabase.storage
                .from("notes")
                .upload(filename, file);

            if (error) {
                console.error("Error uploading file:", error.message);
            } else {
                console.log("File uploaded successfully:", data);
                // Optionally clear the selection
                setFile(null);
                const fileInput = document.getElementById("file-upload") as HTMLInputElement;
                if (fileInput) fileInput.value = "";
            }
        } catch (err) {
            console.error("Unexpected error during upload:", err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="z-10 w-full max-w-md items-center justify-between font-mono text-sm">
                <h1 className="text-2xl font-bold mb-8 text-center">Upload DBMS Notes</h1>

                <form className="flex flex-col gap-6 bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="file-upload" className="font-semibold">
                            Select PDF File
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileChange}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-900 hover:file:bg-zinc-200 dark:file:bg-zinc-800 dark:file:text-zinc-100 dark:hover:file:bg-zinc-700 cursor-pointer w-full text-zinc-500 dark:text-zinc-400"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-colors"
                    >
                        {isUploading ? "Uploading..." : "Submit"}
                    </button>
                </form>
            </div>
        </main>
    );
}
