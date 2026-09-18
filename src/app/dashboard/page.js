import { getLast6MonthsSummary, getLatestDashboardEntry } from "../actions";
import DashboardClient from "./DashboardClient";

export const metadata = {
    title: "ڈیش بورڈ - Malik Sajawal Refreshment",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const [sixMonthsData, latestEntry] = await Promise.all([
        getLast6MonthsSummary(),
        getLatestDashboardEntry(),
    ]);

    return (
        <DashboardClient sixMonthsData={sixMonthsData} latestEntry={latestEntry} />
    );
}
