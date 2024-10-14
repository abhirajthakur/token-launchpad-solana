import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => (
  <Alert
    className={`mb-2 ${type === "success" ? "bg-green-100" : "bg-red-100"}`}
  >
    <AlertTitle
      className={type === "success" ? "text-green-800" : "text-red-800"}
    >
      {type === "success" ? "Success" : "Error"}
    </AlertTitle>
    <AlertDescription
      className={type === "success" ? "text-green-700" : "text-red-700"}
    >
      {message}
    </AlertDescription>
    <Button
      onClick={onClose}
      className="absolute top-2 right-2 p-0 h-auto bg-transparent hover:bg-transparent"
    >
      <X
        size={18}
        className={type === "success" ? "text-green-800" : "text-red-800"}
      />
    </Button>
  </Alert>
);
