import { FileText, UploadCloud } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const FileDropzone = ({ file, onFileSelect }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) {
        onFileSelect(acceptedFiles[0]);
      }
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`glass-panel-strong cursor-pointer border-dashed p-8 text-center transition ${
        isDragActive ? 'scale-[1.01] border-teal-500/40 bg-teal-500/10' : ''
      }`}
    >
      <input {...getInputProps()} />
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-accent">
        <UploadCloud size={28} />
      </div>
      <h3 className="mt-4 font-heading text-2xl font-semibold text-text">Drop your PDF resume here</h3>
      <p className="mt-2 text-sm text-text-soft">
        Drag and drop a resume file or click to browse. PDF only, up to 5 MB.
      </p>

      {file ? (
        <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-border bg-white/40 px-4 py-3 text-left dark:bg-white/5">
          <FileText className="text-accent" size={18} />
          <div>
            <p className="text-sm font-semibold text-text">{file.name}</p>
            <p className="text-xs text-text-soft">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FileDropzone;
