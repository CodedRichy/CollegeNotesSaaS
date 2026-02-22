"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface FileEntry {
    name: string;
    id: string;
    updated_at: string;
    url?: string;
    unit: string;
}

const UNITS = ["Module 1", "Module 2", "Module 3", "Module 4"];

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [unit, setUnit] = useState<string>(UNITS[0]); // Default to Module 1
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [filesByUnit, setFilesByUnit] = useState<Record<string, FileEntry[]>>({});

    // Initialize the client component
    const supabase = createClient();

    const fetchFiles = async () => {
        try {
            const groupedFiles: Record<string, FileEntry[]> = {};

            // We iterate through all units since we don't have a reliable recursive 'list all' in supabase-js for deeply nested without search
            for (const u of UNITS) {
                const folderPath = `dbms/${u.toLowerCase().replace(' ', '-')}`;
                const { data, error } = await supabase.storage
                    .from("notes")
                    .list(folderPath);

                if (error) {
                    console.error(`Error fetching files for ${u}:`, error);
                    continue;
                }

                if (data) {
                    // Filter out empty placeholder entries sometimes returned by Supabase
                    const pdfFiles = data.filter(f => f.name !== '.emptyFolderPlaceholder' && f.name.endsWith('.pdf'));

                    // Construct public URLs for each file
                    const filesWithUrls = pdfFiles.map(f => {
                        const { data: urlData } = supabase.storage
                            .from("notes")
                            .getPublicUrl(`${folderPath}/${f.name}`);

                        return {
                            ...f,
                            url: urlData.publicUrl,
                            unit: u
                        };
                    });

                    // Sort unit array by latest updated
                    filesWithUrls.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

                    if (filesWithUrls.length > 0) {
                        groupedFiles[u] = filesWithUrls;
                    }
                }
            }

            setFilesByUnit(groupedFiles);
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

    const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setUnit(e.target.value);
        setMessage(null);
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
            const unitSlug = unit.toLowerCase().replace(' ', '-');
            const filename = `dbms/${unitSlug}/${timestamp}_${file.name}`;

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
            <div className="z-10 w-full max-w-3xl flex flex-col items-center gap-12 font-mono text-sm">

                <div className="w-full max-w-md">
                    <h1 className="text-2xl font-bold mb-8 text-center">Upload DBMS Notes</h1>

                    <form className="flex flex-col gap-6 bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800">

                        <div className="flex flex-col gap-2">
                            <label htmlFor="unit-select" className="font-semibold">
                                DBMS Unit
                            </label>
                            <select
                                id="unit-select"
                                value={unit}
                                onChange={handleUnitChange}
                                className="w-full py-2 px-3 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-zinc-900 dark:text-zinc-100"
                            >
                                {UNITS.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>

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
                    <h2 className="text-2xl font-bold mb-6 text-center sm:text-left">Uploaded Files</h2>
                    {Object.keys(filesByUnit).length === 0 ? (
                        <p className="text-zinc-500 text-center sm:text-left">No DBMS notes have been uploaded yet.</p>
                    ) : (
                        <div className="flex flex-col gap-8">
                            {UNITS.map(u => {
                                const files = filesByUnit[u];
                                if (!files || files.length === 0) return null;

                                return (
                                    <div key={u} className="flex flex-col gap-3">
                                        <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800 pb-2">{u}</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {files.map((f) => (
                                                <div key={f.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                                                    <span className="truncate mr-4 font-medium" title={f.name}>
                                                        {f.name}
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
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
}
