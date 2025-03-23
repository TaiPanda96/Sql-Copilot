import { useState, useCallback, useRef } from "react";

type UseDropZoneOptions = {
  onDrop: (files: File[]) => void;
  multiple?: boolean;
  accept?: string[];
};

/**
 * Hook to handle file drag and drop events.
 * useDropZone returns an object with the following properties:
 * - dropZoneRef: A ref to attach to the drop zone element.
 * - fileInputRef: A ref to attach to the file input element.
 * - isDragging: A boolean indicating if a file is being dragged over the drop zone.
 * - handleDragOver: A function to handle the drag over event.
 * - handleDragEnter: A function to handle the drag enter event.
 * - handleDragLeave: A function to handle the drag leave event.
 * - handleDrop: A function to handle the drop event.
 * - handleFileInputChange: A function to handle the file input change event.
 */
export function useDropZone({
  onDrop,
  multiple = true,
  accept = [],
}: UseDropZoneOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
    },
    []
  );

  const handleDragEnter = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
    },
    []
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
    },
    []
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      if (event.dataTransfer && event.dataTransfer.files) {
        let filesArray = Array.from(event.dataTransfer.files);

        // Filter accepted file types if provided
        if (accept.length > 0) {
          filesArray = filesArray.filter(
            (file) =>
              accept.includes(file.type) ||
              accept.some((ext) => file.name.endsWith(ext))
          );
        }

        if (!multiple) {
          filesArray = filesArray.slice(0, 1); // Only keep one file if multiple is false
        }

        if (filesArray.length > 0) {
          onDrop(filesArray);
        }
      }
    },
    [onDrop, multiple, accept]
  );

  // File input handling for manual selection
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        const filesArray = Array.from(event.target.files);
        onDrop(multiple ? filesArray : filesArray.slice(0, 1));
      }
    },
    [onDrop, multiple]
  );

  return {
    dropZoneRef,
    fileInputRef,
    isDragging,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
  };
}
