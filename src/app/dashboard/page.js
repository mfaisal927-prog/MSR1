import { getLast6MonthsSummary } from "../actions";
import DashboardClient from "./DashboardClient";

export const metadata = {
    title: "ڈیش بورڈ - Malik Sajawal Refreshment",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const sixMonthsData = await getLast6MonthsSummary();

    return (
        <DashboardClient sixMonthsData={sixMonthsData} />
    );
}
