import { cn } from "@/lib/utils";
import { BiError } from "react-icons/bi"
import { IoIosCheckmarkCircleOutline, IoIosInformationCircleOutline } from "react-icons/io"

const Alert = ({ success, error, message }: { success?: boolean, error?: boolean, message: string }) => {
    return (<div className={cn('my-2 flex items-center gap-2 p-3 rounded-md',
        success && "bg-green-100 text-green-500",
        error && "bg-rose-100 text-rose-500",
        !success && !error && "bg-blue-100 text-blue-500"
    )}>
        <span>
            {success && <IoIosCheckmarkCircleOutline size={20} />}
            {error && <BiError size={20} />}
            {!success && !error && <IoIosInformationCircleOutline size={20} />}
        </span>
        {message}
    </div>);
}

export default Alert;