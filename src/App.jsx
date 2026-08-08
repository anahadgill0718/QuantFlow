import FinanceDashboard from "./FinanceDashboard";
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <>
      <FinanceDashboard />
      <Analytics />
    </>
  );
}