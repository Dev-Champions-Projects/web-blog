import { getCounts } from "@/actions/admin/getCounts";
import Heading from "../common/Heading";
import Alert from "../common/Alert";

const AdminDashboard = async () => {
    const res = await getCounts()

    const userCount = res.success?.userCount ? res.success?.userCount : 0
    const blogCount = res.success?.blogCount ? res.success?.blogCount : 0

    if (res.error) return <Alert error message={res.error} />

    return (<div>
        <Heading title="Analytics" center lg />
        <div className="flex items-center flex-wrap justify-center mt-12 gap-12">
            <div className="flex flex-col gap-2 items-center border rounded-sm px-12 py-8 text-4xl">
                <span className="font-bold">{userCount}</span>
                <span>Users</span>
            </div>
            <div className="flex flex-col gap-2 items-center border rounded-sm px-12 py-8 text-4xl">
                <span className="font-bold">{blogCount}</span>
                <span>Blogs</span>
            </div>
        </div>
    </div>);
}

export default AdminDashboard;