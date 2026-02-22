"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface FileEntry {
    name: string;
    id: string;
    updated_at: string;
    url?: string;
}

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [files, setFiles] = useState<FileEntry[]>([]);

    // Initialize the client component
    const supabase = createClient();

    const fetchFiles = async () => {
        try {
            const { data, error } = await supabase.storage
                .from("notes")
                .list("dbms");

            if (error) {
                console.error("Error fetching files:", error);
                return;
            }

            if (data) {
                // Filter out empty placeholder entries sometimes returned by Supabase
                const pdfFiles = data.filter(f => f.name !== '.emptyFolderPlaceholder' && f.name.endsWith('.pdf'));

                // Construct public URLs for each file
                const filesWithUrls = pdfFiles.map(f => {
                    const { data: urlData } = supabase.storage
                        .from("notes")
                        .getPublicUrl(`dbms/${f.name}`);

                    return {
                        ...f,
                        url: urlData.publicUrl
                    };
                });

                // Sort by latest updated
                filesWithUrls.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
                setFiles(filesWithUrls);
            }
        } catch (err) {
            console.error("Failed to fetch files:", err);
        }
    };

    // Fetch files on initial mount
    useEffect(() => {
        fetchFiles();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setMessage(null); // Clear previous messages on new selection
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage({ type: 'error', text: "No file selected." });
            return;
        }

        setIsUploading(true);
        setMessage(null);

        try {
            const timestamp = new Date().getTime();
            const filename = `dbms/${timestamp}_${file.name}`;

            const { data, error } = await supabase.storage
                .from("notes")
                .upload(filename, file);

            if (error) {
                setMessage({ type: 'error', text: `Error: ${error.message}` });
            } else {
                setMessage({ type: 'success', text: "File uploaded successfully!" });
                // Clean up selection
                setFile(null);
                const fileInput = document.getElementById("file-upload") as HTMLInputElement;
                if (fileInput) fileInput.value = "";

                // Refresh file list
                fetchFiles();
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: `Unexpected error: ${err.message || String(err)}` });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-start py-24 px-4 sm:px-8">
            <div className="z-10 w-full max-w-2xl flex flex-col items-center gap-12 font-mono text-sm">

                <div className="w-full max-w-md">
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

                        {message && (
                            <div className={`p-3 rounded-md text-center font-semibold ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                {message.text}
                            </div>
                        )}
                    </form>
                </div>

                <div className="w-full">
                    <h2 className="text-xl font-bold mb-4">Uploaded Files</h2>
                    {files.length === 0 ? (
                        <p className="text-zinc-500">No DBMS notes have been uploaded yet.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {files.map((f) => (
                                <div key={f.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                    <span className="truncate mr-4 font-medium" title={f.name}>
                                        {/* Remove the timestamp from display name visually if desired, though we'll just show the raw name for now */}
                                        {f.name.replace(/^dbms\//, '')}
                                    </span>
                                    <a
                                        href={f.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold px-3 py-1 rounded bg-blue-100/50 dark:bg-blue-900/20 whitespace-nowrap transition-colors"
                                    >
                                        View
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
