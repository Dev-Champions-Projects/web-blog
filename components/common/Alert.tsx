import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { BiError } from "react-icons/bi";
import {
  IoIosCheckmarkCircleOutline,
  IoIosInformationCircleOutline,
} from "react-icons/io";

const Alert = ({
  success,
  error,
  message,
}: {
  success?: boolean;
  error?: boolean;
  message: ReactNode;
}) => {
  return (
    <div
      className={cn(
        "my-2 flex items-center gap-2 p-3 rounded-md border",
        success &&
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900 dark:text-emerald-100",
        error &&
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-100",
        !success &&
          !error &&
          "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
      )}
    >
      <span>
        {success && <IoIosCheckmarkCircleOutline size={20} />}
        {error && <BiError size={20} />}
        {!success && !error && <IoIosInformationCircleOutline size={20} />}
      </span>
      {message}
    </div>
  );
};

export default Alert;
