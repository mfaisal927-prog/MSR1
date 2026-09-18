import { getEntries } from "../actions";
import RecordsClient from "./RecordsClient";

export const metadata = {
    title: "تمام ریکارڈز - Malik Sajawal Refreshment",
};

export const dynamic = "force-dynamic";

export default async function RecordsPage() {
    const entries = await getEntries();

    return (
        <div className="container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">تمام ریکارڈز</h1>
                <p className="dashboard-subtitle">گزشتہ اندراجات کی تفصیلات</p>
            </div>

            <div className="dashboard-content">
                <RecordsClient initialEntries={entries} />
            </div>
        </div>
    );
}
