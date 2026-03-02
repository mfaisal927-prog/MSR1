import { getEntryById } from "../../../actions";
import EditClient from "./EditClient";

export const metadata = {
    title: "ترمیم کریں - Malik Sajawal Refreshment",
};

export default async function EditPage({ params }) {
    // Await params since Next.js 15+ enforces it, though 14 it's sometimes fine
    const resolvedParams = await params;
    const entry = await getEntryById(resolvedParams.id);

    if (!entry) {
        return <div className="container center-content">ریکارڈ نہیں ملا</div>;
    }

    return (
        <div className="container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">ریکارڈ میں ترمیم</h1>
            </div>

            <div className="dashboard-content">
                <EditClient entry={entry} />
            </div>
        </div>
    );
}
