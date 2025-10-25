import { useCallback } from "react";
import { Upload, FileText } from "lucide-react";
import { toast } from "sonner";

interface ResumeUploaderProps {
  onUpload: (file: File) => void;
  loading: boolean;
}

export const ResumeUploader = ({ onUpload, loading }: ResumeUploaderProps) => {
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        validateAndUpload(file);
      }
    },
    []
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndUpload(file);
    }
  };

  const validateAndUpload = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF or DOCX file");
      return;
    }

    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    onUpload(file);
  };

  return (
    <div
      className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        type="file"
        id="resume-upload"
        className="hidden"
        accept=".pdf,.docx"
        onChange={handleFileChange}
        disabled={loading}
      />

      <label htmlFor="resume-upload" className="cursor-pointer block">
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 rounded-full bg-primary/10">
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            ) : (
              <Upload className="w-8 h-8 text-primary" />
            )}
          </div>

          <div className="space-y-1">
            <p className="font-semibold">
              {loading ? "Parsing your resume..." : "Drop your resume here or click to browse"}
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PDF and DOCX (max 10MB)
            </p>
          </div>

          {!loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>We'll extract your skills, experience, and education automatically</span>
            </div>
          )}
        </div>
      </label>
    </div>
  );
};