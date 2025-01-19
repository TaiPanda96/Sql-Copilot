import classNames from "classnames";
import {
  ChangeEvent,
  DragEvent,
  ReactNode,
  RefObject,
  createRef,
  useCallback,
  useState,
} from "react";
import { Inline } from "./inline";
import { Text } from "./text";
import { LoaderCircle } from "lucide-react";
import { cn } from "shadcn/lib/utils";
import { Input } from "./input";

export interface BaseFileInputProps {
  value?: never;
  fileName?: string;
  error?: string;
  children?: ReactNode;
  inputRef?: RefObject<HTMLInputElement>;
  loading?: boolean;
}

interface DataUriFileInputProps {
  onChange?: (input: { file: File; dataURI: string }) => void;
  useDataURI?: true;
}

interface NoDataUriFileInputProps {
  onChange?: (input: { file: File }) => void;
  useDataURI: false;
}

export type FileInputProps = BaseFileInputProps &
  (DataUriFileInputProps | NoDataUriFileInputProps);

/**
 * @deprecated Use the higher-level, upload-based FileUploadInput instead
 */
export function FileInput({
  value,
  fileName,
  onChange,
  error,
  children,
  inputRef,
  useDataURI,
  loading,
  ...inputProps
}: FileInputProps) {
  inputRef = inputRef || createRef<HTMLInputElement>();
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleFile = useCallback(
    (file: File | null) => {
      if (!onChange || !file) {
        return;
      }

      if (useDataURI === false) {
        // Force the type, since we know that useDataURI is false
        (onChange as (input: { file: File }) => void)({ file });
        return;
      }

      const reader = new FileReader();

      reader.onload = (loadEvent) => {
        const dataURI = loadEvent.target?.result as string;
        onChange({ file, dataURI });
      };

      reader.readAsDataURL(file);
    },
    [onChange, useDataURI]
  );

  const handleChange = useCallback(
    (event?: ChangeEvent<HTMLInputElement>) => {
      if (!inputRef) {
        return;
      }
      const file = inputRef.current?.files ? inputRef.current.files[0] : null;
      handleFile(file);
    },
    [handleFile, inputRef]
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDraggingOver(false);
      if (inputRef && inputRef.current && event.dataTransfer.files.length > 0) {
        inputRef.current.files = event.dataTransfer.files;
        handleChange();
      }
    },
    [inputRef, handleChange]
  );

  return (
    <Input {...inputProps}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={classNames(
          "py-8",
          "px-16",
          "flex",
          "flex-col",
          "items-center",
          "gap-4",
          "cursor-pointer",
          {
            "bg-gray-100": isDraggingOver,
            "bg-gray-50": !isDraggingOver,
          },
          { "border-red-600": error },
          "border-gray-50"
        )}
      >
        {loading ? (
          <Inline>
            <LoaderCircle className={cn("animate-spin")} />
            <Text value="Uploading..." />
          </Inline>
        ) : fileName ? (
          <Text value={fileName} />
        ) : (
          <Text value="Drop here, or click to select." color="regular" />
        )}
      </div>
      <input
        type="file"
        onChange={handleChange}
        ref={inputRef}
        className="invisible absolute"
      />
      {children}
    </Input>
  );
}
