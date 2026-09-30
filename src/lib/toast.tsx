import { toast } from "sonner";
import { FaCircleCheck, FaCircleXmark } from "react-icons/fa6";
import { cn } from "./utils";

export const toastSuccess = (title: string, desc: string) => {
  toast.custom((t) => (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border border-green-400 bg-green-100 px-4 py-3 text-green-800 shadow",
        "w-full md:w-[400px]",
      )}
      onClick={() => toast.dismiss(t)}
    >
      <FaCircleCheck className="h-5 w-5 text-green-600" />
      <div>
        <p className="font-bold">{title}</p>
        <p className="text-sm">{desc}</p>
      </div>
    </div>
  ));
};

export const toastError = (title: string, desc: string) => {
  toast.custom((t) => (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border border-red-400 bg-red-100 px-4 py-3 text-red-800 shadow",
        "w-full md:w-[400px]",
      )}
      onClick={() => toast.dismiss(t)}
    >
      <FaCircleXmark className="h-5 w-5 text-red-600" />
      <div>
        <p className="font-bold">{title}</p>
        <p className="text-sm">{desc}</p>
      </div>
    </div>
  ));
};
