import AppRoutes from "./routes"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import { Toaster } from "./components/ui/toaster" 

export default function App() {
  return ( 
    <TooltipProvider>
      <AppRoutes /> 
      <Toaster /> 
    </TooltipProvider>
  )
}