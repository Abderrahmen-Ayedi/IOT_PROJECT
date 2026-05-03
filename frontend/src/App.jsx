import { Toaster } from "react-hot-toast";
import DashboardPage from "@/pages/DashboardPage";

export default function App() {
  return (
    <>
      <DashboardPage />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontSize: "12px",
            fontFamily: "Sora, system-ui, sans-serif",
            borderRadius: "8px",
            border: "0.5px solid rgba(0,0,0,0.08)",
          },
        }}
      />
    </>
  );
}
