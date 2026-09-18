import { getEntries } from "../actions";
import ReportsClient from "./ReportsClient";

export const metadata = {
    title: "رپورٹس - Malik Sajawal Refreshment",
};

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
    const entries = await getEntries();

    return (
        <div className="container">
            <div className="dashboard-header">
                <h1 className="dashboard-title">رپورٹس</h1>
                <p className="dashboard-subtitle">کاروبار کا ماہانہ اور مجموعی جائزہ</p>
            </div>

            <div className="dashboard-content">
                <ReportsClient entries={entries} />
            </div>
        </div>
    );
}
