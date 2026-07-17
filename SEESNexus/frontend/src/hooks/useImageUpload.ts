import { useState, useEffect, useRef } from "react";
import uploadService from "../services/uploadService";
import { formatError } from "../utils/errorHelper";

// Shared upload pattern (article cover images, profile pictures, hardware
// photos): show a local blob preview immediately, and on failure keep it
// visible with a retry instead of clearing it — a failed upload used to
// look like the picked image had silently vanished.
export const useImageUpload = (initialUrl = "") => {
  const [confirmedUrl, setConfirmedUrl] = useState(initialUrl);
  const [localPreviewUrl, setLocalPreviewUrl] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Bumped on every file pick so a slow, superseded upload's response can't
  // clobber state set by a later pick (e.g. user swaps the image mid-upload).
  const requestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const runUpload = async (file: File, requestId: number) => {
    setIsUploading(true);
    setError(null);
    try {
      const { url } = await uploadService.uploadImage(file);
      if (requestIdRef.current !== requestId) return;
      setConfirmedUrl(url);
      setLocalPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return "";
      });
      setPendingFile(null);
    } catch (err) {
      if (requestIdRef.current !== requestId) return;
      setError(formatError(err, "Image upload failed"));
    } finally {
      if (requestIdRef.current === requestId) setIsUploading(false);
    }
  };

  const selectFile = (file: File) => {
    setLocalPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setPendingFile(file);
    runUpload(file, ++requestIdRef.current);
  };

  const retry = () => {
    if (pendingFile) runUpload(pendingFile, ++requestIdRef.current);
  };

  const remove = () => {
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl("");
    setPendingFile(null);
    setConfirmedUrl("");
    setError(null);
  };

  return {
    displayedUrl: localPreviewUrl || confirmedUrl,
    confirmedUrl,
    setConfirmedUrl,
    isUploading,
    isPending: !!pendingFile,
    error,
    selectFile,
    retry,
    remove,
  };
};
