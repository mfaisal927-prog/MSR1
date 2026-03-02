import PasteDataClient from "./PasteDataClient";

export const metadata = {
    title: "ڈیٹا پیسٹ کریں - Malik Sajawal Refreshment",
};

export default async function PasteDataPage({ params }) {
    const resolvedParams = await params;

    return (
        <PasteDataClient
            year={resolvedParams.year}
            month={resolvedParams.month}
        />
    );
}
