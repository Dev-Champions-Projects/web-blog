import { auth } from "@/auth";
import AdminDashboard from "@/components/admin/AdminDashboard";
import Alert from "@/components/common/Alert";
import Container from "@/components/layout/Container"

const Admin = async () => {

    const session = await auth();

    const isAdmin = session?.user.role === "ADMIN"

    if (!isAdmin) return <Container>
        <Alert error message="Access Denied" />
    </Container>

    return (<Container>
        <AdminDashboard />
    </Container>);
}

export default Admin;